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
var events_1 = require("events");
var tower_1 = require("./tower");
/**
 * 事件代理
 */
var eventProxy = /** @class */ (function (_super) {
    __extends(eventProxy, _super);
    function eventProxy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    eventProxy.prototype.onEvent = function (event, listener) {
        this.on(event, listener);
    };
    eventProxy.prototype.emitEvent = function (event, args) {
        this.on(event, args);
    };
    return eventProxy;
}(events_1.EventEmitter));
var TowerAOI = /** @class */ (function () {
    function TowerAOI(config) {
        this.max = null;
        this.towers = [];
        this.eventProxy = new eventProxy();
        this.width = config.width;
        this.height = config.height;
        this.towerWidth = config.towerWidth;
        this.towerHeight = config.towerHeight;
        this.rangeLimit = config.rangeLimit ? config.rangeLimit : 5;
        this.init();
    }
    TowerAOI.prototype.init = function () {
        this.max = {
            x: Math.ceil(this.width / this.towerWidth) - 1,
            y: Math.ceil(this.height / this.towerHeight) - 1
        };
        for (var y = 0; y <= this.max.y; y++) {
            this.towers[y] = [];
            for (var x = 0; x <= this.max.x; x++) {
                this.towers[y][x] = new tower_1.Tower();
            }
        }
    };
    TowerAOI.prototype.on = function (event, listener) {
        this.eventProxy.onEvent(event, listener);
    };
    /**
     * 坐标是否合法
     * @param pos
     */
    TowerAOI.prototype.checkPos = function (pos) {
        return pos.x >= 0 && pos.y >= 0 && pos.x < this.width && pos.y < this.height;
    };
    /**
     * 场景坐标转为灯塔坐标
     * @param pos
     */
    TowerAOI.prototype.transPos = function (pos) {
        return {
            x: Math.floor(pos.x / this.towerWidth),
            y: Math.floor(pos.y / this.towerHeight)
        };
    };
    /**
     * 添加实体
     * @param obj 实体
     * @param pos 坐标
     */
    TowerAOI.prototype.addObject = function (obj, pos) {
        if (this.checkPos(pos)) {
            var p = this.transPos(pos);
            this.towers[p.y][p.x].add(obj);
            this.eventProxy.emitEvent("add", { id: obj.id, type: obj.type, watchers: this.towers[p.y][p.x].watchers });
            return true;
        }
        return false;
    };
    /**
     * 移除实体
     * @param obj 实体
     * @param pos 坐标
     */
    TowerAOI.prototype.removeObject = function (obj, pos) {
        if (this.checkPos(pos)) {
            var p = this.transPos(pos);
            this.towers[p.y][p.x].remove(obj);
            this.eventProxy.emitEvent("remove", { id: obj.id, type: obj.type, watchers: this.towers[p.y][p.x].watchers });
            return true;
        }
        return false;
    };
    /**
     * 更新实体坐标
     * @param obj 实体
     * @param oldPos 旧坐标
     * @param newPos 新坐标
     */
    TowerAOI.prototype.updateObject = function (obj, oldPos, newPos) {
        if (!this.checkPos(oldPos) || !this.checkPos(newPos)) {
            return false;
        }
        var p1 = this.transPos(oldPos);
        var p2 = this.transPos(newPos);
        if (p1.x === p2.x && p1.y === p2.y)
            return true;
        else {
            var oldTower = this.towers[p1.y][p1.x];
            var newTower = this.towers[p2.y][p2.x];
            oldTower.remove(obj);
            newTower.add(obj);
            this.eventProxy.emitEvent("update", { id: obj.id, type: obj.type, oldWatchers: oldTower.watchers, newWatchers: newTower.watchers });
        }
    };
    /**
     * 添加观察者
     * @param watcher 观察者
     * @param pos 坐标
     * @param range 视野范围
     */
    TowerAOI.prototype.addWatcher = function (watcher, pos, range) {
        if (range < 0) {
            return;
        }
        range = range > this.rangeLimit ? this.rangeLimit : range;
        var p = this.transPos(pos);
        var limit = getPosLimit(p, range, this.max);
        for (var y = limit.start.y; y <= limit.end.y; y++) {
            for (var x = limit.start.x; x <= limit.end.x; x++) {
                this.towers[y][x].addWatcher(watcher);
            }
        }
    };
    /**
     * 移除观察者
     * @param watcher 观察者
     * @param pos 坐标
     * @param range 视野范围
     */
    TowerAOI.prototype.removeWatcher = function (watcher, pos, range) {
        if (range < 0) {
            return;
        }
        range = range > this.rangeLimit ? this.rangeLimit : range;
        var p = this.transPos(pos);
        var limit = getPosLimit(p, range, this.max);
        for (var y = limit.start.y; y <= limit.end.y; y++) {
            for (var x = limit.start.x; x <= limit.end.x; x++) {
                this.towers[y][x].removeWatcher(watcher);
            }
        }
    };
    /**
     * 更新观察者
     * @param watcher 观察者
     * @param oldPos 旧坐标
     * @param newPos 新坐标
     * @param oldRange 旧的视野范围
     * @param newRange 新的视野范围
     */
    TowerAOI.prototype.updateWatcher = function (watcher, oldPos, newPos, oldRange, newRange) {
        if (!this.checkPos(oldPos) || !this.checkPos(newPos)) {
            return false;
        }
        var p1 = this.transPos(oldPos);
        var p2 = this.transPos(newPos);
        if (p1.x === p2.x && p1.y === p2.y && oldRange === newRange)
            return true;
        else {
            if (oldRange < 0 || newRange < 0) {
                return false;
            }
            oldRange = oldRange > this.rangeLimit ? this.rangeLimit : oldRange;
            newRange = newRange > this.rangeLimit ? this.rangeLimit : newRange;
            var changedTowers = getChangedTowers(p1, p2, oldRange, newRange, this.towers, this.max);
            var removeTowers = changedTowers.removeTowers;
            var addTowers = changedTowers.addTowers;
            var addObjs = [];
            var removeObjs = [];
            var i = void 0, ids = void 0;
            for (i = 0; i < addTowers.length; i++) {
                addTowers[i].addWatcher(watcher);
                ids = addTowers[i].getIds();
                addMap(addObjs, ids);
            }
            for (i = 0; i < removeTowers.length; i++) {
                removeTowers[i].removeWatcher(watcher);
                ids = removeTowers[i].getIds();
                addMap(removeObjs, ids);
            }
            this.eventProxy.emitEvent('updateWatcher', { id: watcher.id, type: watcher.type, addObjs: addObjs, removeObjs: removeObjs });
            return true;
        }
    };
    /**
     * 根据类型获得id
     * @param pos 坐标
     * @param range 视野范围
     * @param types 类型
     */
    TowerAOI.prototype.getIdsByPosTypes = function (pos, range, types) {
        if (!this.checkPos(pos) || range < 0) {
            return {};
        }
        range = range > this.rangeLimit ? this.rangeLimit : range;
        var result = {};
        var p = this.transPos(pos);
        var limit = getPosLimit(p, range, this.max);
        for (var y = limit.start.y; y <= limit.end.y; y++) {
            for (var x = limit.start.x; x <= limit.end.x; x++) {
                addMapByTypes(result, this.towers[y][x].getIdsByTypes(types), types);
            }
        }
        return result;
    };
    /**
     * 获得所有id
     * @param pos 坐标
     * @param range 视野范围
     */
    TowerAOI.prototype.getIdsByPos = function (pos, range) {
        if (!this.checkPos(pos) || range < 0) {
            return [];
        }
        range = range > this.rangeLimit ? this.rangeLimit : range;
        var result = [];
        var p = this.transPos(pos);
        var limit = getPosLimit(p, range, this.max);
        for (var y = limit.start.y; y <= limit.end.y; y++) {
            for (var x = limit.start.x; x <= limit.end.x; x++) {
                addMap(result, this.towers[y][x].getIds());
            }
        }
        return result;
    };
    /**
     * 获取观察者
     * @param pos 坐标
     * @param types 类型
     */
    TowerAOI.prototype.getWatchersByTypes = function (pos, types) {
        if (this.checkPos(pos)) {
            var p = this.transPos(pos);
            return this.towers[p.x][p.y].getWatchersByTypes(types);
        }
        return {};
    };
    return TowerAOI;
}());
exports.TowerAOI = TowerAOI;
/**
 * 获取视野范围
 * @param pos
 * @param range
 * @param max
 */
function getPosLimit(pos, range, max) {
    var start = { x: 0, y: 0 }, end = { x: 0, y: 0 };
    if (pos.x - range < 0) {
        start.x = 0;
        end.x = 2 * range;
    }
    else if (pos.x + range > max.x) {
        end.x = max.x;
        start.x = max.x - 2 * range;
    }
    else {
        start.x = pos.x - range;
        end.x = pos.x + range;
    }
    if (pos.y - range < 0) {
        start.y = 0;
        end.y = 2 * range;
    }
    else if (pos.y + range > max.y) {
        end.y = max.y;
        start.y = max.y - 2 * range;
    }
    else {
        start.y = pos.y - range;
        end.y = pos.y + range;
    }
    start.x = start.x >= 0 ? start.x : 0;
    end.x = end.x <= max.x ? end.x : max.x;
    start.y = start.y >= 0 ? start.y : 0;
    end.y = end.y <= max.y ? end.y : max.y;
    return { start: start, end: end };
}
/**
 * 判断是否在视野范围内
 * @param pos
 * @param start
 * @param end
 */
function isInRect(pos, start, end) {
    return (pos.x >= start.x && pos.x <= end.x && pos.y >= start.y && pos.y <= end.y);
}
/**
 * 获取改变的视野
 * @param p1
 * @param p2
 * @param r1
 * @param r2
 * @param towers
 * @param max
 */
function getChangedTowers(p1, p2, r1, r2, towers, max) {
    var limit1 = getPosLimit(p1, r1, max);
    var limit2 = getPosLimit(p2, r2, max);
    var removeTowers = [];
    var addTowers = [];
    var unChangeTowers = [];
    for (var y = limit1.start.y; y <= limit1.end.y; y++) {
        for (var x = limit1.start.x; x <= limit1.end.x; x++) {
            if (isInRect({ x: x, y: y }, limit2.start, limit2.end)) {
                unChangeTowers.push(towers[y][x]);
            }
            else {
                removeTowers.push(towers[y][x]);
            }
        }
    }
    for (var y = limit2.start.y; y <= limit2.end.y; y++) {
        for (var x = limit2.start.x; x <= limit2.end.x; x++) {
            if (!isInRect({ x: x, y: y }, limit1.start, limit1.end)) {
                addTowers.push(towers[y][x]);
            }
        }
    }
    return { addTowers: addTowers, removeTowers: removeTowers, unChangeTowers: unChangeTowers };
}
/**
 *
 * @param arr
 * @param map
 */
function addMap(arr, map) {
    for (var key in map) {
        arr.push(map[key]);
    }
}
/**
 *
 * @param result
 * @param map
 * @param types
 */
function addMapByTypes(result, map, types) {
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (!map[type])
            continue;
        if (!result[type]) {
            result[type] = [];
        }
        for (var key in map[type]) {
            result[type].push(map[type][key]);
        }
    }
}
