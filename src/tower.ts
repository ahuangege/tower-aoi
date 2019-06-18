
/**
 * 实体结构
 */
export interface id_type {
    /**
     * 唯一id
     */
    id: number;
    /**
     * 类型
     */
    type: number;
}

/**
 * 灯塔
 */
export class Tower {
    private objs: id_type[] = [];
    private watchers: id_type[] = [];

    /**
     * 添加实体
     */
    addObj(obj: id_type) {
        this.objs.push(obj);
    }

    /**
     * 移除实体
     */
    removeObj(obj: id_type) {
        for (let i = this.objs.length - 1; i >= 0; i--) {
            let one = this.objs[i];
            if (one.id === obj.id && one.type === obj.type) {
                this.objs.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 添加观察者
     */
    addWatcher(watcher: id_type) {
        this.watchers.push(watcher);
    }

    /**
     * 移除观察者
     */
    removeWatcher(watcher: id_type) {
        for (let i = this.watchers.length - 1; i >= 0; i--) {
            let one = this.watchers[i];
            if (one.id === watcher.id && one.type === watcher.type) {
                this.watchers.splice(i, 1);
                break;
            }
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

}