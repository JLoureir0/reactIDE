/**
 * Class dependencies
 */
import * as MQTT from 'mqtt';
import * as MessagesHandler from './messages/messageshandler';
import * as Messages from './messages/messages';

type jsonBlock = {id: number, type?: string, properties?: {name:string, text?:string}, geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>, enabled?: boolean};

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
    private enabled?: boolean;

    /**
     * 
     * @param info 
     */
    constructor(info: jsonBlock) 
    {    
        this.mqttClient = MQTT.connect('mqtt://localhost:1883');
        this.id = info.id;
        this.type = info.type;
        this.enabled = info.enabled;

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
    public overrideDetails(info: jsonBlock, property: string) 
    {
        this[property] = info[property];
        if (property == "inputs") {
            this.subscribeInputs();
        } else if (property == "outputs") {
            this.subscribeOutputs();
        } else if (property == "enabled") {
            if(info[property]) {
                console.log('Vou fazer publish1');
                this.publishFromOutputs(Messages.getEnableMessage());
            } else {
                console.log('Vou fazer publish2');
                this.publishFromOutputs(Messages.getDisableMessage());
            }
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
     * 
     * @param node
     * @param message 
     */
    public publishFromOutput(node: string, message: string) {
        for (let i = 0; i < this.outputs.length; i++) {
            if(this.outputs[i]['id'] == node){
                this.mqttClient.publish(this.id + "/OUTPUTS/" + this.outputs[i]['id'], message);
            }
        }
    }

    /**
     * Get ID of the block
     */
    get Id(): number {
        return this.id;
    }

    /**
     * Get input option of the block
     */
    get isEnabled(): boolean {
        return this.enabled;
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