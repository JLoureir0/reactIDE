"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class Dependencies
 */
var fs = require("fs");
var blockfactory_1 = require("./blockfactory");
var ts_map_1 = require("ts-map");
/**
 *
 */
var Model = /** @class */ (function () {
    function Model(domainEventBus) {
        this.blocks = new ts_map_1.default();
        this.connections = {};
        this.types = {};
        this.domainEventBus = domainEventBus;
    }
    Model.prototype.createBlock = function (newBlockInfo) {
        var block = blockfactory_1.BlockFactory.Instance.buildBlock(newBlockInfo);
        this.blocks.set(block.getId, block);
        this.domainEventBus.publish('BLOCK_CREATED', newBlockInfo);
    };
    Model.prototype.destroyBlock = function (blockInfo) {
        this.blocks.delete(blockInfo.id);
        this.domainEventBus.publish('BLOCK_DESTROYED', blockInfo);
    };
    Model.prototype.overrideBlockDetails = function (blockInfo, property, eventId) {
        var block = this.blocks.get(blockInfo.id);
        block.overrideDetails(blockInfo, property);
        this.domainEventBus.publish(eventId, blockInfo);
    };
    Model.prototype.changeBlockGeometry = function (blockInfo) {
        this.overrideBlockDetails(blockInfo, 'geom', 'BLOCK_GEOMETRY_CHANGED');
    };
    Model.prototype.changeBlockProperties = function (blockInfo) {
        this.overrideBlockDetails(blockInfo, 'properties', 'BLOCK_PROPERTIES_CHANGED');
    };
    Model.prototype.changeBlockInputs = function (blockInfo) {
        this.overrideBlockDetails(blockInfo, 'inputs', 'BLOCK_INPUTS_CHANGED');
    };
    Model.prototype.changeBlockOutputs = function (blockInfo) {
        this.overrideBlockDetails(blockInfo, 'outputs', 'BLOCK_OUTPUTS_CHANGED');
    };
    Model.prototype.createLink = function (link) {
        this.connections[link.id] = link;
        this.domainEventBus.publish('LINK_CREATED', link);
    };
    Model.prototype.createType = function (type) {
        this.types[type.id] = type;
        this.domainEventBus.publish('TYPE_CREATED', type);
    };
    Model.prototype.destroyLink = function (link) {
        delete this.connections[link.id];
        this.domainEventBus.publish('LINK_DESTROYED', link);
    };
    Model.prototype.commit = function () {
        fs.writeFileSync('model.json', this.toJson(), 'utf-8');
    };
    Model.prototype.toJson = function () {
        var _this = this;
        return JSON.stringify(this, function (key, val) {
            if (key !== "domainEventBus" && key !== "blocks")
                return val;
            if (key === "blocks") {
                return JSON.parse(JSON.stringify(_this.blocks.values(), function (k, v) {
                    if (k !== "mqttClient")
                        return v;
                }));
            }
        });
    };
    return Model;
}());
exports.Model = Model;
