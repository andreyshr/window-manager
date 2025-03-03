import { PresetBound } from '../processors/preset-bounds-processor';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  SNAP_THRESHOLD,
} from '../constants';
import { EventEmitter } from '../event-emitter/event-emitter';
import { Events, WindowManagerEvent } from '../event-emitter/events';
import { Window, WindowOptions } from './window';
import { Snap } from '../processors/types';
import { ResizerPosition } from './resizer';
import { ItemSchema } from '../types';

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

  constructor(
    private root: HTMLElement,
    schema: ItemSchema[],
    options?: WindowManagerOptions
  ) {
    super();
    this.options = this.mapOptions(options);
    this.element = this.createElement();
    this.content = this.schemaToContent(schema);
    this.mount();
  }

  addWindow(schema: ItemSchema) {
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

  toJson(): ItemSchema[] {
    return this.content.map((item) => ({
      title: item.getTitle(),
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
    this.element.classList.remove('wm-container-snap-preview');
    this.element.classList.remove(
      `wm-container-snap-preview--${PresetBound.Left}`
    );
    this.element.classList.remove(
      `wm-container-snap-preview--${PresetBound.Right}`
    );
    this.element.classList.remove(
      `wm-container-snap-preview--${PresetBound.TopRight}`
    );
    this.element.classList.remove(
      `wm-container-snap-preview--${PresetBound.TopLeft}`
    );
    this.element.classList.remove(
      `wm-container-snap-preview--${PresetBound.BottomRight}`
    );
    this.element.classList.remove(
      `wm-container-snap-preview--${PresetBound.BottomLeft}`
    );
  }

  private createElement() {
    const element = document.createElement('div');
    element.className = 'wm-container';
    return element;
  }

  private schemaToContent(schema: ItemSchema[]) {
    return schema.map((item, index) => this.createWindow(item, index));
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private createWindowOptions(schema: ItemSchema): WindowOptions {
    return {
      ...this.options,
      title: schema.title,
      isClosable: schema.isClosable,
      bounds: {
        width: schema.width,
        height: schema.height,
        left: schema.position[0],
        top: schema.position[1],
      },
      ctor: schema.ctor,
    };
  }

  private createWindow(schema: ItemSchema, _index?: number) {
    const index = _index
      ? _index
      : this.content.length <= 0
        ? 0
        : this.content.length + 1;
    const options = this.createWindowOptions(schema);
    const window = new Window(this.element, index, options);
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
