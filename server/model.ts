/**
 * Class Dependencies
 */
import * as fs from 'fs';
import { BlockFactory } from './blockfactory';
import { Block } from './block';
import TsMap from "ts-map";
import { EventBus } from './eventbus';

type jsonLink = {id: number, from: {node: string}, to: {node: string}};
type jsonType = {id: string, icon?: string, style?: string};
type jsonBlock = {id: number, type: string, properties: {name:string, text?:string}};
type jsonCompleteBlock = {id: number, type?: string, properties?: {name:string, text?:string}, geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};


/**
 * 
 */
class Model {

  private blocks: TsMap<number,Block>;
  private connections: TsMap<number,jsonLink>;
  private types: TsMap<string,jsonType>;
  private domainEventBus: EventBus;

  private path: string = 'server/models/model-if.json';

  /**
   * 
   * @param domainEventBus 
   */
  constructor(domainEventBus: EventBus) {
    this.blocks = new TsMap();
    this.connections = new TsMap();
    this.types = new TsMap();
    this.domainEventBus = domainEventBus;
  }

  /**
   * 
   * @param newBlockInfo 
   */
  public createBlock(newBlockInfo: jsonBlock) {

    if(newBlockInfo.id == 0) {
      newBlockInfo.id = this.blocks.size + 1;
    }

    const block = BlockFactory.Instance.buildBlock(newBlockInfo);
    this.blocks.set(block.Id, block);
    this.domainEventBus.publish('BLOCK_CREATED', newBlockInfo);
  }

  /**
   * 
   * @param blockInfo 
   */
  public destroyBlock(blockInfo: jsonBlock) {
    this.blocks.delete(blockInfo.id);
    this.domainEventBus.publish('BLOCK_DESTROYED', blockInfo);
  }

  /**
   * 
   * @param blockInfo 
   * @param property 
   * @param eventId 
   */
  public overrideBlockDetails(blockInfo: jsonCompleteBlock, property: string, eventId: string) 
  {
    const block:Block = this.blocks.get(blockInfo.id);
    block.overrideDetails(blockInfo, property);
    this.domainEventBus.publish(eventId, blockInfo);
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockGeometry(blockInfo: {id: number, geom: {x: number, y: number}}) {
    this.overrideBlockDetails(blockInfo, 'geom', 'BLOCK_GEOMETRY_CHANGED');
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockProperties(blockInfo: {id: number, properties:{name:string, text:string}}) {
    this.overrideBlockDetails(blockInfo, 'properties', 'BLOCK_PROPERTIES_CHANGED');
    const block:Block = this.blocks.get(blockInfo.id);
    block.run("client", "work")
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockInputs(blockInfo: {id: number, inputs: Array<{id: string}>}) {
    this.overrideBlockDetails(blockInfo, 'inputs', 'BLOCK_INPUTS_CHANGED');
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockOutputs(blockInfo: {id: number, outputs: Array<{id: string}>}) {
    this.overrideBlockDetails(blockInfo, 'outputs', 'BLOCK_OUTPUTS_CHANGED');
  }

  /**
   * 
   * @param link 
   */
  public createLink(link: jsonLink) {
    this.connections.set(link.id,link);

    if(link.id == 0) {
      link.id = this.connections.size + 1;
    }

    this.domainEventBus.publish('LINK_CREATED', link);
  }

  /**
   * 
   * @param type 
   */
  public createType(type: jsonType) {
    this.types.set(type.id,type);
    this.domainEventBus.publish('TYPE_CREATED', type);
  }

  /**
   * 
   * @param link 
   */
  public destroyLink(link: jsonLink) {
    this.connections.delete(link.id);
    this.domainEventBus.publish('LINK_DESTROYED', link);
  }

  /**
   * 
   */
  public commit() {
    fs.writeFileSync(this.path, this.toJson(), 'utf-8');
  }

  /**
   * TODO
   */
  public push(){
    let model:string = fs.readFileSync(this.path, 'utf-8');
    return JSON.parse(model);
  }

  /**
   * 
   */
  public toJson() {
    return JSON.stringify(this, (key, val) => {
      if (key === "blocks") {
        return JSON.parse(JSON.stringify(this.blocks.values(), (k, v) => {
          if (k !== "mqttClient")
            return v;
        }));
      }
      else if(key === "connections"){
        return JSON.parse(JSON.stringify(this.connections.values(), (k, v) => {
          return v;
        }));
      }
      else if(key === "types"){
        return JSON.parse(JSON.stringify(this.types.values(), (k, v) => {
          return v;
        }));
      }
      else if(key !== "domainEventBus"){
        return val;
      }

    });
  }

  /**
   * 
   */
  public getLastBlockID() {
    return this.blocks.size;
  }
}

export { Model };
