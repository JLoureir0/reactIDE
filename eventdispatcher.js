class EventDispatcher {
  constructor(model, actionBus, mqttRouter) {

    // ModelDispatcher
    actionBus.on('CREATE_BLOCK', o => model.createBlock(o));
    actionBus.on('DESTROY_BLOCK', o => model.destroyBlock(o));
    actionBus.on('CHANGE_BLOCK_GEOMETRY', o => model.changeBlockGeometry(o));
    actionBus.on('CHANGE_BLOCK_PROPERTIES', o => model.changeBlockProperties(o));
    actionBus.on('CHANGE_BLOCK_INPUTS', o => model.changeBlockInputs(o));
    actionBus.on('CHANGE_BLOCK_OUTPUTS', o => model.changeBlockOutputs(o));
    actionBus.on('CREATE_LINK', o => model.createLink(o));
    actionBus.on('CREATE_TYPE', o => model.createType(o));
    actionBus.on('COMMIT', () => model.commit());

    // MqttDispatcher
    actionBus.on('CHANGE_BLOCK_INPUTS', block => mqttRouter.subscribeInputNodes(block));
    actionBus.on('CHANGE_BLOCK_OUTPUTS', block => mqttRouter.subscribeOutputNodes(block));
    actionBus.on('CREATE_LINK', link => mqttRouter.createLink(link))
  }
}

module.exports = EventDispatcher;