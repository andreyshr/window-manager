import { EventEmitter } from '../../event-emitter/event-emitter';
import { EVENTS } from '../../lib';
import { CloseButton } from './close-button';
import { ExpandButton } from './expand-button';
import { ItemSchema } from '../window-manager';

export class Controls extends EventEmitter {
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
    closeButton.on(EVENTS.CLOSE_WINDOW, this.onClose);
    return closeButton;
  }

  private createExpandButton() {
    const expandButton = new ExpandButton(this.schema, this.element);
    expandButton.on(EVENTS.EXPAND, this.onExpand);
    return expandButton;
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

  destroy() {
    this.closeButton?.off(EVENTS.CLOSE_WINDOW, this.onClose);
    this.expandButton.off(EVENTS.EXPAND, this.onExpand);
    this.closeButton?.destroy();
    this.expandButton.destroy();
  }
}
