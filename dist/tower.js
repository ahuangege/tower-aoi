"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tower = void 0;
/**
 * 灯塔
 */
class Tower {
    constructor(info) {
        this.objs = [];
        this.watchers = [];
        this.xMin = 0;
        this.xMax = 0;
        this.yMin = 0;
        this.yMax = 0;
        this.xMin = info.xMin;
        this.xMax = info.xMax;
        this.yMin = info.yMin;
        this.yMax = info.yMax;
    }
    /**
     * 添加实体
     */
    addObj(obj) {
        this.objs.push(obj);
    }
    /**
     * 移除实体
     */
    removeObj(obj) {
        let index = this.objs.indexOf(obj);
        if (index !== -1) {
            this.objs.splice(index, 1);
        }
    }
    /**
     * 添加观察者
     */
    addWatcher(watcher) {
        this.watchers.push(watcher);
    }
    /**
     * 移除观察者
     */
    removeWatcher(watcher) {
        let index = this.watchers.indexOf(watcher);
        if (index !== -1) {
            this.watchers.splice(index, 1);
        }
    }
    /**
     * 获取所有实体
     */
    getObjs() {
        return this.objs;
    }
    /**
     * 获取所有观察者
     */
    getWatchers() {
        return this.watchers;
    }
    /** 是否仍在本灯塔内 */
    isStillIn(pos) {
        return pos.x >= this.xMin && pos.x <= this.xMax && pos.y >= this.yMin && pos.y <= this.yMax;
    }
}
exports.Tower = Tower;
