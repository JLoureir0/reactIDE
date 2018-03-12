"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Dependencies
 */
var WS = require("ws");
var WSS = WS.Server;
var wss = new WSS({ port: 8081 });
var eventbus_1 = require("./eventbus");
var model_1 = require("./model");
var eventdispatcher_1 = require("./eventdispatcher");
var mqttrouter_1 = require("./mqttrouter");
// MQTT testing
var MQTT = require("mqtt");
var mqttClient = MQTT.connect('mqtt://localhost:1883');
//tirar isto daqui eventualmente...
var domainEventBus = new eventbus_1.EventBus();
var model = new model_1.Model(domainEventBus);
var socketTest = null;
/**
 *
 * @param socket
 */
function loadmodel(socket) {
    //const domainEventBus = new EventBus();
    var actionBus = new eventbus_1.EventBus();
    // const model = new Model(domainEventBus);
    var mqttRouter = new mqttrouter_1.MqttRouter(model);
    var eventDispatcher = new eventdispatcher_1.EventDispatcher(model, actionBus, mqttRouter);
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
        { event: 'CREATE_BLOCK', data: { id: "blockA", type: "input", properties: { name: "2" } } },
        { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: "blockA", geom: { x: 100, y: 100 } } },
        { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: "blockA", outputs: [{ id: "node_1" }] } },
        //constant 2
        { event: 'CREATE_BLOCK', data: { id: "blockB", type: "input", properties: { name: "2" } } },
        { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: "blockB", geom: { x: 100, y: 300 } } },
        { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: "blockB", outputs: [{ id: "node_2" }] } },
        //function +
        { event: 'CREATE_BLOCK', data: { id: "blockC", type: "function", properties: { name: "+" } } },
        { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: "blockC", geom: { x: 300, y: 200 } } },
        { event: 'CHANGE_BLOCK_INPUTS', data: { id: "blockC", inputs: [{ id: "node_3" }, { id: "node_4" }] } },
        { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: "blockC", outputs: [{ id: "node_5" }, { id: "node_6" }] } },
        //function console
        { event: 'CREATE_BLOCK', data: { id: "blockD", type: "console" } },
        { event: 'CHANGE_BLOCK_PROPERTIES', data: { id: "blockD", properties: { name: "Output", text: "" } } },
        { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: "blockD", geom: { x: 500, y: 200, expanded: true, width: 150, height: 150 } } },
        { event: 'CHANGE_BLOCK_INPUTS', data: { id: "blockD", inputs: [{ id: "node_7" }] } },
        //trigger
        { event: 'CREATE_BLOCK', data: { id: "blockE", type: "trigger", properties: { name: "Trigger - 1s" } } },
        { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: "blockE", geom: { x: 300, y: 500 } } },
        { event: 'CHANGE_BLOCK_INPUTS', data: { id: "blockE", inputs: [{ id: "node_8" }] } },
        //links
        { event: 'CREATE_LINK', data: { id: "node_1_node_3", from: { node: "node_1" }, to: { node: "node_3" } } },
        { event: 'CREATE_LINK', data: { id: "node_2_node_4", from: { node: "node_2" }, to: { node: "node_4" } } },
        { event: 'CREATE_LINK', data: { id: "node_5_node_7", from: { node: "node_5" }, to: { node: "node_7" } } },
        { event: 'CREATE_LINK', data: { id: "node_6_node_8", from: { node: "node_6" }, to: { node: "node_8" } } },
        { event: 'COMMIT', data: {} }
    ]);
    var json = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'SNAPSHOT', data: JSON.parse(model.toJson()) } });
    try {
        socket.send(json);
        console.log("Sent: " + json);
    }
    catch (e) {
        console.log("Error while deserializing the model.");
    }
}
/**
 *
 * @param message
 */
function parseMessage(message) {
    console.log("Received: " + message);
}
/**
 *
 */
wss.on('connection', function (socket) {
    console.log('Opened connection 🎉');
    socket.send(JSON.stringify({ event: 'DEBUG', data: 'ack' }));
    //tirar isto
    socketTest = socket;
    loadmodel(socket);
    socket.on('message', parseMessage);
    socket.on('close', function () { return console.log('Closed Connection 😱'); });
});
var toggle = false;
/**
 * Send model test (client catches on backend.on('DOMAIN_EVENT', (topic, msg) )
 */
setInterval(function () {
    var json = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'SNAPSHOT', data: JSON.parse(model.toJson()) } });
    try {
        if (socketTest) {
            socketTest.send(json);
            console.log("Sent: " + json);
        }
    }
    catch (e) {
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
