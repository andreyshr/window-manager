import { HEADER_HEIGHT } from '../constants';
import { DomEventDelegator } from '../dom-event-delegator/dom-event-delegator';
import { EventEmitter } from '../event-emitter/event-emitter';
import { Events, WindowEvent } from '../event-emitter/events';
import { DragProcessor } from '../processors/drag-processor';
import { PresetBound, PresetBounds } from '../processors/preset-bounds';
import { ResizeProcessor } from '../processors/resize-processor';
import { SnapProcessor } from '../processors/snap-processor';
import { Snap } from '../processors/types';
import { Component, ContentCtor, WindowSchema } from '../types';
import { uuid } from '../utils';
import { Header } from './header/header';
import { Resizer, ResizerPosition } from './resizer';

export type WindowOptions = {
  snapThreshold: number;
  minWindowWidth: number;
  minWindowHeight: number;
  bounds: WindowBounds;
  title: string;
  name: string;
  isClosable: boolean;
  isExpandable: boolean;
  ctor: ContentCtor;
  schema: WindowSchema;
};

export type WindowBounds = {
  width: number;
  height: number;
  left: number;
  top: number;
};

export class WmWindow extends EventEmitter<WindowEvent> implements Component {
  private element: HTMLElement;
  private container: HTMLElement;
  private bounds: WindowBounds;
  private header: Header;
  private resizer: Resizer;
  private presetBounds: PresetBounds;
  private resizeProcessor: ResizeProcessor;
  private dragProcessor: DragProcessor;
  private snapProcessor: SnapProcessor;
  private minWidth: number;
  private minHeight: number;
  private snap: Snap | undefined = undefined;
  private isSelected: boolean = false;
  private isExpanded: boolean = false;
  private uid = uuid();

  constructor(
    private root: HTMLElement,
    private stackOrder: number,
    private options: WindowOptions,
    private domEventDelegator: DomEventDelegator
  ) {
    super();
    this.bounds = {
      width: this.options.bounds.width,
      height: this.options.bounds.height,
      left: this.options.bounds.left,
      top: this.options.bounds.top,
    };
    this.element = this.createElement();
    this.container = this.createContainer();
    this.header = this.createHeader();
    this.resizer = this.createResizer();
    this.presetBounds = new PresetBounds();
    this.resizeProcessor = new ResizeProcessor(this.root);
    this.dragProcessor = new DragProcessor(
      this.root,
      this.element,
      this.options
    );
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
    element.style.zIndex = `${this.stackOrder}`;
    this.domEventDelegator.on('mousedown', element, this.handleSelect);
    return element;
  }

  private createContainer() {
    const element = document.createElement('div');
    element.classList.add('wm-window-content');
    return element;
  }

  private createHeader() {
    const header = new Header(
      this.element,
      {
        isClosable: this.options.isClosable,
        isExpandable: this.options.isExpandable,
        title: this.options.title,
      },
      this.domEventDelegator
    );
    header.on(Events.CloseWindow, this.onCloseWindow);
    header.on(Events.ExpandWindow, this.onExpandWindow);
    header.on(Events.DragStart, this.onDragStart);
    header.on(Events.Drag, this.onDrag);
    header.on(Events.DragEnd, this.onDragEnd);
    return header;
  }

  private createResizer() {
    const resizer = new Resizer(this.element, this.domEventDelegator);
    resizer.on(Events.ResizeStart, this.onResizeStart);
    resizer.on(Events.Resize, this.onResize);
    resizer.on(Events.ResizeEnd, this.onResizeEnd);
    return resizer;
  }

  private mount() {
    this.mountContainer();
    this.mountCtor();
    this.mountToRoot();
  }

  private mountContainer() {
    this.element.insertAdjacentElement('beforeend', this.container);
  }

  private async mountCtor() {
    await this.options.ctor(this, this.container, this.options.schema);
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

  private handleSelect = () => {
    this.isSelected = true;
    this.element.classList.add('wm-window--selected');
    this.emit(Events.SelectWindow, { id: this.uid });

    document.addEventListener('mousedown', this.handleUnselect);
  };

  private handleUnselect = (event: MouseEvent) => {
    const eventTarget = event.target as HTMLElement;
    if (!this.element.contains(eventTarget)) {
      this.isSelected = false;
      this.element.classList.remove('wm-window--selected');
      this.emit(Events.UnselectWindow, { id: this.uid });

      document.removeEventListener('mousedown', this.handleUnselect);
    }
  };

  private onCloseWindow = () => {
    this.emit(Events.CloseWindow, { id: this.uid });
  };

  private onExpandWindow = ({ isMaximized }: { isMaximized: boolean }) => {
    this.isExpanded = isMaximized;
    this.resizer.setAvailability(!isMaximized);
    this.header.setAvailability(!isMaximized);
    const { bounds } = isMaximized
      ? this.presetBounds.getBounds(PresetBound.Maximized)
      : { bounds: this.bounds };
    this.updateElementBounds(bounds);
    this.emit(Events.ExpandWindow, { isMaximized });
  };

  private onDragStart = ({ event }: { event: MouseEvent }) => {
    this.emit(Events.DragStart, { event });
  };

  private onDrag = ({ event }: { event: MouseEvent }) => {
    const { bounds } = this.dragProcessor.getBounds(event, this.bounds);
    this.snap = this.snapProcessor.getSnap(event);
    this.emit(Events.Drag, { event, snap: this.snap });

    if (bounds.top <= 0) return;

    this.setBounds(bounds);
    this.updateElementBounds(this.bounds);
  };

  private onDragEnd = ({ event }: { event: MouseEvent }) => {
    if (this.snap) {
      const { bounds } = this.presetBounds.getBounds(this.snap);

      this.setBounds(bounds);
      this.updateElementBounds(this.bounds);
    } else {
      this.validateBounds();
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
    const { bounds } = this.resizeProcessor.getBounds(
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
    this.validateBounds();
    this.emit(Events.ResizeEnd, {
      event,
      resizerPosition,
    });
  };

  validateBounds() {
    if (this.root.offsetHeight - this.element.offsetTop < HEADER_HEIGHT) {
      const top =
        ((this.root.offsetHeight - 2 * HEADER_HEIGHT) * 100) /
        this.root.offsetHeight;
      this.setBounds({ ...this.bounds, top });
      this.updateElementBounds(this.bounds);
    }
  }

  setStackOrder(stackOrder: number) {
    this.stackOrder = stackOrder;
    this.element.style.zIndex = `${this.stackOrder}`;
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

  getIsExpandable() {
    return this.options.isExpandable;
  }

  getCtor() {
    return this.options.ctor;
  }

  getName() {
    return this.options.name;
  }

  getStackOrder() {
    return this.stackOrder;
  }

  getIsSelected() {
    return this.isSelected;
  }

  getIsExpanded() {
    return this.isExpanded;
  }

  destroy() {
    // unsubscribe from DOM events
    this.domEventDelegator.off(this.element, 'mousedown');

    // destroy header
    this.header.off(Events.CloseWindow, this.onCloseWindow);
    this.header.off(Events.ExpandWindow, this.onExpandWindow);
    this.header.off(Events.DragStart, this.onDragStart);
    this.header.off(Events.Drag, this.onDrag);
    this.header.off(Events.DragEnd, this.onDragEnd);
    this.header.destroy();

    // destroy resizer
    this.resizer.off(Events.ResizeStart, this.onResizeStart);
    this.resizer.off(Events.Resize, this.onResize);
    this.resizer.off(Events.ResizeEnd, this.onResizeEnd);
    this.resizer.destroy();

    // unmount element
    this.root.removeChild(this.element);
  }
}
