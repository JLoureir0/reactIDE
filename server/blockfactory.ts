/**
 * Class Dependencies
 */
import { Block } from "./block";
import * as BlockTypes from "./blocktypes/exports";

type jsonBlock = {id: number, type: string, properties: {name:string, text?:string}, geom?: {x: number, y: number}, inputs?: Array<{id: string}>, outputs?: Array<{id: string}>};

/**
 * 
 */
class BlockFactory {

  private static _instance: BlockFactory;

  constructor() { }

  /**
   * Build a block with the received info
   * @param info 
   */
  public buildBlock(info: jsonBlock) 
  {
    return this.getBlock(info);
  }

  private getBlock(info : jsonBlock) : Block
  {
    switch(info.type){
      case "input" : return new BlockTypes.BlockNumberInput(info);
      case "console" : return new BlockTypes.BlockConsole(info);
      case "function" : return new BlockTypes.BlockArithmetic(info);
      case "trigger" : return new BlockTypes.BlockTrigger(info);
      case "if" : return new BlockTypes.BlockIf(info);
      case "while" : return new BlockTypes.BlockWhile(info);
    }
    console.log(`[ERROR] invalid type: ${info}`)
  }

  /**
   * Get instance
   */
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

}

//singleton
const instance = BlockFactory.Instance;

export { BlockFactory }