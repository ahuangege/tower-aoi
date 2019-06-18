"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 灯塔
 */
var Tower = /** @class */ (function () {
    function Tower() {
        this.objs = [];
        this.watchers = [];
    }
    /**
     * 添加实体
     */
    Tower.prototype.addObj = function (obj) {
        this.objs.push(obj);
    };
    /**
     * 移除实体
     */
    Tower.prototype.removeObj = function (obj) {
        for (var i = this.objs.length - 1; i >= 0; i--) {
            var one = this.objs[i];
            if (one.id === obj.id && one.type === obj.type) {
                this.objs.splice(i, 1);
                break;
            }
        }
    };
    /**
     * 添加观察者
     */
    Tower.prototype.addWatcher = function (watcher) {
        this.watchers.push(watcher);
    };
    /**
     * 移除观察者
     */
    Tower.prototype.removeWatcher = function (watcher) {
        for (var i = this.watchers.length - 1; i >= 0; i--) {
            var one = this.watchers[i];
            if (one.id === watcher.id && one.type === watcher.type) {
                this.watchers.splice(i, 1);
                break;
            }
        }
    };
    /**
     * 获取所有实体
     */
    Tower.prototype.getObjs = function () {
        return this.objs;
    };
    /**
     * 获取所有观察者
     */
    Tower.prototype.getWatchers = function () {
        return this.watchers;
    };
    return Tower;
}());
exports.Tower = Tower;
