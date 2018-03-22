/**
 * Class Dependencies
 */
import * as fs from 'fs';
import { BlockFactory } from './blockfactory';
import { Block } from './block';
import TsMap from "ts-map";
import { EventBus } from './eventbus';

/**
 * 
 */
class Model {

  private blocks: any;
  private connections: any;
  private types: any;
  private domainEventBus: EventBus;

  constructor(domainEventBus: EventBus) {
    this.blocks = new TsMap();
    this.connections = {};
    this.types = {};
    this.domainEventBus = domainEventBus;
  }

  public createBlock(newBlockInfo: any) {
    if(newBlockInfo.id == 0) {
      newBlockInfo.id = this.blocks.size + 1;
    }

    const block = BlockFactory.Instance.buildBlock(newBlockInfo);
    this.blocks.set(block.Id, block);
    this.domainEventBus.publish('BLOCK_CREATED', newBlockInfo);
  }

  public destroyBlock(blockInfo: any) {
    this.blocks.delete(blockInfo.id);
    this.domainEventBus.publish('BLOCK_DESTROYED', blockInfo);
  }

  public overrideBlockDetails(blockInfo: any, property: string, eventId: string) {
    const block = this.blocks.get(blockInfo.id);
    block.overrideDetails(blockInfo, property);
    this.domainEventBus.publish(eventId, blockInfo);
  }

  public changeBlockGeometry(blockInfo: any) {
    this.overrideBlockDetails(blockInfo, 'geom', 'BLOCK_GEOMETRY_CHANGED');
  }

  public changeBlockProperties(blockInfo: any) {
    this.overrideBlockDetails(blockInfo, 'properties', 'BLOCK_PROPERTIES_CHANGED');
  }

  public changeBlockInputs(blockInfo: any) {
    this.overrideBlockDetails(blockInfo, 'inputs', 'BLOCK_INPUTS_CHANGED');
  }

  public changeBlockOutputs(blockInfo: any) {
    this.overrideBlockDetails(blockInfo, 'outputs', 'BLOCK_OUTPUTS_CHANGED');
  }

  public createLink(link: any) {
    if(link.id == 0) {
      link.id = Object.keys(this.connections).length + 1;
    }

    this.connections[link.id] = link;
    this.domainEventBus.publish('LINK_CREATED', link);
  }

  public createType(type: any) {
    this.types[type.id] = type;
    this.domainEventBus.publish('TYPE_CREATED', type);
  }

  public destroyLink(link: any) {
    delete this.connections[link.id];
    this.domainEventBus.publish('LINK_DESTROYED', link);
  }

  public commit() {
    fs.writeFileSync('model.json', this.toJson(), 'utf-8');
  }

  public toJson() {
    return JSON.stringify(this, (key, val) => {
      if (key !== "domainEventBus" && key !== "blocks")
        return val;
      if (key === "blocks") {
        return JSON.parse(JSON.stringify(this.blocks.values(), (k, v) => {
          if (k !== "mqttClient")
            return v;
        }));
      }
    });
  }

  public getLastBlockID() {
    return this.blocks.size;
  }
}

export { Model };
