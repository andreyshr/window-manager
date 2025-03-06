import { EventEmitter } from '../../event-emitter/event-emitter';
import { CloseButton } from './close-button';
import { ExpandButton } from './expand-button';
import { ControlsEvent, Events } from '../../event-emitter/events';
import { Component } from '../../types';
import { DomEventDelegator } from '../../dom-event-delegator/dom-event-delegator';

export interface ControlsOptions {
  isClosable: boolean;
  isExpandable: boolean;
}

export class Controls extends EventEmitter<ControlsEvent> implements Component {
  private element: HTMLElement;
  private closeButton?: CloseButton;
  private expandButton?: ExpandButton;

  constructor(
    private root: HTMLElement,
    private options: ControlsOptions,
    private domEventDelegator: DomEventDelegator
  ) {
    super();
    this.element = this.createElement();
    if (this.options.isExpandable) {
      this.expandButton = this.createExpandButton();
    }
    if (this.options.isClosable) {
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
    const closeButton = new CloseButton(this.element, this.domEventDelegator);
    closeButton.on(Events.CloseWindow, this.onClose);
    return closeButton;
  }

  private createExpandButton() {
    const expandButton = new ExpandButton(this.element, this.domEventDelegator);
    expandButton.on(Events.ExpandWindow, this.onExpand);
    return expandButton;
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

  getElement() {
    return this.element;
  }

  destroy() {
    this.closeButton?.off(Events.CloseWindow, this.onClose);
    this.expandButton?.off(Events.ExpandWindow, this.onExpand);
    this.closeButton?.destroy();
    this.expandButton?.destroy();
  }
}
