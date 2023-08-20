


/**
 * 灯塔
 */
export class Tower<T extends I_towerPos, U extends I_watcherPos> {
    private objs: T[] = [];
    private watchers: U[] = [];
    private xMin = 0;
    private xMax = 0;
    private yMin = 0;
    private yMax = 0;

    constructor(info: { xMin: number, xMax: number, yMin: number, yMax: number }) {
        this.xMin = info.xMin;
        this.xMax = info.xMax;
        this.yMin = info.yMin;
        this.yMax = info.yMax;
    }

    /**
     * 添加实体
     */
    addObj(obj: T) {
        this.objs.push(obj);
    }

    /**
     * 移除实体
     */
    removeObj(obj: T) {
        let index = this.objs.indexOf(obj);
        if (index !== -1) {
            this.objs.splice(index, 1);
        }
    }

    /**
     * 添加观察者
     */
    addWatcher(watcher: U) {
        this.watchers.push(watcher);
    }

    /**
     * 移除观察者
     */
    removeWatcher(watcher: U) {
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
    isStillIn(pos: I_pos) {
        return pos.x >= this.xMin && pos.x <= this.xMax && pos.y >= this.yMin && pos.y <= this.yMax;
    }

}


export interface I_towerPos {
    /**
     * 灯塔横坐标（外部请不要修改）
     */
    tx: number;
    /**
     * 灯塔纵坐标（外部请不要修改）
     */
    ty: number;
}

/**
 * 坐标向量
 */
export interface I_pos {
    /**
     * x
     */
    x: number;
    /**
     * y
     */
    y: number;
}



export interface I_watcherPos {
    /**
     * 监视者横坐标（外部请不要修改）
     */
    wx: number;
    /**
     * 监视者纵坐标（外部请不要修改）
     */
    wy: number;
}
