/**
 * Class Dependencies
 */
import { Block } from "./block";

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
    return new Block(info);
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