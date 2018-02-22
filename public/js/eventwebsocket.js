class EventWebSocket {
  constructor(url) {
    this.conn = new WebSocket(url);
    this.callbacks = {};

    this.conn.onmessage = (evt) => {
      const json = JSON.parse(evt.data);
      this._dispatch(json.event, json.data)
    };

    this.conn.onclose = () => { this._dispatch('close', null) };
    this.conn.onopen  = () => { this._dispatch('open', null) };
  }

  on(event_name, callback) {
    this.callbacks[event_name] = this.callbacks[event_name] || [];
    this.callbacks[event_name].push(callback);
    return this;
  }

  send(event_name, event_data) {
    const payload = JSON.stringify({ event: event_name, data: event_data });
    this.conn.send(payload);
    return this;
  }

  _dispatch(event_name, message) {
    (this.callbacks[event_name] || []).forEach(c => c(event_name, message));
  }
}
