"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class dependencies
 */
var MQTT = require("mqtt");
/**
 *
 */
var Block = /** @class */ (function () {
    /**
     *
     * @param info
     */
    function Block(info) {
        var _this = this;
        this.mqttClient = MQTT.connect('mqtt://localhost:1883');
        this.id = info.id;
        this.type = info.type;
        (!info.geom) ? this.geom = {} : this.geom = info.geom;
        (!info.properties) ? this.properties = {} : this.properties = info.properties;
        (!info.inputs) ? this.inputs = [] : this.inputs = info.inputs;
        (!info.outputs) ? this.outputs = [] : this.outputs = info.outputs;
        if (this.type == "trigger") {
            this.triggerFunction("work");
        }
        this.mqttClient.on('message', function (topic, message) { return _this.performAction(message); });
        this.subscribeInputs();
        this.subscribeOutputs();
    }
    /**
     *
     * @param message
     */
    Block.prototype.performAction = function (message) {
        if (this.id == "blockC") {
            if (message == "work") {
                this.inputblockA = null;
                this.inputblockB = null;
                this.publishFromInputs("need inputs!");
            }
            else {
                var x = (message + "").split(" ");
                if (x[0] == "input") {
                    this["input" + x[1]] = x[2];
                }
                if (this.inputblockA != null && this.inputblockB != null) {
                    var input1 = parseInt(this.inputblockA);
                    var input2 = parseInt(this.inputblockB);
                    if (!isNaN(input1) && !isNaN(input2)) {
                        var res = input1 + input2;
                        this.publishFromOutputs("result: " + res);
                    }
                }
            }
        }
        if (this.id == "blockA" || this.id == "blockB") {
            this.publishFromOutputs("input " + this.id + " " + this.properties['name']);
        }
        if (this.id == "blockD") {
            var y = (message + "").split(" ");
            if (y[0] == "result:") {
                this.properties['text'] = parseInt(y[1]);
            }
        }
    };
    /**
     *
     * @param info
     * @param property
     */
    Block.prototype.overrideDetails = function (info, property) {
        this[property] = info[property];
        if (property == "inputs") {
            this.subscribeInputs();
        }
        else if (property == "outputs") {
            this.subscribeOutputs();
        }
    };
    /**
     *
     */
    Block.prototype.subscribeInputs = function () {
        var _this = this;
        this.inputs.forEach(function (input) {
            _this.mqttClient.subscribe(_this.id + "/INPUTS/" + input['id']);
        });
    };
    /**
     *
     */
    Block.prototype.subscribeOutputs = function () {
        var _this = this;
        this.outputs.forEach(function (output) {
            _this.mqttClient.subscribe(_this.id + "/TAKE/" + output['id']);
        });
    };
    /**
     *
     * @param message
     */
    Block.prototype.publishFromInputs = function (message) {
        for (var i = 0; i < this.inputs.length; i++) {
            this.mqttClient.publish(this.id + "/TAKE/" + this.inputs[i]['id'], message);
        }
    };
    /**
     *
     * @param message
     */
    Block.prototype.publishFromOutputs = function (message) {
        for (var i = 0; i < this.outputs.length; i++) {
            this.mqttClient.publish(this.id + "/OUTPUTS/" + this.outputs[i]['id'], message);
        }
    };
    /**
     *
     * @param message
     */
    Block.prototype.triggerFunction = function (message) {
        var _this = this;
        setInterval(function () {
            _this.publishFromInputs(message);
        }, 2000);
    };
    Object.defineProperty(Block.prototype, "getId", {
        /**
         * get ID of the block
         */
        get: function () {
            return this.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Block.prototype, "getOutputs", {
        get: function () {
            return this.outputs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Block.prototype, "getInputs", {
        get: function () {
            return this.inputs;
        },
        enumerable: true,
        configurable: true
    });
    return Block;
}());
exports.Block = Block;
