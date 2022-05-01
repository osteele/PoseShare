class EventEmitter {
  #listeners = [];

  addListener(eventName, listener) {
    this.listeners.push({ eventName, listener });
  }

  on(eventName, listener) {
    this.addListener(eventName, listener);
  }

  emit(eventName, ...args) {
    this.listeners
      .filter(listener => listener.eventName === eventName)
      .forEach(
        ({ callback }) =>
          callback.apply(this, args)
      );
  }
}
