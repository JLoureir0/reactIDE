/**
 * 
 */
class EventBus {

  private queues: any;

  /**
   * 
   */
  constructor() {
    this.queues = {};
  }

  /**
   * the commands can be of the types: block, type or link
   * @param commands 
   */
  replay(commands: Array<{event: string, data: any}>) {
    commands.forEach(c => this.publish(c.event, c.data));
  }

  /**
   * 
   * @param evt name of the event
   * @param payload associated data, can be type, link or block
   */
  publish(evt: string, payload: any) {
    if (evt in this.queues) this.queues[evt].forEach(s => s(payload))
  }

  /**
   * 
   * @param evt 
   * @param callback
   */
  on(evt: string, callback: any) {
    if (!(evt in this.queues)) this.queues[evt] = []
    this.queues[evt].push(callback)
  }

  /**
   * 
   * @param evt 
   * @param callback
   */
  off(evt: string, callback: any) {
    if (!(evt in this.queues)) this.queues[evt] = []
    this.queues[evt] = this.queues[evt].filter(cb => cb !== callback);
  }
}

/**
 * 
 */
class EventSourcedBus extends EventBus {

  private journal: Array<{event: string, data: any}>;

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
  public publish(evt: string, payload: any) {
    this.journal.push({ event: evt, data: payload });
    super.publish(evt, payload);
  }
}

export { EventBus, EventSourcedBus }
