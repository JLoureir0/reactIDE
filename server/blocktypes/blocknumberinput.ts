import {Block} from '../block'
import * as Messages from '../messages/messages';

class BlockNumberInput extends Block {

    constructor(info: {id: number, type: string, properties: {name:string, text?:string}, 
        geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>}){
        super(info);
    }

    
    public run(topic: string, message: string){
        this.publishFromOutputs(Messages.getInputMessage(this.Properties['name']));
    }

}

export { BlockNumberInput }