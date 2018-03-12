"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
var EventBus = /** @class */ (function () {
    /**
     *
     */
    function EventBus() {
        this.queues = {};
    }
    /**
     *
     * @param commands
     */
    EventBus.prototype.replay = function (commands) {
        var _this = this;
        commands.forEach(function (c) { return _this.publish(c.event, c.data); });
    };
    /**
     *
     * @param evt
     * @param payload
     */
    EventBus.prototype.publish = function (evt, payload) {
        if (evt in this.queues)
            this.queues[evt].forEach(function (s) { return s(payload); });
    };
    /**
     *
     * @param evt
     * @param callback
     */
    EventBus.prototype.on = function (evt, callback) {
        if (!(evt in this.queues))
            this.queues[evt] = [];
        this.queues[evt].push(callback);
    };
    /**
     *
     * @param evt
     * @param callback
     */
    EventBus.prototype.off = function (evt, callback) {
        if (!(evt in this.queues))
            this.queues[evt] = [];
        this.queues[evt] = this.queues[evt].filter(function (cb) { return cb !== callback; });
    };
    return EventBus;
}());
exports.EventBus = EventBus;
/**
 *
 */
var EventSourcedBus = /** @class */ (function (_super) {
    __extends(EventSourcedBus, _super);
    /**
     *
     */
    function EventSourcedBus() {
        var _this = _super.call(this) || this;
        _this.journal = [];
        return _this;
    }
    /**
     *
     */
    EventSourcedBus.prototype.replay = function () {
        _super.prototype.replay.call(this, this.journal);
    };
    /**
     *
     * @param evt
     * @param payload
     */
    EventSourcedBus.prototype.publish = function (evt, payload) {
        this.journal.push({ event: evt, data: payload });
        _super.prototype.publish.call(this, evt, payload);
    };
    return EventSourcedBus;
}(EventBus));
exports.EventSourcedBus = EventSourcedBus;
