import {Block} from '../block'
import * as Messages from '../messages/messages'

class BlockTrigger extends Block {

    constructor(info: {id: number, type: string, properties: {name:string, text?:string}, 
        geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>}){
        super(info);

        setInterval(() => {
            this.publishFromInputs(Messages.getTriggerMessage());
        }, 2000);
    }

    public run(topic: string, message: string){

    }
}

export { BlockTrigger }