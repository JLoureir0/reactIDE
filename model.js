const fs = require('fs');
const BlockFactory = require('./blockfactory');

class Model {
    constructor(domainEventBus) {
      this.blocks = {};
      this.connections = {};
      this.types = {};
      this.domainEventBus = domainEventBus;
    }

    createBlock(newBlockInfo) {
      const block = BlockFactory.instance.buildBlock(newBlockInfo);
      this.blocks[block.id] = block;     
      this.domainEventBus.publish('BLOCK_CREATED', newBlockInfo);
    }

    destroyBlock(blockInfo) {
      delete this.blocks[blockInfo.id];
      this.domainEventBus.publish('BLOCK_DESTROYED', blockInfo);
    }

    overrideBlockDetails(blockInfo, property, eventId) {
      const block = this.blocks[blockInfo.id];
      Object.assign(block[property], blockInfo[property]);
      this.domainEventBus.publish(eventId, blockInfo);
    }

    changeBlockGeometry(blockInfo) {
      this.overrideBlockDetails(blockInfo, 'geom', 'BLOCK_GEOMETRY_CHANGED');
    }

    changeBlockProperties(blockInfo) {
      this.overrideBlockDetails(blockInfo, 'properties', 'BLOCK_PROPERTIES_CHANGED');
    }

    changeBlockInputs(blockInfo) {
      this.overrideBlockDetails(blockInfo, 'inputs', 'BLOCK_INPUTS_CHANGED');
    }

    changeBlockOutputs(blockInfo) {
      this.overrideBlockDetails(blockInfo, 'outputs', 'BLOCK_OUTPUTS_CHANGED');
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
