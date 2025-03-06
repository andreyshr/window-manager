import { EventEmitter } from '../../event-emitter/event-emitter';
import { Events, HeaderEvent } from '../../event-emitter/events';
import { Controls } from './controls';
import { Component } from '../../types';
import { DomEventDelegator } from '../../dom-event-delegator/dom-event-delegator';
import { HEADER_HEIGHT } from '../../constants';

export interface HeaderOptions {
  title: string;
  isClosable: boolean;
  isExpandable: boolean;
}

export class Header extends EventEmitter<HeaderEvent> implements Component {
  private element: HTMLElement;
  private controls: Controls;
  private isAvailable = true;

  constructor(
    private root: HTMLElement,
    private options: HeaderOptions,
    private domEventDelegator: DomEventDelegator
  ) {
    super();
    this.element = this.createElement();
    this.controls = this.createControls();
    this.mount();
  }

  private createElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-header';
    element.style.height = `${HEADER_HEIGHT}px`;
    element.innerHTML = `<span class="wm-window-title">${this.options.title}</span>`;
    this.domEventDelegator.on('mousedown', element, this.onMouseDown);
    return element;
  }

  private createControls() {
    const controls = new Controls(
      this.element,
      {
        isClosable: this.options.isClosable,
        isExpandable: this.options.isExpandable,
      },
      this.domEventDelegator
    );
    controls.on(Events.CloseWindow, this.onClose);
    controls.on(Events.ExpandWindow, this.onExpand);
    return controls;
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private onClose = () => {
    this.emit(Events.CloseWindow, undefined);
  };

  private onExpand = ({ isMaximized }: { isMaximized: boolean }) => {
    this.emit(Events.ExpandWindow, { isMaximized });
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
    this.domEventDelegator.off(this.element, 'mousedown');
    this.controls.off(Events.CloseWindow, this.onClose);
    this.controls.off(Events.ExpandWindow, this.onExpand);
    this.controls.destroy();
  }
}
