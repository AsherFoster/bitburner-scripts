/**
 * Lazy node `events` implementation
 * */
export class EventEmitter {
  private static MaxListeners = 100;

  private events: Record<string, any[]> = {};

  public emit(type: string, ...args: any[]): this {
    const listeners = this.events[type];
    if (listeners) listeners.forEach(l => l(...args));

    return this;
  }

  public on(type: string, listener: (...args: any[]) => any): this {
    const listeners = this.events[type] = this.events[type] || [];
    if (listeners.length >= EventEmitter.MaxListeners) {
      console.error(new Error(`Possible EventEmitter memory leak detected. ${listeners.length} ${type} listeners added. Use EventEmitter.MaxListeners to increase limit`));
    }
    if (!listeners.includes(listener)) listeners.push(listener); // don't add the same object twice

    return this;
  }

  public once(type: string, listener: (...args: any[]) => any): this {
    this.on(type, (...args) => {
      this.removeListener(type, listener);
      listener(...args);
    });

    return this;
  }

  public next(type: string): Promise<any> {
    return new Promise(r => this.once(type, a => r(a)));
  }

  public removeListener(type: string, listener: (...args: any[]) => any): this {
    const listeners = this.events[type];
    if (listeners && listeners.includes(listeners)) listeners.splice(listeners.indexOf(listener), 1);

    // delete the key once all listeners have been unregistered
    // we might use a unique-key centric system, so should avoid pollution from this
    if (!listeners.length) delete this.events[type];

    return this;
  }
}

declare global {
  interface Window {
    eventBus: EventEmitter
  }
}

if (!self.eventBus) self.eventBus = new EventEmitter();

const eventBus = self.eventBus;

export default eventBus;
