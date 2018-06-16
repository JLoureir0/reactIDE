/**
 * Class dependencies
 */
import * as MQTT from 'mqtt';

type jsonBlock = { id: number, type?: string, properties?: { name: string, text?: string, enabled?: boolean }, geom?: { x: number, y: number, expanded?: boolean }, inputs?: Array<{ id: string }>, outputs?: Array<{ id: string }> };

/**
 * 
 */
class Block {

    private mqttClient: MQTT.Client;
    private id: number;
    private type: string;
    private geom?: { x: number, y: number, expanded?: boolean };
    private properties?: { name: string, text?: string, enabled?: boolean };
    private inputs?: Array<{ id: string }>;
    private outputs?: Array<{ id: string }>;

    /**
     * 
     * @param info 
     */
    constructor(info: jsonBlock) {
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
        //delete ID?
    }

    /**
     * 
     * @param info 
     * @param property 
     */
    public overrideDetails(info: jsonBlock, property: string) {
        if (property == "properties") {
            // To edit with new values
            Object.keys(info.properties).forEach((key) => {
                this.properties[key] = info.properties[key];
            });
        } else {
            this[property] = info[property];
        }
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
            if (this.inputs[i]['id'] == node) {
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
            if (this.outputs[i]['id'] == node) {
                this.mqttClient.publish(this.id + "/OUTPUTS/" + this.outputs[i]['id'], message);
            }
        }
    }

    /**
     * 
     */
    public deleteInput(id: string): boolean {
        if (this.inputs.length > 0) {
            let new_inputs = this.inputs.filter(inp => { return (inp.id !== id) });
            if (new_inputs.length !== this.inputs.length) {
                this.inputs = new_inputs;
                this.run('', 'work');
                return true;
            }
        }
        return false;
    }

    /**
     * 
     */
    public deleteOutput(id: string): boolean {
        if (this.outputs.length > 0) {
            let new_outputs = this.outputs.filter(inp => { return (inp.id !== id) });
            if (new_outputs.length !== this.outputs.length) {
                this.outputs = new_outputs;
                this.run('', 'work');
                return true;
            }
        }
        return false;
    }

    /**
     * get ID of the block
     */
    get Id(): number {
        return this.id;
    }

    get Outputs(): Array<{ id: string }> {
        return this.outputs;
    }

    get Inputs(): Array<{ id: string }> {
        return this.inputs;
    }

    get Properties(): { name: string, text?: string, enabled?: boolean } {
        return this.properties;
    }

    get Geom(): { x: number, y: number, expanded?: boolean, width?: number, height?: number } {
        return this.geom;
    }
}

export { Block };