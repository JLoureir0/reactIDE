import { Block } from '../block'
import * as MessagesHandler from '../messages/messageshandler'
import * as Messages from '../messages/messages'

type jsonBlock = {id: number, type?: string, properties?: {name:string, text?:string}, geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};

class BlockIf extends Block{

    private input : number;
    private operator : string;
    private comparable : number;

    constructor(info: jsonBlock) {
        super(info);
        const args:Array<String> = info.properties.name.split(" ");
        this.operator = args[2].toString();
        this.comparable = parseFloat(args[3].toString().substring(0,args[3].toString().length-1));
    }

    public run(topic: string, message: string) : void {
        console.log(MessagesHandler.getMessageType(topic));
        if(MessagesHandler.getMessageType(topic) == MessagesHandler.MessageType.REACHEDMYINPUT){
            this.input = parseFloat(message);
            if(this.booleanOperation(this.input, this.comparable)){
                this.publishFromOutput(this.Outputs[0].id, this.input.toString());
            } else {
                this.publishFromOutput(this.Outputs[1].id, this.input.toString());
            }
        } else {
            this.publishFromInputs(Messages.pullInputs());
        }
    }

    private booleanOperation(res: number, value :number) : boolean {
        switch(this.operator){
            case ">": return res > value;
            case "<": return res < value;
            case ">=": return res >= value;
            case "<=": return res <= value;
            case "==": return res == value;
            case "===": return res === value;
            default: return false;
        }
    }

}

export { BlockIf }