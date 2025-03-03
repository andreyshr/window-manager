import { EventEmitter } from '../../event-emitter/event-emitter';
import { Events, HeaderEvent } from '../../event-emitter/events';
import { Controls } from './controls';
import { ItemSchema } from '../../types';
import { Component } from '../../types';

export class Header extends EventEmitter<HeaderEvent> implements Component {
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
    controls.on(Events.CloseWindow, this.onClose);
    controls.on(Events.Expand, this.onExpand);
    return controls;
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private onClose = () => {
    this.emit(Events.CloseWindow, undefined);
  };

  private onExpand = ({ isMaximized }: { isMaximized: boolean }) => {
    this.emit(Events.Expand, { isMaximized });
  };

  private onMouseDown = (event: MouseEvent) => {
    if (!this.isAvailable || event.button !== 0) return;
    this.emit(Events.DragStart, { event });
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isAvailable) return;
    this.emit(Events.Drag, { event });
  };

  private onMouseUp = (event: MouseEvent) => {
    if (!this.isAvailable) return;
    this.emit(Events.DragEnd, { event });
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
    this.controls.off(Events.CloseWindow, this.onClose);
    this.controls.off(Events.Expand, this.onExpand);
    this.controls.destroy();
  }
}
