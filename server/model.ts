/**
 * Class Dependencies
 */
import * as fs from 'fs';
import { BlockFactory } from './blockfactory';
import { Block } from './block';
import TsMap from "ts-map";
import { EventBus } from './eventbus';

type jsonLink = { id: number, from?: { node: string }, to?: { node: string } };
type jsonType = { id: string, icon?: string, style?: string };
type jsonBlock = { id: number, type: string, properties: { name: string, text?: string, enabled?: boolean } };
type jsonCompleteBlock = { id: number, type?: string, properties?: { name: string, text?: string, enabled?: boolean }, geom?: { x: number, y: number, expanded?: boolean }, inputs?: Array<{ id: string }>, outputs?: Array<{ id: string }> };


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
    //objetivo, percorrer todos os inputs e outputs, descobrir quais são os id's desses links e fazer destroy
    this.destroyBlockLinks(blockInfo.id);
    //delete block
    this.deleteBlock(blockInfo.id);
    //this.blocks.delete(blockInfo.id);
    this.domainEventBus.publish('BLOCK_DESTROYED', blockInfo);
  }

  /**
   * 
   * @param block_id 
   */
  private destroyBlockLinks(block_id: number) {
    let block: Block = this.blocks.get(block_id);

    block.Inputs.forEach(inp => {
      //encontrar o link que tem este inp.id nos seus 'to'
      let id: number = this.findToLink(inp.id);
      this.destroyLink({ id: id });
    });

    block.Outputs.forEach(inp => {
      //encontrar o link que tem este inp.id nos seus 'from'
      let id: number = this.findFromLink(inp.id);
      this.destroyLink({ id: id });
    });

  }

  /**
   * 
   * @param name 
   */
  private findToLink(name: string): number {
    let array = this.connections.values();
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element.to.node === name) return element.id;
    }
  }

  /**
   * 
   */
  private findFromLink(name: string): number {
    let array = this.connections.values();
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element.from.node === name) return element.id;
    }
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
  public changeBlockGeometry(blockInfo: { id: number, geom: { x: number, y: number, expanded?: boolean } }) {
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

    if (link.id == 0) {
      link.id = this.connections.size + 1;
    }

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
    let link_info = this.connections.get(link.id);
    if (link_info === undefined) return;

    let from: string = link_info.from.node;
    let to: string = link_info.to.node;

    let hasF, hasT: boolean = false;
    for (let index = 0; index < this.blocks.size; index++) {
      const block = this.blocks.values()[index];

      if (!hasF) hasF = block.deleteInput(to);
      if (!hasT) hasT = block.deleteOutput(from);

      //ja encontrou os 2
      if (hasF && hasT) break;
    }

    this.deleteLink(link.id);
    //this.connections.delete(link.id);
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
  public getLastBlockID() {
    return this.blocks.size;
  }


  /**
   * funcao nojenta porque nao funciona o delete do map
   */
  private deleteBlock(id: number) {
    let temp_blocks: TsMap<number, Block> = new TsMap();
    let x = this.blocks.values()

    for (let index = 0; index < x.length; index++) {
      const element = x[index];

      if (element.Id !== id) {
        temp_blocks.set(element.Id, element);
      }
    }
    this.blocks.clear();
    this.blocks = temp_blocks;
  }

  /**
 * funcao nojenta porque nao funciona o delete do map
 */
  private deleteLink(id: number) {
    let temp_links: TsMap<number, jsonLink> = new TsMap();
    let x = this.connections.values();

    for (let index = 0; index < x.length; index++) {
      const element = x[index];

      if (element.id !== id) {
        temp_links.set(element.id, element);
      }
    }
    this.connections.clear();
    this.connections = temp_links;
  }
}

export { Model };
