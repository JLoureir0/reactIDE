/**
 * 
 */
class EventBus {

  private queues;

  /**
   * 
   */
  constructor() {
    this.queues = {};
  }

  /**
   * 
   * @param commands 
   */
  replay(commands) {
    commands.forEach(c => this.publish(c.event, c.data));
  }

  /**
   * 
   * @param evt 
   * @param payload 
   */
  publish(evt, payload) {
    if (evt in this.queues) this.queues[evt].forEach(s => s(payload))
  }

  /**
   * 
   * @param evt 
   * @param callback 
   */
  on(evt, callback) {
    if (!(evt in this.queues)) this.queues[evt] = []
    this.queues[evt].push(callback)
  }

  /**
   * 
   * @param evt 
   * @param callback 
   */
  off(evt, callback) {
    if (!(evt in this.queues)) this.queues[evt] = []
    this.queues[evt] = this.queues[evt].filter(cb => cb !== callback);
  }
}

/**
 * 
 */
class EventSourcedBus extends EventBus {

  private journal;

  /**
   * 
   */
  constructor() {
    super();
    this.journal = [];
  }

  /**
   * 
   */
  public replay() {
    super.replay(this.journal);
  }

  /**
   * 
   * @param evt 
   * @param payload 
   */
  public publish(evt, payload) {
    this.journal.push({ event: evt, data: payload });
    super.publish(evt, payload);
  }
}

export { EventBus, EventSourcedBus }
