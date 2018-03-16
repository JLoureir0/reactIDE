/**
 * Class Dependencies
 */
import { Block } from "./block";
import * as BlockTypes from "./blocktypes/exports";

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
  public buildBlock(info: any) {
    return this.getBlock(info);
  }

  private getBlock(info : any) : Block{
    switch(info.type){
      case "input" : return new BlockTypes.BlockNumberInput(info);
      case "console" : return new BlockTypes.BlockConsole(info);
      case "function" : return new BlockTypes.BlockSum(info);
      case "trigger" : return new BlockTypes.BlockTrigger(info);
    }
    console.log(info);
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