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

/**
 * 
 * @param socket 
 */
function loadmodel(socket: WS) {

  //const domainEventBus = new EventBus();
  const actionBus = new EventBus();
  // const model = new Model(domainEventBus);
  const mqttRouter = new MqttRouter(model);
  const eventDispatcher = new EventDispatcher(model, actionBus, mqttRouter);

  actionBus.replay([
    { event: 'CREATE_TYPE', data: { id: "input", icon: "fa fa-code" } },
    { event: 'CREATE_TYPE', data: { id: "console", icon: "fa-terminal", style: "red-block console-block" } },
    { event: 'CREATE_TYPE', data: { id: "function", icon: "fa fa-code", style: "gray-block" } },
    { event: 'CREATE_TYPE', data: { id: "comment", style: "green-block" } },
    { event: 'CREATE_TYPE', data: { id: "trigger", icon: "fa fa-caret-square-o-right", style: "blue-block" } },

    //{event: 'CREATE_TYPE', data: {id: "random", icon: "fa-random", style: "red-block" }},
    //{event: 'CREATE_TYPE', data: {id: "slider", icon: "fa-sliders", style: "green-block" }},
    //{event: 'CREATE_TYPE', data: {id: "anonymous" }},

    //constant 2
    { event: 'CREATE_BLOCK', data: { id: 1, type: "input", properties: { name: "2" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 1, geom: { x: 100, y: 100 } } },
    { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 1, outputs: [{ id: "node_1" }] } },

    //constant 2
    { event: 'CREATE_BLOCK', data: { id: 2, type: "input", properties: { name: "2" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 2, geom: { x: 100, y: 300 } } },
    { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 2, outputs: [{ id: "node_2" }] } },

    //constant 2
    { event: 'CREATE_BLOCK', data: { id: 3, type: "input", properties: { name: "7" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 3, geom: { x: 100, y: 500 } } },
    { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 3, outputs: [{ id: "node_3" }] } },
        

    //function +
    { event: 'CREATE_BLOCK', data: { id: 5, type: "function", properties: { name: "*" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 5, geom: { x: 300, y: 200 } } },
    { event: 'CHANGE_BLOCK_INPUTS', data: { id: 5, inputs: [{ id: "node_4" }, { id: "node_5" }, { id: "node_6" }] } },
    { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 5, outputs: [ { id: "node_7" }, { id: "node_15" }] } },

    //constant 2
    { event: 'CREATE_BLOCK', data: { id: 4, type: "input", properties: { name: "10" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 4, geom: { x: 300, y: 100 } } },
    { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 4, outputs: [{ id: "node_8" }] } },

    //function +
    { event: 'CREATE_BLOCK', data: { id: 6, type: "function", properties: { name: "+" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 6, geom: { x: 500, y: 200 } } },
    { event: 'CHANGE_BLOCK_INPUTS', data: { id: 6, inputs: [{ id: "node_9" }, { id: "node_10" }] } },
    { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 6, outputs: [{ id: "node_11" }] } },

    //function console
    { event: 'CREATE_BLOCK', data: { id: 7, type: "console" } },
    { event: 'CHANGE_BLOCK_PROPERTIES', data: { id: 7, properties: { name: "Output", text: "" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 7, geom: { x: 800, y: 200, expanded: true, width: 150, height: 150 } } },
    { event: 'CHANGE_BLOCK_INPUTS', data: { id: 7, inputs: [{ id: "node_13" }] } },

    //function console
    { event: 'CREATE_BLOCK', data: { id: 9, type: "console" } },
    { event: 'CHANGE_BLOCK_PROPERTIES', data: { id: 9, properties: { name: "Output", text: "" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 9, geom: { x: 500, y: 300, expanded: true, width: 150, height: 150 } } },
    { event: 'CHANGE_BLOCK_INPUTS', data: { id: 9, inputs: [{ id: "node_16" }] } },

    //trigger
    { event: 'CREATE_BLOCK', data: { id: 8, type: "trigger", properties: { name: "Trigger - 1s" } } },
    { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 8, geom: { x: 300, y: 500 } } },
    { event: 'CHANGE_BLOCK_INPUTS', data: { id: 8, inputs: [{ id: "node_14" }] } },
    { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 8, outputs: [{ id: "node_17" }] } },

    //links
    { event: 'CREATE_LINK', data: { id: 1, from: { node: "node_1" }, to: { node: "node_4" } } },
    { event: 'CREATE_LINK', data: { id: 2, from: { node: "node_2" }, to: { node: "node_5" } } },
    { event: 'CREATE_LINK', data: { id: 3, from: { node: "node_3" }, to: { node: "node_6" } } },
    { event: 'CREATE_LINK', data: { id: 4, from: { node: "node_7" }, to: { node: "node_10" } } },
    { event: 'CREATE_LINK', data: { id: 5, from: { node: "node_8" }, to: { node: "node_9" } } },
    { event: 'CREATE_LINK', data: { id: 6, from: { node: "node_11" }, to: { node: "node_14" } } },
    { event: 'CREATE_LINK', data: { id: 7, from: { node: "node_17" }, to: { node: "node_13" } } },
    { event: 'CREATE_LINK', data: { id: 8, from: { node: "node_15" }, to: { node: "node_16" } } },

    { event: 'COMMIT', data: {} }
  ]);

  const modelData = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'SNAPSHOT', data: JSON.parse(model.toJson()) } });
  sendToClient(modelData);
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
  socket.on('close', () => console.log('Closed Connection 😱'));
});

let toggle = false;

/**
 * Send model test (client catches on backend.on('DOMAIN_EVENT', (topic, msg) )
 */
setInterval(() => {

  const json = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'SNAPSHOT', data: JSON.parse(model.toJson()) } });

  try {
    if (socketTest) {
      socketTest.send(json);
      console.log(`Sent: ${json}`);
    }
  } catch (e) {
    console.log(e);
    console.log("Error while deserializing the model.");
  }

  //toggle = !toggle;

  /* const json = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: toggle?'select-block':'unselect-block', id: 'blockB' } });

  wss.clients.forEach((client) => {
    client.send(json);
    console.log(`Sent: ${json}`);
  }); */

  //  MQTT test
  //  mqttClient.publish('blockA/OUTPUTS/node_1', '2');
  //  mqttClient.publish('blockC/TAKE/node_3', '1');
}, 2000);

/**
 * Function to execute the client request
 */
function executeRequest(json : {event:string, data:any}) {
  const actionBus = new EventBus();
  const mqttRouter = new MqttRouter(model);
  const eventDispatcher = new EventDispatcher(model, actionBus, mqttRouter);

  actionBus.publish(json.event, json.data);

  if(json.event === "CREATE_BLOCK") {
    const createdID = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'CREATED_ID', id: model.getLastBlockID() } });
    sendToClient(createdID);
  } 
  
  const modelData = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'SNAPSHOT', data: JSON.parse(model.toJson()) } });
  sendToClient(modelData);
}

/**
 * Function to send data to the client
 */
function sendToClient(message : string) {
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

