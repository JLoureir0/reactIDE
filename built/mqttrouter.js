"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class dependencies
 */
var MQTT = require("mqtt");
/**
 * Class responsible for the routing of the MQTT messages
 * between blocks.
 */
var MqttRouter = /** @class */ (function () {
    /**
     * Create a MqttRouter.
     *
     * @param {Model} model - The model containing the blocks and theirs links
     */
    function MqttRouter(model) {
        var _this = this;
        //TODO: ter isto como const
        this.mqttClient = MQTT.connect('mqtt://localhost:1883');
        // TODO: links and nodes info should be extracted from model, not efficient enough right now
        this.model = model;
        this.nodes = {};
        this.links = {};
        this.reverseLinks = {};
        this.mqttClient.on('message', function (topic, message) { return _this.routeMessage(topic, message); });
    }
    ;
    /**
     * Subscribe the MQTT channels that a block uses to request the data
     * for its input nodes.
     *
     * @param {{}} block - The block that contains the nodes
     */
    MqttRouter.prototype.subscribeInputNodes = function (block) {
        var _this = this;
        if (block.id) {
            if (block.inputs) {
                block.inputs.forEach(function (node) {
                    _this.mqttClient.subscribe(block.id + "/TAKE/" + node.id);
                    _this.nodes[node.id] = block.id;
                });
            }
        }
    };
    ;
    /**
     * Subscribe the MQTT channels that a block uses to send the output
     * through its output nodes.
     *
     * @param {{}} block - The block that contains the nodes
     */
    MqttRouter.prototype.subscribeOutputNodes = function (block) {
        var _this = this;
        if (block.id)
            if (block.outputs)
                block.outputs.forEach(function (node) {
                    _this.mqttClient.subscribe(block.id + "/OUTPUTS/" + node.id);
                    _this.nodes[node.id] = block.id;
                });
    };
    ;
    /**
     * Route a message from a channel to another. It is used for the blocks
     * to request or send data not knowing anything but it's own channels
     *
     * @param {string} topic - Topic that the message was received from
     * @param {Buffer} message - Message that was received
     */
    MqttRouter.prototype.routeMessage = function (topic, message) {
        console.log('RECEIVED:');
        console.log("Topic: " + topic + " - Message: " + message.toString());
        var topicArray = topic.split('/');
        if (topicArray.length == 3 && topicArray[1] == 'OUTPUTS')
            this.redirectOutput(topicArray[2], message);
        if (topicArray.length == 3 && topicArray[1] == 'TAKE')
            this.redirectTake(topicArray[2], message);
    };
    ;
    /**
     * Redirects the output of a node to its destination.
     *
     * @param {string} nodeID - Node that sent the message
     * @param {Buffer} message - message sent
     */
    MqttRouter.prototype.redirectOutput = function (nodeID, message) {
        console.log('REDIRECTING TO:');
        console.log("Topic: " + this.nodes[this.links[nodeID]] + "/INPUTS/" + this.links[nodeID] + " - Message: " + message.toString());
        this.mqttClient.publish(this.nodes[this.links[nodeID]] + "/INPUTS/" + this.links[nodeID], message);
    };
    /**
     * The take message is used to request data from a node.
     * Route the message requesting information to the right node.
     *
     * @param {string} nodeID - Node that sent the message
     * @param {Buffer} message - message sent
     */
    MqttRouter.prototype.redirectTake = function (nodeID, message) {
        console.log('REDIRECTING TO:');
        console.log("Topic: " + this.nodes[this.reverseLinks[nodeID]] + "/TAKE/" + this.reverseLinks[nodeID] + " - Message: " + message.toString());
        this.mqttClient.publish(this.nodes[this.reverseLinks[nodeID]] + "/TAKE/" + this.reverseLinks[nodeID], message);
    };
    /**
     * Store the links in a temporary class variable.
     *
     * @param {Object} link - Link between two nodes
     */
    MqttRouter.prototype.createLink = function (link) {
        this.links[link.from.node] = link.to.node;
        this.reverseLinks[link.to.node] = link.from.node;
    };
    return MqttRouter;
}());
exports.MqttRouter = MqttRouter;
;
