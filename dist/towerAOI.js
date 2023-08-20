"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TowerAOI = void 0;
const events_1 = require("events");
const tower_1 = require("./tower");
class TowerAOI {
    constructor(config) {
        this.max = null;
        this.towers = [];
        this.eventProxy = new eventProxy();
        this.width = config.width;
        this.height = config.height;
        this.towerWidth = config.towerWidth;
        this.towerHeight = config.towerHeight;
        this.bufferNum = config.bufferNum;
        this.rangeLimit = config.rangeLimit ? config.rangeLimit : 5;
        this.init();
    }
    init() {
        this.max = {
            tx: Math.ceil(this.width / this.towerWidth) - 1,
            ty: Math.ceil(this.height / this.towerHeight) - 1
        };
        for (let y = 0; y <= this.max.ty; y++) {
            this.towers[y] = [];
            for (let x = 0; x <= this.max.tx; x++) {
                this.towers[y][x] = new tower_1.Tower({
                    "xMin": x * this.towerWidth - this.bufferNum,
                    "xMax": (x + 1) * this.towerWidth + this.bufferNum,
                    "yMin": y * this.towerHeight - this.bufferNum,
                    "yMax": (y + 1) * this.towerHeight + this.bufferNum,
                });
            }
        }
    }
    on(event, listener) {
        this.eventProxy.onEvent(event, listener);
    }
    /**
     * 坐标是否合法
     */
    checkPos(pos) {
        return pos.x >= 0 && pos.y >= 0 && pos.x < this.width && pos.y < this.height;
    }
    /**
     * 场景坐标转为灯塔坐标
     */
    transPos(pos) {
        return {
            tx: Math.floor(pos.x / this.towerWidth),
            ty: Math.floor(pos.y / this.towerHeight)
        };
    }
    /**
     * 添加实体
     * @param obj 实体
     * @param pos 坐标
     */
    addObj(obj, pos) {
        if (this.checkPos(pos)) {
            let p = this.transPos(pos);
            let tower = this.towers[p.ty][p.tx];
            tower.addObj(obj);
            obj.tx = p.tx;
            obj.ty = p.ty;
            this.eventProxy.emitEvent("addObj", obj, tower.getWatchers());
        }
        else {
            console.warn("illegal pos:", pos);
        }
    }
    /**
     * 移除实体
     * @param obj 实体
     */
    removeObj(obj) {
        let tower = this.towers[obj.ty][obj.tx];
        tower.removeObj(obj);
        this.eventProxy.emitEvent("removeObj", obj, tower.getWatchers());
    }
    /**
     * 更新实体坐标
     * @param obj 实体
     * @param pos 坐标
     */
    updateObj(obj, pos) {
        if (!this.checkPos(pos)) {
            console.warn("illegal pos:", pos);
            return;
        }
        let oldTower = this.towers[obj.ty][obj.tx];
        if (oldTower.isStillIn(pos)) {
            return;
        }
        oldTower.removeObj(obj);
        let p = this.transPos(pos);
        let newTower = this.towers[p.ty][p.tx];
        newTower.addObj(obj);
        obj.tx = p.tx;
        obj.ty = p.ty;
        let oldWatchers = oldTower.getWatchers();
        let newWatchers = newTower.getWatchers();
        let addWatchers = [];
        let removeWatchers = [];
        let bothWatchers = [];
        for (let one of newWatchers) {
            if (!oldWatchers.includes(one)) {
                addWatchers.push(one);
            }
            else {
                bothWatchers.push(one);
            }
        }
        for (let one of oldWatchers) {
            if (!bothWatchers.includes(one)) {
                removeWatchers.push(one);
            }
        }
        this.eventProxy.emitEvent("updateObj", obj, addWatchers, removeWatchers);
    }
    /**
     * 添加观察者
     * @param watcher 观察者
     * @param pos 坐标
     * @param range 视野范围
     */
    addWatcher(watcher, pos, range) {
        if (!this.checkPos(pos)) {
            console.warn("illegal pos:", pos);
            return;
        }
        if (range < 0) {
            return;
        }
        if (range > this.rangeLimit) {
            range = this.rangeLimit;
        }
        let p = this.transPos(pos);
        watcher.wx = p.tx;
        watcher.wy = p.ty;
        let limit = this.getPosLimit(p.tx, p.ty, range);
        for (let y = limit.start.ty; y <= limit.end.ty; y++) {
            for (let x = limit.start.tx; x <= limit.end.tx; x++) {
                this.towers[y][x].addWatcher(watcher);
            }
        }
    }
    /**
     * 移除观察者
     * @param watcher 观察者
     * @param range 视野范围
     */
    removeWatcher(watcher, range) {
        if (range < 0) {
            return;
        }
        if (range > this.rangeLimit) {
            range = this.rangeLimit;
        }
        let limit = this.getPosLimit(watcher.wx, watcher.wy, range);
        for (let y = limit.start.ty; y <= limit.end.ty; y++) {
            for (let x = limit.start.tx; x <= limit.end.tx; x++) {
                this.towers[y][x].removeWatcher(watcher);
            }
        }
    }
    /**
     * 更新观察者
     * @param watcher 观察者
     * @param pos 坐标
     * @param oldRange 旧的视野范围
     * @param newRange 新的视野范围
     */
    updateWatcher(watcher, pos, oldRange, newRange) {
        if (!this.checkPos(pos)) {
            return;
        }
        if (oldRange < 0 || newRange < 0) {
            return;
        }
        let tower = this.towers[watcher.wy][watcher.wx];
        if (tower.isStillIn(pos) && oldRange === newRange) {
            return;
        }
        if (oldRange > this.rangeLimit) {
            oldRange = this.rangeLimit;
        }
        if (newRange > this.rangeLimit) {
            newRange = this.rangeLimit;
        }
        let p = this.transPos(pos);
        let changedTowers = this.getChangedTowers(watcher, p, oldRange, newRange);
        watcher.wx = p.tx;
        watcher.wy = p.ty;
        let removeTowers = changedTowers.removeTowers;
        let addTowers = changedTowers.addTowers;
        let addObjs = [];
        let removeObjs = [];
        for (let one of addTowers) {
            one.addWatcher(watcher);
            addObjs.push(...one.getObjs());
        }
        for (let one of removeTowers) {
            one.removeWatcher(watcher);
            removeObjs.push(...one.getObjs());
        }
        this.eventProxy.emitEvent('updateWatcher', watcher, addObjs, removeObjs);
    }
    /**
     * 获得所有实体
     */
    getObjs(watcher, range) {
        if (range > this.rangeLimit) {
            range = this.rangeLimit;
        }
        let result = [];
        let limit = this.getPosLimit(watcher.wx, watcher.wy, range);
        for (let y = limit.start.ty; y <= limit.end.ty; y++) {
            for (let x = limit.start.tx; x <= limit.end.tx; x++) {
                result.push(...this.towers[y][x].getObjs());
            }
        }
        return result;
    }
    /**
     * 获得所有实体
     */
    getObjsByPos(pos, range) {
        if (!this.checkPos(pos) || range < 0) {
            return [];
        }
        if (range > this.rangeLimit) {
            range = this.rangeLimit;
        }
        let result = [];
        let p = this.transPos(pos);
        let limit = this.getPosLimit(p.tx, p.ty, range);
        for (let y = limit.start.ty; y <= limit.end.ty; y++) {
            for (let x = limit.start.tx; x <= limit.end.tx; x++) {
                result.push(...this.towers[y][x].getObjs());
            }
        }
        return result;
    }
    /**
     * 获取观察者
     */
    getWatchers(obj) {
        return this.towers[obj.ty][obj.tx].getWatchers();
    }
    /**
     * 获取观察者
     */
    getWatchersByPos(pos) {
        if (this.checkPos(pos)) {
            let p = this.transPos(pos);
            return this.towers[p.ty][p.tx].getWatchers();
        }
        return [];
    }
    /**
     * 获取改变的视野
     */
    getChangedTowers(p1, p2, r1, r2) {
        let limit1 = this.getPosLimit(p1.wx, p1.wy, r1);
        let limit2 = this.getPosLimit(p2.tx, p2.ty, r2);
        let removeTowers = [];
        let addTowers = [];
        for (let y = limit1.start.ty; y <= limit1.end.ty; y++) {
            for (let x = limit1.start.tx; x <= limit1.end.tx; x++) {
                if (!this.isInRect(x, y, limit2.start, limit2.end)) {
                    removeTowers.push(this.towers[y][x]);
                }
            }
        }
        for (let y = limit2.start.ty; y <= limit2.end.ty; y++) {
            for (let x = limit2.start.tx; x <= limit2.end.tx; x++) {
                if (!this.isInRect(x, y, limit1.start, limit1.end)) {
                    addTowers.push(this.towers[y][x]);
                }
            }
        }
        return { addTowers: addTowers, removeTowers: removeTowers };
    }
    /**
     * 获取视野范围
     */
    getPosLimit(tx, ty, range) {
        let start = { tx: 0, ty: 0 };
        let end = { tx: 0, ty: 0 };
        let max = this.max;
        if (tx - range < 0) {
            start.tx = 0;
            end.tx = 2 * range;
        }
        else if (tx + range > max.tx) {
            end.tx = max.tx;
            start.tx = max.tx - 2 * range;
        }
        else {
            start.tx = tx - range;
            end.tx = tx + range;
        }
        if (ty - range < 0) {
            start.ty = 0;
            end.ty = 2 * range;
        }
        else if (ty + range > max.ty) {
            end.ty = max.ty;
            start.ty = max.ty - 2 * range;
        }
        else {
            start.ty = ty - range;
            end.ty = ty + range;
        }
        if (start.tx < 0) {
            start.tx = 0;
        }
        if (start.ty < 0) {
            start.ty = 0;
        }
        if (end.tx > max.tx) {
            end.tx = max.tx;
        }
        if (end.ty > max.ty) {
            end.ty = max.ty;
        }
        return { start: start, end: end };
    }
    /**
     * 判断是否在视野范围内
     */
    isInRect(x, y, start, end) {
        return (x >= start.tx && x <= end.tx && y >= start.ty && y <= end.ty);
    }
}
exports.TowerAOI = TowerAOI;
/**
 * 事件代理
 */
class eventProxy extends events_1.EventEmitter {
    onEvent(event, listener) {
        this.on(event, listener);
    }
    emitEvent(event, ...args) {
        this.emit(event, ...args);
    }
}
