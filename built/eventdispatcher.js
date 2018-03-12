"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
var EventDispatcher = /** @class */ (function () {
    /**
     *
     * @param model
     * @param actionBus
     * @param mqttRouter
     */
    function EventDispatcher(model, actionBus, mqttRouter) {
        // ModelDispatcher
        actionBus.on('CREATE_BLOCK', function (o) { return model.createBlock(o); });
        actionBus.on('DESTROY_BLOCK', function (o) { return model.destroyBlock(o); });
        actionBus.on('CHANGE_BLOCK_GEOMETRY', function (o) { return model.changeBlockGeometry(o); });
        actionBus.on('CHANGE_BLOCK_PROPERTIES', function (o) { return model.changeBlockProperties(o); });
        actionBus.on('CHANGE_BLOCK_INPUTS', function (o) { return model.changeBlockInputs(o); });
        actionBus.on('CHANGE_BLOCK_OUTPUTS', function (o) { return model.changeBlockOutputs(o); });
        actionBus.on('CREATE_LINK', function (o) { return model.createLink(o); });
        actionBus.on('CREATE_TYPE', function (o) { return model.createType(o); });
        actionBus.on('COMMIT', function () { return model.commit(); });
        // MqttDispatcher
        actionBus.on('CHANGE_BLOCK_INPUTS', function (block) { return mqttRouter.subscribeInputNodes(block); });
        actionBus.on('CHANGE_BLOCK_OUTPUTS', function (block) { return mqttRouter.subscribeOutputNodes(block); });
        actionBus.on('CREATE_LINK', function (link) { return mqttRouter.createLink(link); });
    }
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;
