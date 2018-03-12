"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class Dependencies
 */
var block_1 = require("./block");
/**
 *
 */
var BlockFactory = /** @class */ (function () {
    function BlockFactory() {
    }
    /**
     * Build a block with the received info
     * @param info
     */
    BlockFactory.prototype.buildBlock = function (info) {
        return new block_1.Block(info);
    };
    Object.defineProperty(BlockFactory, "Instance", {
        /**
         * Get instance
         */
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    return BlockFactory;
}());
exports.BlockFactory = BlockFactory;
//singleton
var instance = BlockFactory.Instance;
