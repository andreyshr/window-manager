import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DomEventDelegator } from '../src/dom-event-delegator/dom-event-delegator';

describe('DomEventDelegator', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should call handler when event occurs on the target element', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    container.appendChild(target);
    const handler = vi.fn();

    delegator.on('click', target, handler);

    const event = new MouseEvent('click', { bubbles: true });
    target.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler after off() is called', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    container.appendChild(target);
    const handler = vi.fn();

    delegator.on('click', target, handler);
    delegator.off(target, 'click');

    const event = new MouseEvent('click', { bubbles: true });
    target.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler for events outside the container', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    document.body.appendChild(target);
    const handler = vi.fn();

    delegator.on('click', target, handler);

    const event = new MouseEvent('click', { bubbles: true });
    target.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(target);
  });

  it('should support multiple event types for a single target', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    container.appendChild(target);
    const clickHandler = vi.fn();
    const mouseOverHandler = vi.fn();

    delegator.on('click', target, clickHandler);
    delegator.on('mouseover', target, mouseOverHandler);

    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(mouseOverHandler).toHaveBeenCalledTimes(1);
  });

  it('should allow multiple handlers for the same event on the same target', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    container.appendChild(target);
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    delegator.on('click', target, handler1);
    delegator.on('click', target, handler2);

    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should remove subscription when unsubscribe is called', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    container.appendChild(target);
    const handler = vi.fn();

    const unsubscribe = delegator.on('click', target, handler);
    unsubscribe();

    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('should remove only the specified handler when unsubscribe is called', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    container.appendChild(target);
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const unsubscribe1 = delegator.on('click', target, handler1);
    delegator.on('click', target, handler2);

    unsubscribe1();

    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should remove all handlers for an event if no handler is specified', () => {
    const delegator = new DomEventDelegator(container);
    const target = document.createElement('button');
    container.appendChild(target);
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    delegator.on('click', target, handler1);
    delegator.on('click', target, handler2);
    delegator.off(target, 'click');

    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});
