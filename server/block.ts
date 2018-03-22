/**
 * Class dependencies
 */
import * as MQTT from 'mqtt';

/**
 * 
 */
class Block {

    private mqttClient: MQTT.Client;
    private id: number;
    private type: string;
    private geom?: {x:number,y:number};
    private properties?: {name:string, text?:string};
    private inputs?: Array<{id:string}>;
    private outputs?: Array<{id:string}>;


    /**
     * 
     * @param info 
     */
    constructor(info: 
        {id: number, type: string, properties: {name:string, text?:string}, geom?: {x: number, y: number}, 
        inputs?: Array<{id: string}>, outputs?: Array<{id: string}>}) 
    {    
        this.mqttClient = MQTT.connect('mqtt://localhost:1883');
        this.id = info.id;
        this.type = info.type;

        //TODO mudar isto
        (!info.geom) ? this.geom = null : this.geom = info.geom;
        (!info.properties) ? this.properties = null : this.properties = info.properties;
        (!info.inputs) ? this.inputs = [] : this.inputs = info.inputs;
        (!info.outputs) ? this.outputs = [] : this.outputs = info.outputs;

        this.mqttClient.on('message', (topic, message) => this.run(topic.toString(), message.toString()));

        this.subscribeInputs();
        this.subscribeOutputs();
    }

    /**
     * 
     * @param message 
     */
    public run(topic: string, message: string) {

    }

    /**
     * 
     * @param info 
     * @param property 
     */
    public overrideDetails(info: {id: number, type?: string, properties?: {name:string, text?:string}, 
        geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>}, 
        property: string) 
    {
        this[property] = info[property];
        if (property == "inputs") {
            this.subscribeInputs();
        } else if (property == "outputs") {
            this.subscribeOutputs();
        }
    }

    /**
     * 
     */
    public subscribeInputs() {
        this.inputs.forEach(input => {
            this.mqttClient.subscribe(this.id + "/INPUTS/" + input['id']);
        });
    }

    /**
     * 
     */
    public subscribeOutputs() {
        this.outputs.forEach(output => {
            this.mqttClient.subscribe(this.id + "/TAKE/" + output['id']);
        });
    }

    /**
     * 
     * @param message 
     */
    public publishFromInputs(message: string) {
        for (let i = 0; i < this.inputs.length; i++) {
            this.mqttClient.publish(this.id + "/TAKE/" + this.inputs[i]['id'], message);
        }
    }

    /**
     * 
     * @param node
     * @param message 
     */
    public publishFromInput(node: string, message: string) {
        for (let i = 0; i < this.inputs.length; i++) {
            if(this.inputs[i]['id'] == node){
                //console.log(this.inputs[i]['id']);
                this.mqttClient.publish(this.id + "/TAKE/" + this.inputs[i]['id'], message);
            }
        }
    }

    /**
     * 
     * @param message 
     */
    public publishFromOutputs(message: string) {
        for (let i = 0; i < this.outputs.length; i++) {
            this.mqttClient.publish(this.id + "/OUTPUTS/" + this.outputs[i]['id'], message);
        }
    }

    /**
     * get ID of the block
     */
    get Id(): number {
        return this.id;
    }

    get Outputs(): Array<{id: string}> {
        return this.outputs;
    }

    get Inputs(): Array<{id: string}> {
        return this.inputs;
    }

    get Properties(): {name: string, text?: string} {
        return this.properties;
    }
}

export { Block };