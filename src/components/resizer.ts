import { EventEmitter } from '../event-emitter/event-emitter';
import { Events, ResizerEvent } from '../event-emitter/events';
import { Component } from '../types';

export type ResizerPosition =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export class Resizer extends EventEmitter<ResizerEvent> implements Component {
  private position: ResizerPosition | null = null;
  private leftResizer: HTMLElement;
  private rightResizer: HTMLElement;
  private topResizer: HTMLElement;
  private topLeftResizer: HTMLElement;
  private topRightResizer: HTMLElement;
  private bottomLeftResizer: HTMLElement;
  private bottomRightResizer: HTMLElement;
  private bottomResizer: HTMLElement;
  private isAvailable = true;

  constructor(private root: HTMLElement) {
    super();
    this.leftResizer = this.createLeftResizerElement();
    this.rightResizer = this.createRightResizerElement();
    this.topResizer = this.createTopResizerElement();
    this.bottomResizer = this.createBottomResizerElement();
    this.topLeftResizer = this.createTopLeftResizerElement();
    this.topRightResizer = this.createTopRightResizerElement();
    this.bottomLeftResizer = this.createBottomLeftResizerElement();
    this.bottomRightResizer = this.createBottomRightResizerElement();
    this.mount();
  }

  private createLeftResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--left';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'left')
    );
    return element;
  }

  private createRightResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--right';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'right')
    );
    return element;
  }

  private createTopResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--top';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'top')
    );
    return element;
  }

  private createBottomResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--bottom';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'bottom')
    );
    return element;
  }

  private createTopLeftResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--top-left';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'top-left')
    );
    return element;
  }

  private createTopRightResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--top-right';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'top-right')
    );
    return element;
  }

  private createBottomLeftResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--bottom-left';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'bottom-left')
    );
    return element;
  }

  private createBottomRightResizerElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-resizer wm-window-resizer--bottom-right';
    element.addEventListener('mousedown', (event) =>
      this.onMouseDown(event, 'bottom-right')
    );
    return element;
  }

  private onMouseDown = (event: MouseEvent, position: ResizerPosition) => {
    if (!this.isAvailable || event.button !== 0) return;
    this.position = position;
    this.emit(Events.ResizeStart, {
      event,
      resizerPosition: this.position,
    });
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isAvailable) return;
    this.emit(Events.Resize, { event, resizerPosition: this.position });
  };

  private onMouseUp = (event: MouseEvent) => {
    if (!this.isAvailable) return;
    this.emit(Events.ResizeEnd, { event, resizerPosition: this.position });
    this.position = null;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  private mount() {
    this.mountToRoot();
  }

  private mountToRoot() {
    this.root.insertAdjacentElement('beforeend', this.leftResizer);
    this.root.insertAdjacentElement('beforeend', this.rightResizer);
    this.root.insertAdjacentElement('beforeend', this.topResizer);
    this.root.insertAdjacentElement('beforeend', this.bottomResizer);
    this.root.insertAdjacentElement('beforeend', this.topLeftResizer);
    this.root.insertAdjacentElement('beforeend', this.topRightResizer);
    this.root.insertAdjacentElement('beforeend', this.bottomLeftResizer);
    this.root.insertAdjacentElement('beforeend', this.bottomRightResizer);
  }

  getElement() {
    return this.leftResizer;
  }

  setAvailability(value: boolean) {
    this.isAvailable = value;
  }

  destroy() {}
}
