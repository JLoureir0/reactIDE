import {Block} from '../block'
import * as Messages from '../messages/messages';

type jsonBlock = {id: number, type?: string, properties?: {name:string, text?:string}, geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};

class BlockNumberInput extends Block {

    constructor(info: jsonBlock){
        super(info);
    }

    
    public run(topic: string, message: string){
        this.publishFromOutputs(Messages.getInputMessage(this.Properties['name']));
    }

}

export { BlockNumberInput }