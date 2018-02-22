class Backend { }

class WSBackEnd extends Backend {
  constructor(url) {
    super();
    this.backend = new EventWebSocket(url);
    this.on('DEBUG', (topic, msg) => console.log(`${topic}: ${msg}`));
  }

  on(topic, callback) {
    this.backend.on(topic, callback);
  }
}

class MqttBackEnd extends Backend {
  constructor() {
    super();
    this.client = mqtt.connect();
    this.client.subscribe("vpl/backend");
    this.client.publish("vpl/alive", "hello world!")

    this.client.on("message", this.dispatch);
  }

  on(topic, callback) {

  }
}
