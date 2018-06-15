export function getValueFromMessage(message: string) : string {
    return message.split("-")[0];
}

export function getEnabledFromMessage(message: string) : boolean {
    const res:string[] = message.split("-");

    if(res[1] == "false") {
        return false;
    } else {
        return true;
    }
}

export function getNodeFromTopic(topic: string) : string {
    const res:string[] = topic.split("/");
    if(res.length == 3){
        return res[2];
    }
    return "";
}

export enum MessageType {
    REACHEDMYINPUT,
    REACHEDMYOUTPUT
}

export function getMessageType(message: string) : MessageType {
    const res:string[] = message.split("/");
    if(res.length == 3){
        if(res[1] == "TAKE" ){
            return MessageType.REACHEDMYOUTPUT;
        } else if(res[1] == "INPUTS"){
            return MessageType.REACHEDMYINPUT;
        }
    }
    return null;
}