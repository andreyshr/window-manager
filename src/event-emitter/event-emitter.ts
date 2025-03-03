export class EventEmitter {
  private events: Record<string, ((...arg: any[]) => void)[]> = {};

  on(event: string, cb: (...arg: any[]) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(cb);
  }

  off(event: string, cb: (...arg: any[]) => void) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((_cb) => _cb !== cb);

    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach((cb) => cb(...args));
    }
  }
}
