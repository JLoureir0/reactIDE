class ModelDispatcher {
  constructor(model, actionBus) {
    actionBus.on('CREATE_BLOCK', o => model.createBlock(o));
    actionBus.on('DESTROY_BLOCK', o => model.destroyBlock(o));
    actionBus.on('CHANGE_BLOCK_GEOMETRY', o => model.changeBlockGeometry(o));
    actionBus.on('CHANGE_BLOCK_PROPERTIES', o => model.changeBlockProperties(o));
    actionBus.on('CHANGE_BLOCK_INPUTS', o => model.changeBlockInputs(o));
    actionBus.on('CHANGE_BLOCK_OUTPUTS', o => model.changeBlockOutputs(o));
    actionBus.on('CREATE_LINK', o => model.createLink(o));
    actionBus.on('CREATE_TYPE', o => model.createType(o));
    actionBus.on('COMMIT', () => model.commit());
  }
}

module.exports = ModelDispatcher;
