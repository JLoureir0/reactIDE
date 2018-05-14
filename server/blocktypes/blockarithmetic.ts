import { Block } from '../block'
import * as Messages from '../messages/messages';
import * as MessagesHandler from '../messages/messageshandler';
import TSMAP from 'ts-map'

type jsonBlock = {id: number, type?: string, properties?: {name:string, text?:string}, geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};

class BlockArithmetic extends Block {

    private numberInputs: Array<number> = new Array();
    private inputsMap: TSMAP<string, number> = new TSMAP<string, number>();
    private operator: string;

    constructor(info: jsonBlock) {
        super(info);
        this.operator = info.properties.name;
    }

    public run(topic: string, message: string) : void
    {
        if(MessagesHandler.getMessageType(topic) == MessagesHandler.MessageType.REACHEDMYINPUT){
            const key:string = MessagesHandler.getNodeFromTopic(topic);
            const value:number = parseFloat(message);
            if(!isNaN(value)){
                this.inputsMap.set(key, value);
            }
        }

        if (this.inputsMap.size == this.Inputs.length) {
            //if the map has all the necessary inputs, send message
            let res:number;
            let firstValue:boolean = true;
            this.inputsMap.forEach((value, key) => {
                if(firstValue){
                    res = value;
                    firstValue = false;
                } else {
                    res = this.makeOperation(res, value);
                }
            })
            this.publishFromOutputs(res.toString());
        } else {
            //if map is missing any inputs -> pull from any missing inputs
            for(let i = 0; i < this.Inputs.length; i++){
                if(this.inputsMap.get(this.Inputs[i].id) == undefined){
                    this.publishFromInput(this.Inputs[i].id, Messages.pullInputs());
                }
            }
        }  
    }

    private makeOperation(res: number, value :number) : number {
        switch(this.operator){
            case "+": return res + value;
            case "-": return res - value;
            case "*": return res * value;
            case "/": return res / value;
            default: return res;
        }
    }
}

export { BlockArithmetic }