import {Block} from '../block'

class BlockNumberInput extends Block {

    constructor(info:any){
        super(info);
    }

    
    public run(message: string){
        this.publishFromOutputs("input " + this.Id + " " + this.Properties['name']);
    }

}

export { BlockNumberInput }