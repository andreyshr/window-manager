export class EventEmitter<
  TEventMap extends Record<string, any> = Record<string, any>,
> {
  private events: {
    [K in keyof TEventMap]?: Array<(data: TEventMap[K]) => void>;
  } = {};

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Callback function that receives event data
   */
  on<K extends keyof TEventMap>(
    event: K,
    callback: (data: TEventMap[K]) => void
  ) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param event Event name
   * @param callback Callback to remove
   */
  off<K extends keyof TEventMap>(
    event: K,
    callback: (data: TEventMap[K]) => void
  ) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event]?.filter((_cb) => _cb !== callback);

    if (this.events[event]?.length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Emit an event with data
   * @param event Event name
   * @param data Event data
   */
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]) {
    if (this.events[event]) {
      this.events[event]?.forEach((cb) => cb(data));
    }
  }
}
