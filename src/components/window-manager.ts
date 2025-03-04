import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  SNAP_THRESHOLD,
} from '../constants';
import { DomEventDelegator } from '../dom-event-delegator/dom-event-delegator';
import { EventEmitter } from '../event-emitter/event-emitter';
import { Events, WindowManagerEvent } from '../event-emitter/events';
import { Snap } from '../processors/types';
import { ContentCtor, WindowSchema } from '../types';
import { ResizerPosition } from './resizer';
import { Window, WindowOptions } from './window';

export type WindowManagerOptions = {
  snapThreshold?: number;
  minWindowWidth?: number;
  minWindowHeight?: number;
};

export type ResolvedWindowManagerOptions = Required<WindowManagerOptions>;

export class WindowManager extends EventEmitter<WindowManagerEvent> {
  private options: ResolvedWindowManagerOptions;
  private element: HTMLElement;
  private content: Window[] = [];
  private domEventDelegator: DomEventDelegator;
  private ctors: Record<string, ContentCtor> = {};

  constructor(
    private root: HTMLElement,
    private schema: WindowSchema[] = [],
    options?: WindowManagerOptions
  ) {
    super();
    if (!root) throw new Error('Root element is not defined');
    this.options = this.mapOptions(options);
    this.element = this.createElement();
    this.domEventDelegator = new DomEventDelegator(this.element);
  }

  init() {
    this.content = this.schemaToContent(this.schema);
    this.mount();
  }

  registerConstructor(name: string, ctor: ContentCtor) {
    if (name in this.ctors)
      throw new Error(`Constructor for ${name} is already registered`);

    this.ctors[name] = ctor;
  }

  addWindow(schema: WindowSchema) {
    const window = this.createWindow(schema);
    this.content.push(window);
  }

  closeWindow(id: string) {
    const window = this.content.find((item) => item.getUid() === id);
    if (window) {
      window.destroy();
      this.content = this.content.filter((item) => item.getUid() !== id);
      this.updateWindowIndexes();
      this.emit(Events.CloseWindow, { id });
    }
  }

  bringWindowToFront(id: string) {
    const index = this.content.findIndex((item) => item.getUid() === id);
    if (index !== -1) {
      this.content.push(this.content.splice(index, 1)[0]);
    }
    this.updateWindowIndexes();
    this.emit(Events.SelectWindow, { id });
  }

  sendWindowToBack(id: string) {
    const index = this.content.findIndex((item) => item.getUid() === id);
    if (index !== -1) {
      this.content.unshift(this.content.splice(index, 1)[0]);
    }
    this.updateWindowIndexes();
    this.emit(Events.SelectWindow, { id });
  }

  toJson(): WindowSchema[] {
    return this.content.map((item) => ({
      title: item.getTitle(),
      name: item.getName(),
      width: item.getBounds().width,
      height: item.getBounds().height,
      position: [item.getBounds().left, item.getBounds().top],
      isClosable: item.getIsClosable(),
      ctor: item.getCtor(),
    }));
  }

  destroy() {
    this.content.forEach((item) => {
      this.removeListeners(item);
      this.closeWindow(item.getUid());
    });
    this.root.removeChild(this.element);
  }

  private mapOptions(
    options?: WindowManagerOptions
  ): ResolvedWindowManagerOptions {
    return {
      snapThreshold: options?.snapThreshold ?? SNAP_THRESHOLD,
      minWindowWidth: options?.minWindowWidth ?? MIN_WINDOW_WIDTH,
      minWindowHeight: options?.minWindowHeight ?? MIN_WINDOW_HEIGHT,
    };
  }

  private showSnapPreview(snap: Snap) {
    this.hideSnapPreview();
    this.element.classList.add('wm-container-snap-preview');
    this.element.classList.add(`wm-container-snap-preview--${snap}`);
  }

  private hideSnapPreview() {
    this.element.className = 'wm-container';
  }

  private createElement() {
    const element = document.createElement('div');
    element.className = 'wm-container';
    return element;
  }

  private schemaToContent(schema: WindowSchema[]) {
    return schema.map((item, index) => this.createWindow(item, index));
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private createWindowOptions(schema: WindowSchema): WindowOptions {
    const ctor = schema.ctor ?? this.ctors[schema.name];

    if (!ctor) throw new Error(`Constructor for ${schema.name} is not defined`);

    return {
      ...this.options,
      title: schema.title,
      name: schema.name,
      isClosable: schema.isClosable,
      bounds: {
        width: schema.width,
        height: schema.height,
        left: schema.position[0],
        top: schema.position[1],
      },
      ctor,
      schema,
    };
  }

  private createWindow(schema: WindowSchema, _index?: number) {
    const index = _index
      ? _index
      : this.content.length <= 0
        ? 0
        : this.content.length + 1;
    const options = this.createWindowOptions(schema);
    const window = new Window(
      this.element,
      index,
      options,
      this.domEventDelegator
    );
    this.setListeners(window);
    return window;
  }

  private updateWindowIndexes() {
    this.content.forEach((item, index) => {
      item.setIndex(index);
    });
  }

  private setListeners(window: Window) {
    window.on(Events.CloseWindow, this.onClose);
    window.on(Events.SelectWindow, this.onSelectWindow);
    window.on(Events.DragStart, this.onDragStart);
    window.on(Events.Drag, this.onDrag);
    window.on(Events.DragEnd, this.onDragEnd);
    window.on(Events.ResizeStart, this.onResizeStart);
    window.on(Events.Resize, this.onResize);
    window.on(Events.ResizeEnd, this.onResizeEnd);
  }

  private removeListeners(window: Window) {
    window.off(Events.CloseWindow, this.onClose);
    window.off(Events.SelectWindow, this.onSelectWindow);
    window.off(Events.DragStart, this.onDragStart);
    window.off(Events.Drag, this.onDrag);
    window.off(Events.DragEnd, this.onDragEnd);
    window.off(Events.ResizeStart, this.onResizeStart);
    window.off(Events.Resize, this.onResize);
    window.off(Events.ResizeEnd, this.onResizeEnd);
  }

  private onClose = ({ id }: { id: string }) => {
    this.closeWindow(id);
  };

  private onSelectWindow = ({ id }: { id: string }) => {
    this.bringWindowToFront(id);
  };

  private onDragStart = ({ event }: { event: MouseEvent }) => {
    this.emit(Events.DragStart, { event });
  };

  private onDrag = ({
    event,
    snap,
  }: {
    event: MouseEvent;
    snap: Snap | undefined;
  }) => {
    if (snap) this.showSnapPreview(snap);
    else this.hideSnapPreview();
    this.emit(Events.Drag, {
      event,
      snap,
    });
  };

  private onDragEnd = ({ event }: { event: MouseEvent }) => {
    this.hideSnapPreview();
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
}
