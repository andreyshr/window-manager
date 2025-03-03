import { EventEmitter } from '../../event-emitter/event-emitter';
import { EVENTS } from '../../event-emitter/events';
import { Controls } from './controls';
import { ItemSchema } from '../window-manager';

export class Header extends EventEmitter {
  private schema: ItemSchema;
  private root: HTMLElement;
  private element: HTMLElement;
  private controls: Controls;
  private isAvailable = true;

  constructor(schema: ItemSchema, root: HTMLElement) {
    super();
    this.schema = schema;
    this.root = root;
    this.element = this.createElement();
    this.controls = this.createControls();
    this.mount();
  }

  private createElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-header';
    element.innerHTML = this.schema.title;
    element.addEventListener('mousedown', this.onMouseDown);
    return element;
  }

  private createControls() {
    const controls = new Controls(this.schema, this.element);
    controls.on(EVENTS.CLOSE_WINDOW, this.onClose);
    controls.on(EVENTS.EXPAND, this.onExpand);
    return controls;
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private onClose = () => {
    this.emit(EVENTS.CLOSE_WINDOW);
  };

  private onExpand = (isMaximized: boolean) => {
    this.emit(EVENTS.EXPAND, isMaximized);
  };

  private onMouseDown = (event: MouseEvent) => {
    if (!this.isAvailable || event.button !== 0) return;
    this.emit(EVENTS.DRAG_START, event);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isAvailable) return;
    this.emit(EVENTS.DRAG, event);
  };

  private onMouseUp = (event: MouseEvent) => {
    if (!this.isAvailable) return;
    this.emit(EVENTS.DRAG_END, event);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  getElement() {
    return this.element;
  }

  setAvailability(value: boolean) {
    this.isAvailable = value;
  }

  destroy() {
    this.controls.off(EVENTS.CLOSE_WINDOW, this.onClose);
    this.controls.off(EVENTS.EXPAND, this.onExpand);
    this.controls.destroy();
  }
}
