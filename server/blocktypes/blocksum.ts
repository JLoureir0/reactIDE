import { Block } from '../block'
import * as Messages from '../messages/messages';
import * as MessagesHandler from '../messages/messageshandler';
import TSMAP from 'ts-map'

class BlockSum extends Block {

    private numberInputs: Array<number> = new Array();
    private inputsMap: TSMAP<string, number> = new TSMAP<string, number>();


    constructor(info: {id: number, type: string, properties: {name:string, text?:string}, 
        geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>}) {
        super(info);
    }

    public run(topic: string, message: string) {
        if(MessagesHandler.getMessageType(message) == MessagesHandler.MessageType.RECEIVEINPUT){
            const key:string = MessagesHandler.getNodeFromTopic(topic);
            const valueString:string = MessagesHandler.getInputFromMessage(message);
            const value:number = parseFloat(valueString);
            if(!isNaN(value)){
                this.inputsMap.set(key, value);
            }
        }

        if (this.inputsMap.size == this.Inputs.length) {
            //if the map has all the necessary inputs, send message
            let res = 0;
            this.inputsMap.forEach((value, key) => {
                res += value;
            })
            this.publishFromOutputs(Messages.getOutputMessage(res));
        } else {
            //if map is missing any inputs -> pull from any missing inputs
            for(let i = 0; i < this.Inputs.length; i++){
                if(this.inputsMap.get(this.Inputs[i].id) == undefined){
                    this.publishFromInput(this.Inputs[i].id, Messages.pullInputs());
                }
            }
        }  
    }
}

export { BlockSum }