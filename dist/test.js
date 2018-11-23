"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var towerAOI_1 = require("./towerAOI");
var Entity_type;
(function (Entity_type) {
    Entity_type["player"] = "player";
})(Entity_type || (Entity_type = {}));
var theTowerAOI = new towerAOI_1.TowerAOI({ "width": 2000, "height": 1000, "towerWidth": 200, "towerHeight": 100, "rangeLimit": 2 });
theTowerAOI.on("add", function (info) {
    console.log("add", info.id, info.type, info.watchers);
});
theTowerAOI.on("remove", function (info) {
    console.log("remove", info);
});
theTowerAOI.on("update", function (info) {
    console.log("update", info);
});
theTowerAOI.on("updateWatcher", function (info) {
    console.log("updateWatcher", info);
});
theTowerAOI.addObject({ "id": 1, "type": Entity_type.player }, { "x": 1, "y": 1 });
theTowerAOI.addObject({ "id": 2, "type": Entity_type.player }, { "x": 1, "y": 1 });
theTowerAOI.addWatcher({ "id": 1, "type": Entity_type.player }, { "x": 1, "y": 1 }, 5);
theTowerAOI.addWatcher({ "id": 2, "type": Entity_type.player }, { "x": 1, "y": 1 }, 5);
console.log(theTowerAOI.getIdsByPos({ "x": 1, "y": 1 }, 3));
console.log(theTowerAOI.getIdsByPosTypes({ "x": 1, "y": 1 }, 3, [Entity_type.player]));
console.log(theTowerAOI.getWatchersByTypes({ "x": 1, "y": 1 }, [Entity_type.player]));
