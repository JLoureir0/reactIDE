const MQTT = require('mqtt');

class Block {
    constructor(info) {
        this.mqttClient = MQTT.connect('mqtt://localhost:1883');
        this.id = info.id;
        this.type = info.type;
        (!info.geom) ? this.geom = {} : this.geom = info.geom;
        (!info.properties) ? this.properties = {} : this.properties = info.properties;
        (!info.inputs) ? this.inputs = [] : this.inputs = info.inputs;
        (!info.outputs) ? this.outputs = [] : this.outputs = info.outputs;

        if(this.type == "trigger") {
            this.triggerFunction("work");
        }

        this.mqttClient.on('message', (topic, message) => this.performAction(message));

        this.subscribeInputs();
        this.subscribeOutputs();
    }

    performAction(message){
        if(this.id == "blockC"){
            if(message == "work"){
                this.inputblockA = null;
                this.inputblockB = null;
                this.publishFromInputs("need inputs!");
            } else {
                const x = (message + "").split(" ");
                if(x[0] == "input"){
                    this["input" + x[1]] = x[2];
                }
                if(this.inputblockA != null && this.inputblockB != null){
                    const input1 = parseInt(this.inputblockA);
                    const input2 = parseInt(this.inputblockB);
                    if(!isNaN(input1) && !isNaN(input2)){
                        const res = input1 + input2;
                        this.publishFromOutputs("result: " + res);
                    }
                }

            }
        } if(this.id == "blockA" || this.id == "blockB") {
            this.publishFromOutputs("input " + this.id + " " + this.properties['name']);
        } if(this.id == "blockD") {
            const y = (message +"").split(" ");
            if(y[0] == "result:"){
                this.properties['text'] = parseInt(y[1]);
            }
        }
    }

    overrideDetails(info,property){
        this[property] = info[property];
      if(property == "inputs"){
          this.subscribeInputs();
      } else if(property == "outputs") {
          this.subscribeOutputs();
      }
    }

    subscribeInputs(){
        this.inputs.forEach(input => {
            this.mqttClient.subscribe(this.id + "/INPUTS/" + input['id']);  
        });
    }

    subscribeOutputs(){
        this.outputs.forEach(output => {
            this.mqttClient.subscribe(this.id + "/TAKE/" + output['id']);  
        });
    }

    publishFromInputs(message){
        for (let i = 0; i < this.inputs.length; i++) {
            this.mqttClient.publish(this.id + "/TAKE/" + this.inputs[i]['id'], message);
        }
    }

    publishFromOutputs(message){
        for (let i = 0; i < this.outputs.length; i++) {
            this.mqttClient.publish(this.id + "/OUTPUTS/" + this.outputs[i]['id'], message);
        }
    }

    triggerFunction(message) {
        setInterval(() => {
            this.publishFromInputs(message);
        }, 2000);
    }
}

module.exports = Block;