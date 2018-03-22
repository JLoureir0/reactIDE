export function getTriggerMessage() : string {
    return "work";
}

export function getInputMessage(input: string) : string{
    return "input " + input.toString();
}

export function getOutputMessage(res: number) : string{
    return "output " + res.toString();
}

export function pullInputs(){
    return "need inputs";
}
