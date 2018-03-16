import {Block} from '../block'

class BlockConsole extends Block {

    constructor(info:any){
        super(info);
    }

    public run(message: string){
        const y = (message + "").split(" ");
            if (y[0] == "result:") {
                this.getProperties['text'] = parseInt(y[1]);
            }
    }
}

export { BlockConsole };