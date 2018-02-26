class Block {
    constructor(info) {
        this.id = info.id;
        (!info.geom) ? this.geom = {} : this.geom = info.geom;
        (!info.properties) ? this.properties = {} : this.properties = info.properties; 
        (!info.inputs) ? this.inputs = [] : this.inputs = info.inputs;
        (!info.outputs) ? this.outputs = [] : this.outputs = info.outputs;
    }

}

module.exports = Block;