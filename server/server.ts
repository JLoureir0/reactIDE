/**
 * Dependencies
 */
import * as WS from 'ws';
const WSS = WS.Server;
const wss = new WSS({ port: 8081 });

import { EventBus, EventSourcedBus } from './eventbus';
import { Model } from './model';
import { EventDispatcher } from './eventdispatcher';
import { MqttRouter } from './mqttrouter';

// MQTT testing
import * as MQTT from 'mqtt';
const mqttClient = MQTT.connect('mqtt://localhost:1883');


//tirar isto daqui eventualmente...
const domainEventBus = new EventBus();
const model = new Model(domainEventBus);
let socketTest = null;

let path: string = 'server/models/model-original.json';

/**
 * 
 * @param socket 
 */
function loadmodel(socket: WS) {

  //const domainEventBus = new EventBus();
  const actionBus = new EventBus();
  // const model = new Model(domainEventBus);
  const mqttRouter = new MqttRouter(model);
  const eventDispatcher = new EventDispatcher(model, actionBus, mqttRouter, path);

  let modelJSON = model.push(path);
  let events = modelToEvent(modelJSON);

  actionBus.replay(events);

  sendSnapshotToClient();
}

function modelToEvent(modelJSON) {
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

/**
 * 
 * @param message 
 */
function parseMessage(message: string) {
  const json = JSON.parse(message);
  executeRequest(json);
}

/**
 * 
 */
wss.on('connection', (socket: WS) => {
  console.log('Opened connection 🎉');
  socket.send(JSON.stringify({ event: 'DEBUG', data: 'ack' }));

  //tirar isto
  socketTest = socket;

  loadmodel(socket);

  socket.on('message', parseMessage);

  socket.on('close', () => {
    console.log('Closed Connection 😱')
    //save model
    model.commit(path);
  });
});

let toggle = false;

/**
 * Function to execute the client request
 */
function executeRequest(json: { event: string, data: any }) {
  const actionBus = new EventBus();
  const mqttRouter = new MqttRouter(model);
  const eventDispatcher = new EventDispatcher(model, actionBus, mqttRouter, path);

  console.log("< < <")
  console.log(json.event);
  console.log(json.data)
  console.log("> > >")

  actionBus.publish(json.event, json.data);

  if (json.event === "CREATE_BLOCK") {
    console.log("Aqui")
    const createdID = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'CREATED_ID', id: model.getLastBlockID() } });
    console.log(createdID)
    sendDataToClient(createdID);
  }
  else {
    sendSnapshotToClient();
  }
}

/**
 * Function to send data to the client
 */
function sendDataToClient(message: string) {
  try {
    if (socketTest) {
      socketTest.send(message);
      console.log(`Sent: ${message}`);
    }
  } catch (e) {
    console.log(e);
    console.log("Error while deserializing the model.");
  }
}

function sendSnapshotToClient() {
  try {
    if (socketTest) {
      //snapshot
      const json = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'SNAPSHOT', data: JSON.parse(model.toJson()) } });
      socketTest.send(json);
      console.log(`Sent: ${json}`);
    }
  } catch (e) {
    console.log(e);
    console.log("Error while deserializing the model.");
  }
}


