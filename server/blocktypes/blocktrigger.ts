import {Block} from '../block'
import * as Messages from '../messages/messages'

class BlockTrigger extends Block {

    constructor(info:any){
        super(info);

        setInterval(() => {
            this.publishFromInputs(Messages.getTriggerMessage());
        }, 2000);
    }

    public run(topic: string, message: string){

    }
}

export { BlockTrigger }