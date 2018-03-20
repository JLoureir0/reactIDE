export function getTriggerMessage() : string {
    return "work";
}

export function getInputMessage(input: any) : string{
    return "input " + input.toString();
}

export function getOutputMessage(res: any) : string{
    return "output " + res.toString();
}

export function pullInputs(){
    return "need inputs";
}
