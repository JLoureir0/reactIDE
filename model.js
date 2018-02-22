const fs = require('fs');

class Model {
    constructor(domainEventBus) {
      this.blocks = {};
      this.connections = {};
      this.types = {};
      this.domainEventBus = domainEventBus;
    }

    createBlock(block) {
      this.blocks[block.id] = block;

      // Define some sensible defaults.
      // TODO: Block should probably become a class
      if (!block.geom) block.geom = {};
      if (!block.properties) block.properties = {};
      if (!block.inputs) block.inputs = [];
      if (!block.outputs) block.outputs = [];

      this.domainEventBus.publish('BLOCK_CREATED', block);
    }

    destroyBlock(block) {
      delete this.blocks[block.id];
      this.domainEventBus.publish('BLOCK_DESTROYED', block);
    }

    overrideBlockDetails(block, property, eventId) {
      const b = this.blocks[block.id];
      Object.assign(b[property], block[property]);
      this.domainEventBus.publish(eventId, block);
    }

    changeBlockGeometry(block) {
      this.overrideBlockDetails(block, 'geom', 'BLOCK_GEOMETRY_CHANGED');
    }

    changeBlockProperties(block) {
      this.overrideBlockDetails(block, 'properties', 'BLOCK_PROPERTIES_CHANGED');
    }

    changeBlockInputs(block) {
      this.overrideBlockDetails(block, 'inputs', 'BLOCK_INPUTS_CHANGED');
    }

    changeBlockOutputs(block) {
      this.overrideBlockDetails(block, 'outputs', 'BLOCK_OUTPUTS_CHANGED');
    }

    createLink(link) {
      this.connections[link.id] = link;
      this.domainEventBus.publish('LINK_CREATED', link);
    }

    createType(type) {
      this.types[type.id] = type;
      this.domainEventBus.publish('TYPE_CREATED', type);
    }

    destroyLink(link) {
      delete this.connections[link.id];
      this.domainEventBus.publish('LINK_DESTROYED', link);
    }

    commit() {
      fs.writeFileSync('model.json', this.toJson(), 'utf-8');
    }

    toJson() {
      return JSON.stringify(this, (key, val) => { if (key !== "domainEventBus") return val });
    }
}

module.exports = Model;
