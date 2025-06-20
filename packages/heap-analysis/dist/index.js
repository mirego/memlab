"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.heapConfig = exports.heapAnalysisLoader = exports.PluginUtils = exports.StringAnalysis = exports.ObjectUnboundGrowthAnalysis = exports.ObjectShapeAnalysis = exports.ObjectFanoutAnalysis = exports.ShapeUnboundGrowthAnalysis = exports.ObjectSizeAnalysis = exports.ObjectShallowAnalysis = exports.CollectionsHoldingStaleAnalysis = exports.GlobalVariableAnalysis = exports.DetachedDOMElementAnalysis = exports.BaseAnalysis = exports.takeNodeFullHeap = exports.snapshotMapReduce = exports.loadHeapSnapshot = exports.getSnapshotFileForAnalysis = exports.getSnapshotDirForAnalysis = exports.getFullHeapFromFile = exports.getHeapFromFile = exports.getDominatorNodes = exports.registerPackage = void 0;
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
/** @internal */
function registerPackage() {
    return __awaiter(this, void 0, void 0, function* () {
        return core_1.PackageInfoLoader.registerPackage(path_1.default.join(__dirname, '..'));
    });
}
exports.registerPackage = registerPackage;
const PluginUtils_1 = __importDefault(require("./PluginUtils"));
exports.getDominatorNodes = PluginUtils_1.default.getDominatorNodes, 
/** @deprecated */
exports.getHeapFromFile = PluginUtils_1.default.getHeapFromFile, exports.getFullHeapFromFile = PluginUtils_1.default.getFullHeapFromFile, exports.getSnapshotDirForAnalysis = PluginUtils_1.default.getSnapshotDirForAnalysis, exports.getSnapshotFileForAnalysis = PluginUtils_1.default.getSnapshotFileForAnalysis, exports.loadHeapSnapshot = PluginUtils_1.default.loadHeapSnapshot, exports.snapshotMapReduce = PluginUtils_1.default.snapshotMapReduce, exports.takeNodeFullHeap = PluginUtils_1.default.takeNodeFullHeap;
var BaseAnalysis_1 = require("./BaseAnalysis");
Object.defineProperty(exports, "BaseAnalysis", { enumerable: true, get: function () { return __importDefault(BaseAnalysis_1).default; } });
var DetachedDOMElementAnalysis_1 = require("./plugins/DetachedDOMElementAnalysis");
Object.defineProperty(exports, "DetachedDOMElementAnalysis", { enumerable: true, get: function () { return __importDefault(DetachedDOMElementAnalysis_1).default; } });
var GlobalVariableAnalysis_1 = require("./plugins/GlobalVariableAnalysis/GlobalVariableAnalysis");
Object.defineProperty(exports, "GlobalVariableAnalysis", { enumerable: true, get: function () { return __importDefault(GlobalVariableAnalysis_1).default; } });
var CollectionsHoldingStaleAnalysis_1 = require("./plugins/CollectionsHoldingStaleAnalysis");
Object.defineProperty(exports, "CollectionsHoldingStaleAnalysis", { enumerable: true, get: function () { return __importDefault(CollectionsHoldingStaleAnalysis_1).default; } });
var ObjectShallowAnalysis_1 = require("./plugins/ObjectShallowAnalysis");
Object.defineProperty(exports, "ObjectShallowAnalysis", { enumerable: true, get: function () { return __importDefault(ObjectShallowAnalysis_1).default; } });
var ObjectSizeAnalysis_1 = require("./plugins/ObjectSizeAnalysis");
Object.defineProperty(exports, "ObjectSizeAnalysis", { enumerable: true, get: function () { return __importDefault(ObjectSizeAnalysis_1).default; } });
var ShapeUnboundGrowthAnalysis_1 = require("./plugins/ShapeUnboundGrowthAnalysis");
Object.defineProperty(exports, "ShapeUnboundGrowthAnalysis", { enumerable: true, get: function () { return __importDefault(ShapeUnboundGrowthAnalysis_1).default; } });
var ObjectFanoutAnalysis_1 = require("./plugins/ObjectFanoutAnalysis");
Object.defineProperty(exports, "ObjectFanoutAnalysis", { enumerable: true, get: function () { return __importDefault(ObjectFanoutAnalysis_1).default; } });
var ObjectShapeAnalysis_1 = require("./plugins/ObjectShapeAnalysis");
Object.defineProperty(exports, "ObjectShapeAnalysis", { enumerable: true, get: function () { return __importDefault(ObjectShapeAnalysis_1).default; } });
var ObjectUnboundGrowthAnalysis_1 = require("./plugins/ObjectUnboundGrowthAnalysis");
Object.defineProperty(exports, "ObjectUnboundGrowthAnalysis", { enumerable: true, get: function () { return __importDefault(ObjectUnboundGrowthAnalysis_1).default; } });
var StringAnalysis_1 = require("./plugins/StringAnalysis");
Object.defineProperty(exports, "StringAnalysis", { enumerable: true, get: function () { return __importDefault(StringAnalysis_1).default; } });
/** @internal */
var PluginUtils_2 = require("./PluginUtils");
Object.defineProperty(exports, "PluginUtils", { enumerable: true, get: function () { return __importDefault(PluginUtils_2).default; } });
/** @internal */
var HeapAnalysisLoader_1 = require("./HeapAnalysisLoader");
Object.defineProperty(exports, "heapAnalysisLoader", { enumerable: true, get: function () { return __importDefault(HeapAnalysisLoader_1).default; } });
/** @internal */
var HeapConfig_1 = require("./HeapConfig");
Object.defineProperty(exports, "heapConfig", { enumerable: true, get: function () { return __importDefault(HeapConfig_1).default; } });
