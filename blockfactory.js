const Block = require('./block');

class BlockFactory {
    constructor(){
     if(! BlockFactory.instance){
       BlockFactory.instance = this;
     }
     return BlockFactory.instance;
    }

    buildBlock(info){
        return new Block(info);
    }

  }

  const instance = new BlockFactory();
  Object.freeze(instance);
  
  module.exports = BlockFactory;