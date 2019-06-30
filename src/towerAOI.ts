import { EventEmitter } from "events";
import { Tower, id_type } from "./tower";

/**
 * 坐标向量
 */
interface vector2 {
    /**
     * x
     */
    x: number;
    /**
     * y
     */
    y: number;
}


/**
 * 事件代理
 */
class eventProxy extends EventEmitter {

    onEvent(event: "addObj" | "removeObj" | "updateObj" | "updateWatcher", listener: (...args: any[]) => void) {
        this.on(event, listener);
    }

    emitEvent(event: "addObj", obj: id_type, watchers: id_type[]): void;
    emitEvent(event: "removeObj", obj: id_type, watchers: id_type[]): void;
    emitEvent(event: "updateObj", obj: id_type, addWatchers: id_type[], removeWatchers: id_type[]): void;
    emitEvent(event: "updateWatcher", obj: id_type, addObjs: id_type[], removeObjs: id_type[]): void;
    emitEvent(event: "addObj" | "removeObj" | "updateObj" | "updateWatcher", ...args: any[]) {
        this.emit(event, ...args);
    }
}

export class TowerAOI {
    private width: number;
    private height: number;
    private max: vector2 = null as any;

    private towerWidth: number;
    private towerHeight: number;
    private rangeLimit: number;

    private towers: Tower[][] = [];
    private eventProxy: eventProxy = new eventProxy();

    constructor(config: { width: number, height: number, towerWidth: number, towerHeight: number, rangeLimit?: number }) {
        this.width = config.width;
        this.height = config.height;
        this.towerWidth = config.towerWidth;
        this.towerHeight = config.towerHeight;
        this.rangeLimit = config.rangeLimit ? config.rangeLimit : 5;
        this.init();
    }

    private init() {
        this.max = {
            x: Math.ceil(this.width / this.towerWidth) - 1,
            y: Math.ceil(this.height / this.towerHeight) - 1
        };

        for (let y = 0; y <= this.max.y; y++) {
            this.towers[y] = [];
            for (let x = 0; x <= this.max.x; x++) {
                this.towers[y][x] = new Tower();
            }
        }
    }

    /**
     * 增加实体，通知对应观察者
     * @param event 
     * @param listener 
     */
    on(event: "addObj", listener: (obj: id_type, watchers: id_type[]) => void): void;
    /**
     * 移除实体，通知对应观察者
     * @param event 
     * @param listener 
     */
    on(event: "removeObj", listener: (obj: id_type, watchers: id_type[]) => void): void;
    /**
     * 实体位置更新，通知对应观察者
     * @param event 
     * @param listener 
     */
    on(event: "updateObj", listener: (obj: id_type, addWatchers: id_type[], removeWatchers: id_type[]) => void): void;
    /**
     * 实体观察区域更新，通知该实体
     * @param event 
     * @param listener 
     */
    on(event: "updateWatcher", listener: (obj: id_type, addObjs: id_type[], removeObjs: id_type[]) => void): void;
    on(event: "addObj" | "removeObj" | "updateObj" | "updateWatcher", listener: (...args: any[]) => void): void {
        this.eventProxy.onEvent(event, listener);
    }

    /**
     * 坐标是否合法
     * @param pos 
     */
    private checkPos(pos: vector2) {
        return pos.x >= 0 && pos.y >= 0 && pos.x < this.width && pos.y < this.height;
    }

    /**
     * 场景坐标转为灯塔坐标
     * @param pos 
     */
    private transPos(pos: vector2): vector2 {
        return {
            x: Math.floor(pos.x / this.towerWidth),
            y: Math.floor(pos.y / this.towerHeight)
        };
    }

    /**
     * 添加实体
     * @param obj 实体
     * @param pos 坐标
     */
    addObj(obj: { id: number, type: number }, pos: { x: number, y: number }) {
        if (this.checkPos(pos)) {
            let p = this.transPos(pos);
            this.towers[p.y][p.x].addObj(obj);
            this.eventProxy.emitEvent("addObj", obj, this.towers[p.y][p.x].getWatchers());
        } else {
            console.warn("illegal pos:", pos);
        }
    }

    /**
     * 移除实体
     * @param obj 实体
     * @param pos 坐标
     */
    removeObj(obj: { id: number, type: number }, pos: { x: number, y: number }) {
        if (this.checkPos(pos)) {
            let p = this.transPos(pos);
            this.towers[p.y][p.x].removeObj(obj);
            this.eventProxy.emitEvent("removeObj", obj, this.towers[p.y][p.x].getWatchers());
        } else {
            console.warn("illegal pos:", pos);
        }
    }

    /**
     * 更新实体坐标
     * @param obj 实体
     * @param oldPos 旧坐标
     * @param newPos 新坐标
     */
    updateObj(obj: { id: number, type: number }, oldPos: { x: number, y: number }, newPos: { x: number, y: number }) {
        if (!this.checkPos(oldPos)) {
            console.warn("illegal pos:", oldPos);
            return;
        }
        if (!this.checkPos(newPos)) {
            console.warn("illegal pos:", newPos);
            return;
        }
        let p1 = this.transPos(oldPos);
        let p2 = this.transPos(newPos);
        if (p1.x === p2.x && p1.y === p2.y) {
            return;
        }
        let oldTower = this.towers[p1.y][p1.x];
        let newTower = this.towers[p2.y][p2.x];
        oldTower.removeObj(obj);
        newTower.addObj(obj);
        let oldWatchers = oldTower.getWatchers();
        let newWatchers = newTower.getWatchers();
        let addWatchers: id_type[] = [];
        let removeWatchers: id_type[] = [];
        let bothWatchers: id_type[] = [];
        for (let one of newWatchers) {
            if (!this.cotains(oldWatchers, one)) {
                addWatchers.push(one);
            } else {
                bothWatchers.push(one);
            }
        }
        for (let one of oldWatchers) {
            if (!this.cotains(bothWatchers, one)) {
                removeWatchers.push(one);
            }
        }
        this.eventProxy.emitEvent("updateObj", obj, addWatchers, removeWatchers);
    }

    private cotains(watchers: id_type[], one: id_type) {
        for (let tmp of watchers) {
            if (tmp.id === one.id && tmp.type === one.type) {
                return true;
            }
        }
        return false;
    }

    /**
     * 添加观察者
     * @param watcher 观察者
     * @param pos 坐标
     * @param range 视野范围
     */
    addWatcher(watcher: { id: number, type: number }, pos: { x: number, y: number }, range: number) {
        if (range < 0) {
            return;
        }
        range = range > this.rangeLimit ? this.rangeLimit : range;
        let p = this.transPos(pos);
        let limit = getPosLimit(p, range, this.max);

        for (let y = limit.start.y; y <= limit.end.y; y++) {
            for (let x = limit.start.x; x <= limit.end.x; x++) {
                this.towers[y][x].addWatcher(watcher);
            }
        }
    }

    /**
     * 移除观察者
     * @param watcher 观察者
     * @param pos 坐标
     * @param range 视野范围
     */
    removeWatcher(watcher: { id: number, type: number }, pos: { x: number, y: number }, range: number) {
        if (range < 0) {
            return;
        }
        range = range > this.rangeLimit ? this.rangeLimit : range;
        let p = this.transPos(pos);
        let limit = getPosLimit(p, range, this.max);

        for (let y = limit.start.y; y <= limit.end.y; y++) {
            for (let x = limit.start.x; x <= limit.end.x; x++) {
                this.towers[y][x].removeWatcher(watcher);
            }
        }
    }

    /**
     * 更新观察者
     * @param watcher 观察者
     * @param oldPos 旧坐标
     * @param newPos 新坐标
     * @param oldRange 旧的视野范围
     * @param newRange 新的视野范围
     */
    updateWatcher(watcher: { id: number, type: number }, oldPos: { x: number, y: number }, newPos: { x: number, y: number }, oldRange: number, newRange: number) {
        if (!this.checkPos(oldPos) || !this.checkPos(newPos)) {
            return;
        }

        let p1 = this.transPos(oldPos);
        let p2 = this.transPos(newPos);

        if (p1.x === p2.x && p1.y === p2.y && oldRange === newRange) {
            return;
        }
        if (oldRange < 0 || newRange < 0) {
            return;
        }

        oldRange = oldRange > this.rangeLimit ? this.rangeLimit : oldRange;
        newRange = newRange > this.rangeLimit ? this.rangeLimit : newRange;

        let changedTowers = getChangedTowers(p1, p2, oldRange, newRange, this.towers, this.max);
        let removeTowers = changedTowers.removeTowers;
        let addTowers = changedTowers.addTowers;
        let addObjs: id_type[] = [];
        let removeObjs: id_type[] = [];
        for (let i = 0; i < addTowers.length; i++) {
            addTowers[i].addWatcher(watcher);
            addObjs = addObjs.concat(addTowers[i].getObjs());
        }
        for (let i = 0; i < removeTowers.length; i++) {
            removeTowers[i].removeWatcher(watcher);
            removeObjs = removeObjs.concat(removeTowers[i].getObjs());
        }
        this.eventProxy.emitEvent('updateWatcher', watcher, addObjs, removeObjs);
    }

    /**
     * 获得所有id
     * @param pos 坐标
     * @param range 视野范围
     */
    getObjs(pos: { x: number, y: number }, range: number): id_type[] {
        if (!this.checkPos(pos) || range < 0) {
            return [];
        }
        range = range > this.rangeLimit ? this.rangeLimit : range;

        let result: id_type[] = [];
        let p = this.transPos(pos);
        let limit = getPosLimit(p, range, this.max);

        for (let y = limit.start.y; y <= limit.end.y; y++) {
            for (let x = limit.start.x; x <= limit.end.x; x++) {
                result = result.concat(this.towers[y][x].getObjs());
            }
        }
        return result;
    }

    /**
     * 获取观察者
     * @param pos 坐标
     * @param types 类型
     */
    getWatchers(pos: { x: number, y: number }): id_type[] {
        if (this.checkPos(pos)) {
            let p = this.transPos(pos);
            return this.towers[p.y][p.x].getWatchers();
        }
        return [];
    }
}

/**
 * 获取视野范围
 * @param pos 
 * @param range 
 * @param max 
 */
function getPosLimit(pos: vector2, range: number, max: vector2) {
    let start: vector2 = { x: 0, y: 0 }, end: vector2 = { x: 0, y: 0 };

    if (pos.x - range < 0) {
        start.x = 0;
        end.x = 2 * range;
    } else if (pos.x + range > max.x) {
        end.x = max.x;
        start.x = max.x - 2 * range;
    } else {
        start.x = pos.x - range;
        end.x = pos.x + range;
    }

    if (pos.y - range < 0) {
        start.y = 0;
        end.y = 2 * range;
    } else if (pos.y + range > max.y) {
        end.y = max.y;
        start.y = max.y - 2 * range;
    } else {
        start.y = pos.y - range;
        end.y = pos.y + range;
    }

    if (start.x < 0) {
        start.x = 0;
    }
    if (start.y < 0) {
        start.y = 0;
    }
    if (end.x > max.x) {
        end.x = max.x;
    }
    if (end.y > max.y) {
        end.y = max.y;
    }

    return { start: start, end: end };
}

/**
 * 判断是否在视野范围内
 * @param pos 
 * @param start 
 * @param end 
 */
function isInRect(pos: vector2, start: vector2, end: vector2) {
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
function getChangedTowers(p1: vector2, p2: vector2, r1: number, r2: number, towers: Tower[][], max: vector2) {
    let limit1 = getPosLimit(p1, r1, max);
    let limit2 = getPosLimit(p2, r2, max);
    let removeTowers: Tower[] = [];
    let addTowers: Tower[] = [];

    for (let y = limit1.start.y; y <= limit1.end.y; y++) {
        for (let x = limit1.start.x; x <= limit1.end.x; x++) {
            if (!isInRect({ x: x, y: y }, limit2.start, limit2.end)) {
                removeTowers.push(towers[y][x]);
            }
        }
    }

    for (let y = limit2.start.y; y <= limit2.end.y; y++) {
        for (let x = limit2.start.x; x <= limit2.end.x; x++) {
            if (!isInRect({ x: x, y: y }, limit1.start, limit1.end)) {
                addTowers.push(towers[y][x]);
            }
        }
    }

    return { addTowers: addTowers, removeTowers: removeTowers };
}
