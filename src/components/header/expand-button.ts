import { EventEmitter } from '../../event-emitter/event-emitter';
import { Events, ExpandButtonEvent } from '../../event-emitter/events';
import { Component } from '../../types';
import { ItemSchema } from '../../types';

export class ExpandButton
  extends EventEmitter<ExpandButtonEvent>
  implements Component
{
  private element: HTMLElement;
  private isMaximized: boolean = false;
  private maximizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"/></svg>`;
  private minimizeIcon = `<svg xmlns="http://www.w3.org/2000/svg"  width="12" height="12" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l448 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 416z"/></svg>`;

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
    element.innerHTML = this.maximizeIcon;
    element.className = 'wm-window-button wm-window-expand-button';
    element.addEventListener('click', this.onClick);
    return element;
  }

  private mount() {
    this.root.insertAdjacentElement('beforeend', this.element);
  }

  private onClick = () => {
    this.isMaximized = !this.isMaximized;
    this.element.innerHTML = this.isMaximized
      ? this.minimizeIcon
      : this.maximizeIcon;
    this.emit(Events.Expand, { isMaximized: this.isMaximized });
  };

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.removeEventListener('click', this.onClick);
  }
}
