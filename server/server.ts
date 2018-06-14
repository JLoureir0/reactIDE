/**
 * Dependencies
 */
import * as WS from 'ws';
import { EventBus, EventSourcedBus } from './eventbus';
import { Model } from './model';
import { EventDispatcher } from './eventdispatcher';
import { MqttRouter } from './mqttrouter';
import * as MQTT from 'mqtt';

class Server {
  public static readonly PORT:number = 8081;
  public static readonly MQTT_URL:string = 'mqtt://localhost:1883';
  public static readonly MODEL_PATH:string = 'server/models/model-original.json';
  public static socket:WS;
  private static websocketServer;
  private static model:Model;
  private static eventBus:EventBus;
  private static mqttClient:MqttRouter;

  constructor() {
    Server.websocketServer = new WS.Server({ port: Server.PORT });
    Server.eventBus = new EventBus();
    Server.model = new Model(Server.eventBus);
    Server.mqttClient = new MqttRouter(Server.model);
    new EventDispatcher(Server.model, Server.eventBus, Server.mqttClient, Server.MODEL_PATH);
    
    Server.listen();
    Server.connectMQTT();
  }

  private static connectMQTT() {
    MQTT.connect(Server.MQTT_URL);
  }

  /**
   * 
   * Listen communication on websocket
   */
  private static listen() {
    Server.websocketServer.on('connection', (socket: WS) => {
      console.log('Opened connection 🎉');
      Server.socket = socket;
      
      socket.send(JSON.stringify({ event: 'DEBUG', data: 'ack' }));

      socket.on('message', Server.parseMessage);

      socket.on('close', () => {
        console.log('Closed Connection 😱')
        //save model
        Server.model.commit(Server.MODEL_PATH);
      });
    
      Server.loadModel();
    });
  }

  /**
   * 
   * Load model from file json
   */
  private static loadModel() {
    let modelJSON = Server.model.push(Server.MODEL_PATH);
    let events = Server.modelToEvent(modelJSON);

    console.log('events');
    console.log(events);

    Server.eventBus.replay(events);

    Server.sendSnapshotToClient();
  }

  /**
   * Function to send data to the client
   */
  public static sendDataToClient(message: string) {
    try {
      if (Server.socket) {
        Server.socket.send(message);
        console.log(`Sent: ${message}`);
      }
    } catch (e) {
      console.log(e);
      console.log("Error while deserializing the model.");
    }
  }

  private static sendSnapshotToClient() {
    try {
      if (Server.socket) {
        //snapshot
        const json = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'SNAPSHOT', data: JSON.parse(Server.model.toJson()) } });
        Server.socket.send(json);
        console.log(`Sent: ${json}`);
      }
    } catch (e) {
      console.log(e);
      console.log("Error while deserializing the model.");
    }
  }

  /**
   * 
   * @param message 
   */
  private static parseMessage(message: string) {
    const json = JSON.parse(message);
    Server.executeRequest(json);
  }

  /**
   * Function to execute the client request
   */
  private static executeRequest(json: { event: string, data: any }) {
    console.log("< < <")
    console.log(json.event);
    console.log(json.data)
    console.log("> > >")

    Server.eventBus.publish(json.event, json.data);

    if (json.event === "CREATE_BLOCK") {
      const createdID = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'CREATED_ID', id: Server.model.getLastBlockID() } });
      Server.sendDataToClient(createdID);
    }
    else {
      Server.sendSnapshotToClient();
    }
  }

  private static modelToEvent(modelJSON) {
    let events = [];

    let blocks = modelJSON.blocks;

    blocks.forEach(block => {
      let geom = block.geom;
      let inputs = block.inputs;
      let outputs = block.outputs;

      delete block.geom;
      delete block.inputs;
      delete block.outputs;

      //evento de criar bloco (sem geom input e output)
      let ev = { event: 'CREATE_BLOCK', data: block };
      events.push(ev);

      //evento de mudar geometria
      ev = { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: block.id, geom: geom } };
      events.push(ev);

      //evento de mudar inputs (verificar se esta vazio)
      if (inputs != []) {
        ev = { event: 'CHANGE_BLOCK_INPUTS', data: { id: block.id, inputs: inputs } }
        events.push(ev);
      }

      //evento de mudar outputs (verificar se esta vazio)
      if (outputs != []) {
        ev = { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: block.id, outputs: outputs } };
        events.push(ev);
      }
    });

    let connections = modelJSON.connections;
    connections.forEach(con => {
      let ev = { event: 'CREATE_LINK', data: con }
      events.push(ev);
    });

    let types = modelJSON.types;
    types.forEach(type => {
      let ev = { event: 'CREATE_TYPE', data: type };
      events.push(ev);
    });

    return events;
  }
}

export { Server }
