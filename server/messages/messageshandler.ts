export function getInputFromMessage(message: string) : string {
    const res:string[] = message.split(" ");
    if(res.length == 2){
        if(res[0] == "input"){
            return res[1];
        }
    }
    return "";
}

export function getOutputFromMessage(message: string) : string {
    const res:string[] = message.split(" ");
    if(res.length == 2){
        if (res[0] == "output") {
            return res[1];
        }
    }
    return "";
}

export function getNodeFromTopic(topic: string) : string {
    const res:string[] = topic.split("/");
    if(res.length == 3){
        return res[2];
    }
    return "";
}

export enum MessageType {
    RECEIVEINPUT,
    RECEIVEOUTPUT
}

export function getMessageType(message: string) : MessageType {
    const res:string[] = message.split(" ");
    if(res.length == 2){
        if(res[0] == "input" ){
            return MessageType.RECEIVEINPUT;
        } else if(res[0] == "output"){
            return MessageType.RECEIVEOUTPUT;
        }
    }
    return null;
}