import {Block} from '../block'

class BlockSum extends Block {

    constructor(info:any){
        super(info);
    }

    public run(message: string){
        if (message == "work") {
            this.inputblockA = null;
            this.inputblockB = null;
            this.publishFromInputs("need inputs!");
        } else {
            const x = (message + "").split(" ");
            if (x[0] == "input") {
                this["input" + x[1]] = x[2];
            }
            if (this.inputblockA != null && this.inputblockB != null) {
                const input1 = parseInt(this.inputblockA);
                const input2 = parseInt(this.inputblockB);
                if (!isNaN(input1) && !isNaN(input2)) {
                    const res = input1 + input2;
                    this.publishFromOutputs("result: " + res);
                }
            }

        }
    }
}

export { BlockSum }