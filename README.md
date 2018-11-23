tower-aoi
===========================


## installation
pomelo-aoi的ts版本
```bash
npm install tower-aoi
```

## usage

* 代码示例
```
aoi.addObject(obj, pos);

aoi.removeObject(obj, pos);

aoi.updateObject(obj, oldPos, newPos);
	
aoi.addWatcher(watcher, pos, range);
	
aoi.removeWatcher(watcher, pos, range);

aoi.updateWatcher(watcher, oldPos, newPos, oldRange, newRange);

aoi.on("add" | "remove" | "update" | "updateWatcher", cb);

```
