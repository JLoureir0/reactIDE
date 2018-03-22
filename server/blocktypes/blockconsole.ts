import {Block} from '../block'
import * as MessagesHandler from '../messages/messageshandler'
import * as Messages from '../messages/messages'

type jsonBlock = {id: number, type?: string, properties?: {name:string, text?:string}, geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};

class BlockConsole extends Block {

    constructor(info: jsonBlock)
    {
        super(info);
    }

    public run(topic: string, message: string){
        if(MessagesHandler.getMessageType(message) == MessagesHandler.MessageType.RECEIVEOUTPUT){
            this.Properties['text'] = MessagesHandler.getOutputFromMessage(message.toString());
        } else {
            this.publishFromInputs(Messages.pullInputs());
        }
    }
}

export { BlockConsole };