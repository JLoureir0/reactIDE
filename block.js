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

        this.mqttClient.on('message', (topic, message) => console.log(this.id + " " + topic + " " + message));

        this.subscribeInputs();
        this.subscribeOutputs();
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

    overrideDetails(info,property){
        this[property] = info[property];
      if(property == "inputs"){
          this.subscribeInputs();
      } else if(property == "outputs") {
          this.subscribeOutputs();
      }
    }


    triggerFunction(message) {
        setInterval(() => {
            console.log("olaaaaa");
            console.log(this.inputs);
            for (let i = 0; i < this.inputs.length; i++) {
                this.mqttClient.publish(this.id + "/TAKE/" + this.inputs[i]['id'], message);
            }
        }, 2000);
        
    }

}

module.exports = Block;