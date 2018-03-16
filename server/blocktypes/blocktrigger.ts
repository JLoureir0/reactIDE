import {Block} from '../block'

class BlockTrigger extends Block {

    constructor(info:any){
        super(info);

        setInterval(() => {
            this.publishFromInputs("work");
        }, 2000);
    }

    public run(){

    }
}

export { BlockTrigger }