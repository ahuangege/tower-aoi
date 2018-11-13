"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 灯塔
 */
var Tower = /** @class */ (function () {
    function Tower() {
        this.ids = {};
        this.watchers = {};
        this.typeMap = {};
    }
    /**
     * 添加实体
     */
    Tower.prototype.add = function (obj) {
        var id = obj.id;
        var type = obj.type;
        this.ids[id] = id;
        this.typeMap[type] = this.typeMap[type] || {};
        this.typeMap[type][id] = id;
    };
    /**
     * 移除实体
     */
    Tower.prototype.remove = function (obj) {
        var id = obj.id;
        var type = obj.type;
        if (!!this.ids[id]) {
            delete this.ids[id];
            if (this.typeMap[type]) {
                delete this.typeMap[type][id];
            }
        }
    };
    /**
     * 添加观察者
     */
    Tower.prototype.addWatcher = function (watcher) {
        var type = watcher.type;
        var id = watcher.id;
        this.watchers[type] = this.watchers[type] || {};
        this.watchers[type][id] = id;
    };
    /**
     * 移除观察者
     */
    Tower.prototype.removeWatcher = function (watcher) {
        var type = watcher.type;
        var id = watcher.id;
        if (!!this.watchers[type]) {
            delete this.watchers[type][id];
        }
    };
    /**
     * 获取所有观察者
     */
    Tower.prototype.getWatchersByTypes = function (types) {
        var result = {};
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            if (!!this.watchers[type]) {
                result[type] = this.watchers[type];
            }
        }
        return result;
    };
    /**
     * 获取所有实体id
     */
    Tower.prototype.getIds = function () {
        return this.ids;
    };
    /**
     * 根据类型获取实体id
     */
    Tower.prototype.getIdsByTypes = function (types) {
        var result = {};
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            if (!!this.typeMap[type])
                result[type] = this.typeMap[type];
        }
        return result;
    };
    return Tower;
}());
exports.Tower = Tower;
