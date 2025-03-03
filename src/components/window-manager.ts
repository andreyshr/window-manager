import { PresetBound } from '../processors/preset-bounds-processor';
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  SNAP_THRESHOLD,
} from '../constants';
import { EventEmitter } from '../event-emitter/event-emitter';
import { EVENTS } from '../event-emitter/events';
import { Window } from './window';
import { Snap } from '../processors/types';

export type WindowManagerCtorOptions = {
  snapThreshold?: number;
  minWindowWidth?: number;
  minWindowHeight?: number;
};

export type WindowManagerOptions = Required<WindowManagerCtorOptions>;

export type ItemSchema = {
  title: string;
  width: number;
  height: number;
  position: [number, number];
  isClosable: boolean;
  ctor: (window: Window) => HTMLElement;
  props?: Record<string, unknown>;
};

export class WindowManager extends EventEmitter {
  private root: HTMLElement;
  private options: WindowManagerOptions;
  private element: HTMLElement;
  private content: Window[] = [];

  constructor(
    root: HTMLElement,
    schema: ItemSchema[],
    options?: WindowManagerCtorOptions
  ) {
    super();
    this.root = root;
    this.options = this.mapOptions(options);
    this.element = this.createElement();
    this.content = this.schemaToContent(schema);
    this.mount();
  }

  addWindow(schema: ItemSchema) {
    const window = this.createWindow(
      schema,
      this.element,
      this.content.length <= 0 ? 0 : this.content.length + 1
    );
    this.content.push(window);
  }

  removeWindow(id: string) {
    this.onClose(id);
  }

  bringWindowToFront(id: string) {}

  sendWindowToBack(id: string) {}

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
      this.onClose(item.getUid());
    });
    this.root.removeChild(this.element);
  }

  private mapOptions(options?: WindowManagerCtorOptions): WindowManagerOptions {
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
    return schema.map((item, index) =>
      this.createWindow(item, this.element, index)
    );
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private createWindow(schema: ItemSchema, root: HTMLElement, index: number) {
    const window = new Window(schema, root, index, this.options);
    this.setListeners(window);
    return window;
  }

  private setListeners(window: Window) {
    window.on(EVENTS.CLOSE_WINDOW, this.onClose);
    window.on(EVENTS.SELECT_WINDOW, this.onSelectWindow);
    window.on(EVENTS.DRAG_START, this.onDragStart);
    window.on(EVENTS.DRAG, this.onDrag);
    window.on(EVENTS.DRAG_END, this.onDragEnd);
    window.on(EVENTS.RESIZE_START, this.onResizeStart);
    window.on(EVENTS.RESIZE, this.onResize);
    window.on(EVENTS.RESIZE_END, this.onResizeEnd);
  }

  private removeListeners(window: Window) {
    window.off(EVENTS.CLOSE_WINDOW, this.onClose);
    window.off(EVENTS.SELECT_WINDOW, this.onSelectWindow);
    window.off(EVENTS.DRAG_START, this.onDragStart);
    window.off(EVENTS.DRAG, this.onDrag);
    window.off(EVENTS.DRAG_END, this.onDragEnd);
    window.off(EVENTS.RESIZE_START, this.onResizeStart);
    window.off(EVENTS.RESIZE, this.onResize);
    window.off(EVENTS.RESIZE_END, this.onResizeEnd);
  }

  private onClose = (id: string) => {
    const window = this.content.find((item) => item.getUid() === id);
    if (window) {
      window.destroy();
      this.content = this.content.filter((item) => item.getUid() !== id);
      this.emit(EVENTS.CLOSE_WINDOW);
    }
  };

  private onSelectWindow = (id: string) => {
    const index = this.content.findIndex((item) => item.getUid() === id);
    if (index !== -1) {
      this.content.push(this.content.splice(index, 1)[0]);
    }
    this.content.forEach((item, index) => {
      item.setIndex(index);
    });
    this.emit(EVENTS.SELECT_WINDOW);
  };

  private onDragStart = () => {
    this.emit(EVENTS.DRAG_START);
  };

  private onDrag = (snap: Snap | undefined) => {
    if (snap) this.showSnapPreview(snap);
    else this.hideSnapPreview();
    this.emit(EVENTS.DRAG);
  };

  private onDragEnd = () => {
    this.hideSnapPreview();
    this.emit(EVENTS.DRAG_END);
  };

  private onResizeStart = () => {
    this.emit(EVENTS.RESIZE_START);
  };

  private onResize = () => {
    this.emit(EVENTS.RESIZE);
  };

  private onResizeEnd = () => {
    this.emit(EVENTS.RESIZE_END);
  };
}
