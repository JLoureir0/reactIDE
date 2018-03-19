import {Block} from '../block'
import * as MessagesHandler from '../messages/messageshandler'
import * as Messages from '../messages/messages'

class BlockConsole extends Block {

    constructor(info:any){
        super(info);
    }

    public run(topic: string, message: string){
        if(MessagesHandler.getMessageType(message) == MessagesHandler.MessageType.RECEIVEOUTPUT){
            this.getProperties['text'] = MessagesHandler.getOutputFromMessage(message.toString());
        } else {
            this.publishFromInputs(Messages.pullInputs());
        }
    }
}

export { BlockConsole };