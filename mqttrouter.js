const MQTT = require('mqtt');
const mqttClient = MQTT.connect('mqtt://localhost:1883');

class MqttRouter {
    constructor(model) {
        // TODO: links info should be extracted from model, not efficient enough right now
        this.model = model;

        this.nodes = {};
        this.links = {};

        mqttClient.on('message', (topic, message) => this.routeMessage(topic, message));
    };

    subscribeInputNodes(block) {
        if(block.id)
            if(block.inputs)
                block.inputs.forEach(node => {
                    mqttClient.subscribe(`${block.id}/INPUTS/${node.id}`);
                    this.nodes[node.id] = block.id;
                });
    };

    subscribeOutputNodes(block) {
        if(block.id)
            if(block.outputs)
                block.outputs.forEach(node => {
                    mqttClient.subscribe(`${block.id}/OUTPUTS/${node.id}`)
                    this.nodes[node.id] = block.id;
                });
    };

    routeMessage(topic, message) {
        console.log('RECEIVED:');
        console.log(`Topic: ${topic} - Message: ${message.toString()}`);

        const topicArray = topic.split('/');

        if(topicArray.length == 3 && topicArray[1] == 'OUTPUTS')
            this.redirectOutput(topicArray[2], message);
    };

    redirectOutput(nodeID, message) {
        console.log('REDIRECTING TO:');
        console.log(`Topic: ${this.nodes[this.links[nodeID]]}/INPUTS/${this.links[nodeID]} - Message: ${message.toString()}`);
    }

    createLink(link) {
       this.links[link.from.node] = link.to.node;
    }
};

module.exports = MqttRouter;