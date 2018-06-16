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
type jsonBlock = {id: number, type: string, properties: {name:string, text?:string, enabled?:boolean}};
type jsonCompleteBlock = {id: number, type?: string, properties?: {name:string, text?:string, enabled?:boolean}, geom?: {x: number, y: number, expanded?:boolean}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};


/**
 * 
 */
class Model {

  private blocks: TsMap<number, Block>;
  private connections: TsMap<number, jsonLink>;
  private types: TsMap<string, jsonType>;
  private domainEventBus: EventBus;
  private path: string;

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

    if (newBlockInfo.id == 0) {
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
  public overrideBlockDetails(blockInfo: jsonCompleteBlock, property: string, eventId: string) {
    const block: Block = this.blocks.get(blockInfo.id);

    //special case geom
    if (property === "geom" && block.Geom != null) {
      let new_prop = {
        id: blockInfo.id,
        geom: block.Geom
      };
      new_prop.geom.x = blockInfo.geom.x;
      new_prop.geom.y = blockInfo.geom.y;
      new_prop.geom.expanded = blockInfo.geom.expanded;

      block.overrideDetails(new_prop, property);
      this.domainEventBus.publish(eventId, new_prop);
    }
    //other cases
    else {
      block.overrideDetails(blockInfo, property);
      this.domainEventBus.publish(eventId, blockInfo);
    }
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockGeometry(blockInfo: { id: number, geom: { x: number, y: number, expanded?:boolean } }) {
    this.overrideBlockDetails(blockInfo, 'geom', 'BLOCK_GEOMETRY_CHANGED');
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockProperties(blockInfo: { id: number, properties: { name: string, text: string } }) {
    this.overrideBlockDetails(blockInfo, 'properties', 'BLOCK_PROPERTIES_CHANGED');
    const block: Block = this.blocks.get(blockInfo.id);
    block.run("client", "work")
  }

  /**
   * 
   * @param blockInfo 
   */
  public createConnection(blockInfo: { from: number, to: number }) {
    const lastNodeID:number = this.getLastNodeID();
    const nodeFrom = 'node_' + (lastNodeID + 1);
    const nodeTo = 'node_' + (lastNodeID + 2);
    const blockFrom: Block = this.blocks.get(blockInfo.from);
    const blockTo: Block = this.blocks.get(blockInfo.to);

    const newInputs = blockTo.Inputs;
    newInputs.push({ id: nodeFrom });
    const newOutputs = blockFrom.Outputs;
    newOutputs.push({ id: nodeTo });

    let events = [];

    let ev = { event: 'CHANGE_BLOCK_INPUTS', data: { id: blockTo.Id, inputs: newInputs }};
    events.push(ev);

    let ev2 = { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: blockFrom.Id, outputs: newOutputs }};
    events.push(ev2);

    const linkID:number = this.connections.size + 1;

    let ev3 = { event: 'CREATE_LINK', data: { id: linkID, from: { node: nodeFrom }, to: {node: nodeTo} } };
    events.push(ev3);

    this.domainEventBus.replay(events);
    //this.domainEventBus.publish("CONNECTION_CREATED", blockInfo);
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockInputs(blockInfo: { id: number, inputs: Array<{ id: string }> }) {
    this.overrideBlockDetails(blockInfo, 'inputs', 'BLOCK_INPUTS_CHANGED');
  }

  /**
   * 
   * @param blockInfo 
   */
  public changeBlockOutputs(blockInfo: { id: number, outputs: Array<{ id: string }> }) {
    this.overrideBlockDetails(blockInfo, 'outputs', 'BLOCK_OUTPUTS_CHANGED');
  }

  /**
   * 
   * @param link 
   */
  public createLink(link: jsonLink) {
    this.connections.set(link.id, link);
    this.domainEventBus.publish('LINK_CREATED', link);
  }

  /**
   * 
   * @param type 
   */
  public createType(type: jsonType) {
    this.types.set(type.id, type);
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
  public commit(path: string) {
    fs.writeFileSync(path, this.toJson(), 'utf-8');
  }

  /**
   * TODO
   */
  public push(path: string) {
    let model: string = fs.readFileSync(path, 'utf-8');
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
      else if (key === "connections") {
        return JSON.parse(JSON.stringify(this.connections.values(), (k, v) => {
          return v;
        }));
      }
      else if (key === "types") {
        return JSON.parse(JSON.stringify(this.types.values(), (k, v) => {
          return v;
        }));
      }
      else if (key !== "domainEventBus") {
        return val;
      }

    });
  }

  /**
   * 
   */
  public getLastBlockID(): number {
    return this.blocks.size;
  }

  /**
   * Get last node id
   */
  public getLastNodeID(): number {
    const size = this.connections.size;
    let i = 1;
    let lastNode = -1;
    for(i; i < size; i++) {
      const connection = this.connections.get(i);
      const nodeFrom = parseInt(connection.from.node.split('_')[1]);
      const nodeTo = parseInt(connection.to.node.split('_')[1]);

      if(nodeFrom > lastNode) {
        lastNode = nodeFrom;
      }
      if(nodeTo > lastNode) {
        lastNode = nodeTo;
      }
    }

    return lastNode;
  }
}

export { Model };
