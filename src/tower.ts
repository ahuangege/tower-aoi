
export interface typeId {
    [type: string]: { [id: number]: number }
}

/**
 * 实体结构
 */
export interface obj_proxy {
    /**
     * 唯一id
     */
    id: number;
    /**
     * 类型
     */
    type: string;
}

/**
 * 灯塔
 */
export class Tower {
    private ids: { [id: number]: number } = {};
    public watchers: typeId = {};
    private typeMap: typeId = {};

    /**
     * 添加实体
     */
    add(obj: obj_proxy) {
        let id = obj.id;
        let type = obj.type;
        this.ids[id] = id;
        this.typeMap[type] = this.typeMap[type] || {};
        this.typeMap[type][id] = id;
    }

    /**
     * 移除实体
     */
    remove(obj: obj_proxy) {
        let id = obj.id;
        let type = obj.type;
        if (!!this.ids[id]) {
            delete this.ids[id];
            if (this.typeMap[type]) {
                delete this.typeMap[type][id];
            }
        }
    }

    /**
     * 添加观察者
     */
    addWatcher(watcher: obj_proxy) {
        let type = watcher.type;
        let id = watcher.id;
        this.watchers[type] = this.watchers[type] || {};
        this.watchers[type][id] = id;
    }

    /**
     * 移除观察者
     */
    removeWatcher(watcher: obj_proxy) {
        let type = watcher.type;
        let id = watcher.id;
        if (!!this.watchers[type]) {
            delete this.watchers[type][id];
        }
    }

    /**
     * 获取所有观察者
     */
    getWatchersByTypes(types: string[]) {
        let result: { [type: string]: { [id: number]: number } } = {};
        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            if (!!this.watchers[type]) {
                result[type] = this.watchers[type];
            }
        }
        return result;
    }



    /**
     * 获取所有实体id
     */
    getIds() {
        return this.ids;
    }

    /**
     * 根据类型获取实体id
     */
    getIdsByTypes(types: string[]) {
        let result: { [type: string]: { [id: number]: number } } = {};
        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            if (!!this.typeMap[type])
                result[type] = this.typeMap[type];
        }

        return result;
    }
}