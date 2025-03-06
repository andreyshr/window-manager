import {
  IS_CLOSABLE,
  IS_EXPANDABLE,
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
import { WmWindow, WindowOptions } from './window';

export type WindowManagerOptions = {
  snapThreshold?: number;
  minWindowWidth?: number;
  minWindowHeight?: number;
};

export type ResolvedWindowManagerOptions = Required<WindowManagerOptions>;

export class WindowManager extends EventEmitter<WindowManagerEvent> {
  private options: ResolvedWindowManagerOptions;
  private element: HTMLElement;
  private content: WmWindow[] = [];
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
    const wmWindow = this.createWindow(schema);
    this.content.push(wmWindow);
  }

  closeWindow(id: string) {
    const wmWindow = this.content.find((item) => item.getUid() === id);
    if (wmWindow) {
      wmWindow.destroy();
      this.content = this.content.filter((item) => item.getUid() !== id);
      this.updateStackOrder();
      this.emit(Events.CloseWindow, { id });
    }
  }

  bringWindowToFront(id: string) {
    const index = this.content.findIndex((item) => item.getUid() === id);
    if (index !== -1) {
      this.content.push(this.content.splice(index, 1)[0]);
    }
    this.updateStackOrder();
    this.emit(Events.SelectWindow, { id });
  }

  sendWindowToBack(id: string) {
    const index = this.content.findIndex((item) => item.getUid() === id);
    if (index !== -1) {
      this.content.unshift(this.content.splice(index, 1)[0]);
    }
    this.updateStackOrder();
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
      isExpandable: item.getIsExpandable(),
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
      isClosable: schema.isClosable ?? IS_CLOSABLE,
      isExpandable: schema.isExpandable ?? IS_EXPANDABLE,
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

  private createWindow(schema: WindowSchema, index?: number) {
    const options = this.createWindowOptions(schema);
    const wmWindow = new WmWindow(
      this.element,
      this.computeStackOrder(index),
      options,
      this.domEventDelegator
    );
    this.setListeners(wmWindow);
    return wmWindow;
  }

  private computeStackOrder(index?: number) {
    return index && index > 0
      ? index + 1
      : this.content.length <= 0
        ? 1
        : this.content.length + 1;
  }

  private updateStackOrder() {
    this.content.forEach((item, index) => {
      item.setStackOrder(index);
    });
  }

  private setListeners(wmWindow: WmWindow) {
    wmWindow.on(Events.CloseWindow, this.onCloseWindow);
    wmWindow.on(Events.SelectWindow, this.onSelectWindow);
    wmWindow.on(Events.UnselectWindow, this.onUnselectWindow);
    wmWindow.on(Events.ExpandWindow, this.onExpandWindow);
    wmWindow.on(Events.DragStart, this.onDragStart);
    wmWindow.on(Events.Drag, this.onDrag);
    wmWindow.on(Events.DragEnd, this.onDragEnd);
    wmWindow.on(Events.ResizeStart, this.onResizeStart);
    wmWindow.on(Events.Resize, this.onResize);
    wmWindow.on(Events.ResizeEnd, this.onResizeEnd);
  }

  private removeListeners(wmWindow: WmWindow) {
    wmWindow.off(Events.CloseWindow, this.onCloseWindow);
    wmWindow.off(Events.SelectWindow, this.onSelectWindow);
    wmWindow.off(Events.UnselectWindow, this.onUnselectWindow);
    wmWindow.off(Events.ExpandWindow, this.onExpandWindow);
    wmWindow.off(Events.DragStart, this.onDragStart);
    wmWindow.off(Events.Drag, this.onDrag);
    wmWindow.off(Events.DragEnd, this.onDragEnd);
    wmWindow.off(Events.ResizeStart, this.onResizeStart);
    wmWindow.off(Events.Resize, this.onResize);
    wmWindow.off(Events.ResizeEnd, this.onResizeEnd);
  }

  private onCloseWindow = ({ id }: { id: string }) => {
    this.closeWindow(id);
  };

  private onSelectWindow = ({ id }: { id: string }) => {
    this.bringWindowToFront(id);
  };

  private onUnselectWindow = ({ id }: { id: string }) => {
    this.emit(Events.UnselectWindow, { id });
  };

  private onExpandWindow = ({ isMaximized }: { isMaximized: boolean }) => {
    this.emit(Events.ExpandWindow, { isMaximized });
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
