export type EventHandler<T extends Event = Event> = (
  event: T,
  target: HTMLElement
) => void;

interface ElementSubscription {
  type: string;
  targetElement: HTMLElement;
  listener: EventListener;
}

export class DomEventDelegator {
  private container: HTMLElement;
  private subscriptions: ElementSubscription[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  on<T extends Event>(
    type: string,
    targetElement: HTMLElement,
    handler: EventHandler<T>
  ): () => void {
    const listener = (event: Event) => {
      const eventTarget = event.target as HTMLElement;
      if (targetElement.contains(eventTarget)) {
        handler(event as T, targetElement);
      }
    };

    this.container.addEventListener(type, listener);
    this.subscriptions.push({ type, targetElement, listener });

    return () => {
      this.container.removeEventListener(type, listener);
      this.subscriptions = this.subscriptions.filter(
        (sub) => sub.listener !== listener
      );
    };
  }

  off(targetElement: HTMLElement, type?: string): void {
    this.subscriptions = this.subscriptions.filter((sub) => {
      if (sub.targetElement === targetElement && (!type || sub.type === type)) {
        this.container.removeEventListener(sub.type, sub.listener);
        return false;
      }
      return true;
    });
  }

  offAll(): void {
    for (const { type, listener } of this.subscriptions) {
      this.container.removeEventListener(type, listener);
    }
    this.subscriptions = [];
  }
}
