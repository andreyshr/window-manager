import { EventEmitter } from '../../event-emitter/event-emitter';
import { CloseButtonEvent, Events } from '../../event-emitter/events';
import { Component } from '../../types';
import { ItemSchema } from '../../types';

export class CloseButton
  extends EventEmitter<CloseButtonEvent>
  implements Component
{
  private element: HTMLElement;
  private closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;

  constructor(
    private schema: ItemSchema,
    private root: HTMLElement
  ) {
    super();
    this.schema = schema;
    this.root = root;
    this.element = this.createElement();
    this.mount();
  }

  private createElement() {
    const element = document.createElement('button');
    element.innerHTML = this.closeIcon;
    element.className = 'wm-window-button wm-window-close-button';
    element.addEventListener('click', this.onClick);
    return element;
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private onClick = () => {
    this.emit(Events.CloseWindow, undefined);
  };

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.removeEventListener('click', this.onClick);
  }
}
