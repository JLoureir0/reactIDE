class EventBus {
  constructor() {
    this.queues = {};
  }

  replay(commands) {
    commands.forEach(c => this.publish(c.event, c.data));
  }

  publish(evt, payload) {
    if (evt in this.queues) this.queues[evt].forEach(s => s(payload))
  }

  on(evt, callback) {
    if (!(evt in this.queues)) this.queues[evt] = []
    this.queues[evt].push(callback)
  }

  off(evt, callback) {
    if (!(evt in this.queues)) this.queues[evt] = []
    this.queues[evt] = this.queues[evt].filter(cb => cb !== callback);
  }
}

class EventSourcedBus extends EventBus {
  constructor() {
    super();
    this.journal = [];
  }

  replay() {
    super.replay(this.journal);
  }

  publish(evt, payload) {
    this.journal.push({event: evt, data: payload});
    super.publish(evt, payload);
  }
}

module.exports = { EventBus: EventBus, EventSourcedBus: EventSourcedBus }
