import {Block} from '../block';
import * as MessagesHandler from '../messages/messageshandler';
import * as Messages from '../messages/messages';
import { Server } from '../server';

type jsonBlock = {id: number, type?: string, properties?: {name:string, text?:string}, geom?: {x: number, y: number, expanded?:boolean}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};

class BlockConsole extends Block {

    constructor(info: jsonBlock)
    {
        super(info);
    }

    public run(topic: string, message: string){

        super.run(topic, message);
        
        if(MessagesHandler.getMessageType(topic) == MessagesHandler.MessageType.REACHEDMYINPUT){
            // Only notify client if the value has changed
            if(this.Properties['text'] != message) {
                this.Properties['text'] = message;
                this.notifyClient();
            }
        } else {
            this.publishFromInputs(Messages.pullInputs());
        }
    }

    private notifyClient() {
        const request = JSON.stringify({ event: 'DOMAIN_EVENT', data: { event: 'CONSOLE_UPDATED', id: this.Id, text: this.Properties['text']} });
        try {            
            Server.socket.send(request);
        } catch(e) {
            console.log(e);
            console.log("Error while sending message to client.");
        }
    }
}

export { BlockConsole };