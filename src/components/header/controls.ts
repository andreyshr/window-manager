import { EventEmitter } from '../../event-emitter/event-emitter';
import { CloseButton } from './close-button';
import { ExpandButton } from './expand-button';
import { ItemSchema } from '../../types';
import { ControlsEvent, Events } from '../../event-emitter/events';
import { Component } from '../../types';

export class Controls extends EventEmitter<ControlsEvent> implements Component {
  private element: HTMLElement;
  private closeButton?: CloseButton;
  private expandButton: ExpandButton;

  constructor(
    private schema: ItemSchema,
    private root: HTMLElement
  ) {
    super();
    this.schema = schema;
    this.root = root;
    this.element = this.createElement();
    this.expandButton = this.createExpandButton();
    if (this.schema.isClosable) {
      this.closeButton = this.createCloseButton();
    }
    this.mount();
  }

  private createElement() {
    const element = document.createElement('div');
    element.className = 'wm-window-controls';
    return element;
  }

  private createCloseButton() {
    const closeButton = new CloseButton(this.schema, this.element);
    closeButton.on(Events.CloseWindow, this.onClose);
    return closeButton;
  }

  private createExpandButton() {
    const expandButton = new ExpandButton(this.schema, this.element);
    expandButton.on(Events.Expand, this.onExpand);
    return expandButton;
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

  getElement() {
    return this.element;
  }

  destroy() {
    this.closeButton?.off(Events.CloseWindow, this.onClose);
    this.expandButton.off(Events.Expand, this.onExpand);
    this.closeButton?.destroy();
    this.expandButton.destroy();
  }
}
