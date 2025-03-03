import { ResizerPosition, Resizer } from './resizer';
import { EventEmitter } from '../event-emitter/event-emitter';
import { EVENTS } from '../event-emitter/events';
import { ItemSchema } from './window-manager';
import { Header } from './header/header';
import { uuid } from '../utils';
import { ResizeBoundsProcessor } from '../processors/resize-bounds-processor';
import { DragBoundsProcessor } from '../processors/drag-bounds-processor';
import {
  PresetBound,
  PresetBoundsProcessor,
} from '../processors/preset-bounds-processor';
import { SnapProcessor } from '../processors/snap-processor';
import { Snap } from '../processors/types';

export type WindowOptions = {
  snapThreshold: number;
  minWindowWidth: number;
  minWindowHeight: number;
};

export type WindowBounds = {
  width: number;
  height: number;
  left: number;
  top: number;
};

export class Window extends EventEmitter {
  private schema: ItemSchema;
  private root: HTMLElement;
  private element: HTMLElement;
  private bounds: WindowBounds;
  private index: number;
  private options: WindowOptions;
  private header: Header;
  private resizer: Resizer;
  private resizeBoundsProcessor: ResizeBoundsProcessor;
  private dragBoundsProcessor: DragBoundsProcessor;
  private presetBoundsProcessor: PresetBoundsProcessor;
  private snapProcessor: SnapProcessor;
  private minWidth: number;
  private minHeight: number;
  private snap: Snap | undefined = undefined;
  private uid = uuid();

  constructor(
    schema: ItemSchema,
    root: HTMLElement,
    index: number,
    options: WindowOptions
  ) {
    super();
    this.schema = schema;
    this.root = root;
    this.bounds = {
      width: schema.width,
      height: schema.height,
      left: schema.position[0],
      top: schema.position[1],
    };
    this.index = index;
    this.options = options;
    this.element = this.createElement();
    this.header = this.createHeader();
    this.resizer = this.createResizer();
    this.resizeBoundsProcessor = new ResizeBoundsProcessor(this.root);
    this.dragBoundsProcessor = new DragBoundsProcessor(
      this.root,
      this.element,
      this.options
    );
    this.presetBoundsProcessor = new PresetBoundsProcessor();
    this.snapProcessor = new SnapProcessor(this.root, {
      snapThreshold: this.options.snapThreshold,
    });
    this.minWidth = options.minWindowWidth;
    this.minHeight = options.minWindowHeight;
    this.updateElementBounds(this.bounds);
    this.mount();
  }

  private createElement() {
    const element = document.createElement('div');
    element.className = 'wm-window';
    element.style.zIndex = `${this.index}`;
    element.addEventListener('mousedown', () => {
      this.emit(EVENTS.SELECT_WINDOW, this.uid);
    });
    return element;
  }

  private createHeader() {
    const header = new Header(this.schema, this.element);
    header.on(EVENTS.CLOSE_WINDOW, this.onClose);
    header.on(EVENTS.EXPAND, this.onExpand);
    header.on(EVENTS.DRAG_START, this.onDragStart);
    header.on(EVENTS.DRAG, this.onDrag);
    header.on(EVENTS.DRAG_END, this.onDragEnd);
    return header;
  }

  private createResizer() {
    const resizer = new Resizer(this.schema, this.element);
    resizer.on(EVENTS.RESIZE_START, this.onResizeStart);
    resizer.on(EVENTS.RESIZE, this.onResize);
    resizer.on(EVENTS.RESIZE_END, this.onResizeEnd);
    return resizer;
  }

  private mount() {
    this.mountCtor();
    this.mountToRoot();
  }

  private mountCtor() {
    if (this.schema.ctor) {
      const content = this.schema.ctor(this);
      content.classList.add('wm-window-content');
      this.element.insertAdjacentElement('beforeend', content);
    }
  }

  private mountToRoot() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private setBounds(bounds: WindowBounds) {
    this.bounds.width = bounds.width;
    this.bounds.height = bounds.height;
    this.bounds.left = bounds.left;
    this.bounds.top = bounds.top;
  }

  private updateElementBounds(bounds: WindowBounds) {
    this.element.style.width = `${bounds.width}%`;
    this.element.style.height = `${bounds.height}%`;
    this.element.style.left = `${bounds.left}%`;
    this.element.style.top = `${bounds.top}%`;
  }

  private handleMaximized() {
    this.resizer.setAvailability(false);
    this.header.setAvailability(false);
    const { bounds } = this.presetBoundsProcessor.getBounds(
      PresetBound.Maximized
    );
    this.updateElementBounds(bounds);
  }

  private handleMinimized() {
    this.resizer.setAvailability(true);
    this.header.setAvailability(true);
    const bounds = this.bounds;
    this.updateElementBounds(bounds);
  }

  private onClose = () => {
    this.emit(EVENTS.CLOSE_WINDOW, this.uid);
  };

  private onExpand = (isMaximized: boolean) => {
    if (isMaximized) this.handleMaximized();
    else this.handleMinimized();
  };

  private onDragStart = () => {
    this.emit(EVENTS.DRAG_START);
  };

  private onDrag = (event: MouseEvent) => {
    const { bounds } = this.dragBoundsProcessor.getBounds(event, this.bounds);
    this.snap = this.snapProcessor.getSnap(event);
    this.emit(EVENTS.DRAG, this.snap);

    if (bounds.top <= 0) return;

    this.setBounds(bounds);
    this.updateElementBounds(this.bounds);
  };

  private onDragEnd = () => {
    if (this.snap) {
      let { bounds } = this.presetBoundsProcessor.getBounds(this.snap);

      this.setBounds(bounds);
      this.updateElementBounds(this.bounds);
    }

    this.snap = undefined;
    this.emit(EVENTS.DRAG_END);
  };

  private onResizeStart = () => {
    this.emit(EVENTS.RESIZE_START);
  };

  private onResize = ({
    event,
    resizerPosition,
  }: {
    event: MouseEvent;
    resizerPosition: ResizerPosition;
  }) => {
    this.emit(EVENTS.RESIZE);
    const { bounds } = this.resizeBoundsProcessor.getBounds(
      event,
      this.bounds,
      resizerPosition
    );

    if (
      bounds.width < this.minWidth ||
      bounds.height < this.minHeight ||
      bounds.top < 0
    )
      return;

    this.setBounds(bounds);
    this.updateElementBounds(this.bounds);
  };

  private onResizeEnd = () => {
    this.emit(EVENTS.RESIZE_END);
  };

  setIndex(index: number) {
    this.index = index;
    this.element.style.zIndex = `${this.index}`;
  }

  getUid() {
    return this.uid;
  }

  getElement() {
    return this.element;
  }

  getBounds() {
    return this.bounds;
  }

  getTitle() {
    return this.schema.title;
  }

  getIsClosable() {
    return this.schema.isClosable;
  }

  getCtor() {
    return this.schema.ctor;
  }

  destroy() {
    this.header.off(EVENTS.CLOSE_WINDOW, this.onClose);
    this.header.off(EVENTS.EXPAND, this.onExpand);
    this.header.off(EVENTS.DRAG_START, this.onDragStart);
    this.header.off(EVENTS.DRAG, this.onDrag);
    this.header.off(EVENTS.DRAG_END, this.onDragEnd);
    this.resizer.off(EVENTS.RESIZE_START, this.onResizeStart);
    this.resizer.off(EVENTS.RESIZE, this.onResize);
    this.resizer.off(EVENTS.RESIZE_END, this.onResizeEnd);
    this.header.destroy();
    this.resizer.destroy();
    this.root.removeChild(this.element);
  }
}
