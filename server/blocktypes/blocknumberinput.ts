import {Block} from '../block'
import * as Messages from '../messages/messages';

class BlockNumberInput extends Block {

    constructor(info:any){
        super(info);
    }

    
    public run(topic: string, message: string){
        this.publishFromOutputs(Messages.getInputMessage(this.getProperties['name']));
    }

}

export { BlockNumberInput }