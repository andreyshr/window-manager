import { ResizerPosition, Resizer } from './resizer';
import { EventEmitter } from '../event-emitter/event-emitter';
import { Events, WindowEvent } from '../event-emitter/events';
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
import { Component, ContentCtor } from '../types';

export type WindowOptions = {
  snapThreshold: number;
  minWindowWidth: number;
  minWindowHeight: number;
  bounds: WindowBounds;
  title: string;
  isClosable: boolean;
  ctor: ContentCtor;
};

export type WindowBounds = {
  width: number;
  height: number;
  left: number;
  top: number;
};

export class Window extends EventEmitter<WindowEvent> implements Component {
  private element: HTMLElement;
  private bounds: WindowBounds;
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
    private root: HTMLElement,
    private index: number,
    private options: WindowOptions
  ) {
    super();
    this.bounds = {
      width: this.options.bounds.width,
      height: this.options.bounds.height,
      left: this.options.bounds.left,
      top: this.options.bounds.top,
    };
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
    this.minWidth = this.options.minWindowWidth;
    this.minHeight = this.options.minWindowHeight;
    this.updateElementBounds(this.bounds);
    this.mount();
  }

  private createElement() {
    const element = document.createElement('div');
    element.className = 'wm-window';
    element.style.zIndex = `${this.getZIndex()}`;
    element.addEventListener('mousedown', () => {
      this.emit(Events.SelectWindow, { id: this.uid });
    });
    return element;
  }

  private createHeader() {
    const header = new Header(this.element, {
      isClosable: this.options.isClosable,
      title: this.options.title,
    });
    header.on(Events.CloseWindow, this.onClose);
    header.on(Events.ExpandWindow, this.onExpand);
    header.on(Events.DragStart, this.onDragStart);
    header.on(Events.Drag, this.onDrag);
    header.on(Events.DragEnd, this.onDragEnd);
    return header;
  }

  private createResizer() {
    const resizer = new Resizer(this.element);
    resizer.on(Events.ResizeStart, this.onResizeStart);
    resizer.on(Events.Resize, this.onResize);
    resizer.on(Events.ResizeEnd, this.onResizeEnd);
    return resizer;
  }

  private mount() {
    this.mountCtor();
    this.mountToRoot();
  }

  private mountCtor() {
    const content = this.options.ctor(this);
    content.classList.add('wm-window-content');
    this.element.insertAdjacentElement('beforeend', content);
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
    this.emit(Events.CloseWindow, { id: this.uid });
  };

  private onExpand = ({ isMaximized }: { isMaximized: boolean }) => {
    if (isMaximized) this.handleMaximized();
    else this.handleMinimized();
  };

  private onDragStart = ({ event }: { event: MouseEvent }) => {
    this.emit(Events.DragStart, { event });
  };

  private onDrag = ({ event }: { event: MouseEvent }) => {
    const { bounds } = this.dragBoundsProcessor.getBounds(event, this.bounds);
    this.snap = this.snapProcessor.getSnap(event);
    this.emit(Events.Drag, { event, snap: this.snap });

    if (bounds.top <= 0) return;

    this.setBounds(bounds);
    this.updateElementBounds(this.bounds);
  };

  private onDragEnd = ({ event }: { event: MouseEvent }) => {
    if (this.snap) {
      const { bounds } = this.presetBoundsProcessor.getBounds(this.snap);

      this.setBounds(bounds);
      this.updateElementBounds(this.bounds);
    }

    this.snap = undefined;
    this.emit(Events.DragEnd, { event });
  };

  private onResizeStart = ({
    event,
    resizerPosition,
  }: {
    event: MouseEvent;
    resizerPosition: ResizerPosition;
  }) => {
    this.emit(Events.ResizeStart, {
      event,
      resizerPosition,
    });
  };

  private onResize = ({
    event,
    resizerPosition,
  }: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  }) => {
    this.emit(Events.Resize, {
      event,
      resizerPosition,
    });
    if (!resizerPosition) return;
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

  private onResizeEnd = ({
    event,
    resizerPosition,
  }: {
    event: MouseEvent;
    resizerPosition: ResizerPosition | null;
  }) => {
    this.emit(Events.ResizeEnd, {
      event,
      resizerPosition,
    });
  };

  private getZIndex() {
    return this.index + 1;
  }

  setIndex(index: number) {
    this.index = index;
    this.element.style.zIndex = `${this.getZIndex()}`;
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
    return this.options.title;
  }

  getIsClosable() {
    return this.options.isClosable;
  }

  getCtor() {
    return this.options.ctor;
  }

  destroy() {
    this.header.off(Events.CloseWindow, this.onClose);
    this.header.off(Events.ExpandWindow, this.onExpand);
    this.header.off(Events.DragStart, this.onDragStart);
    this.header.off(Events.Drag, this.onDrag);
    this.header.off(Events.DragEnd, this.onDragEnd);
    this.resizer.off(Events.ResizeStart, this.onResizeStart);
    this.resizer.off(Events.Resize, this.onResize);
    this.resizer.off(Events.ResizeEnd, this.onResizeEnd);
    this.header.destroy();
    this.resizer.destroy();
    this.root.removeChild(this.element);
  }
}
