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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.TraceFinder = exports.MultiIterationSeqClustering = exports.SequentialClustering = exports.RunMetaInfoManager = exports.EvaluationMetric = exports.NormalizedTrace = exports.leakClusterLogger = exports.ProcessManager = exports.modes = exports.memoryBarChart = exports.constant = exports.analysis = exports.browserInfo = exports.serializer = exports.runInfoUtils = exports.fileManager = exports.utils = exports.BaseOption = exports.info = exports.config = exports.registerPackage = void 0;
const path_1 = __importDefault(require("path"));
const PackageInfoLoader_1 = require("./lib/PackageInfoLoader");
__exportStar(require("./lib/Types"), exports);
__exportStar(require("./lib/NodeHeap"), exports);
/** @internal */
function registerPackage() {
    return __awaiter(this, void 0, void 0, function* () {
        return PackageInfoLoader_1.PackageInfoLoader.registerPackage(path_1.default.join(__dirname, '..'));
    });
}
exports.registerPackage = registerPackage;
/** @internal */
var Config_1 = require("./lib/Config");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return __importDefault(Config_1).default; } });
/** @internal */
__exportStar(require("./lib/InternalValueSetter"), exports);
/** @internal */
__exportStar(require("./lib/Config"), exports);
/** @internal */
var Console_1 = require("./lib/Console");
Object.defineProperty(exports, "info", { enumerable: true, get: function () { return __importDefault(Console_1).default; } });
/** @internal */
var BaseOption_1 = require("./lib/BaseOption");
Object.defineProperty(exports, "BaseOption", { enumerable: true, get: function () { return __importDefault(BaseOption_1).default; } });
/** @internal */
var Utils_1 = require("./lib/Utils");
Object.defineProperty(exports, "utils", { enumerable: true, get: function () { return __importDefault(Utils_1).default; } });
/** @internal */
var FileManager_1 = require("./lib/FileManager");
Object.defineProperty(exports, "fileManager", { enumerable: true, get: function () { return __importDefault(FileManager_1).default; } });
/** @internal */
var RunInfoUtils_1 = require("./lib/RunInfoUtils");
Object.defineProperty(exports, "runInfoUtils", { enumerable: true, get: function () { return __importDefault(RunInfoUtils_1).default; } });
/** @internal */
__exportStar(require("./lib/FileManager"), exports);
/** @internal */
var Serializer_1 = require("./lib/Serializer");
Object.defineProperty(exports, "serializer", { enumerable: true, get: function () { return __importDefault(Serializer_1).default; } });
/** @internal */
var BrowserInfo_1 = require("./lib/BrowserInfo");
Object.defineProperty(exports, "browserInfo", { enumerable: true, get: function () { return __importDefault(BrowserInfo_1).default; } });
/** @internal */
var HeapAnalyzer_1 = require("./lib/HeapAnalyzer");
Object.defineProperty(exports, "analysis", { enumerable: true, get: function () { return __importDefault(HeapAnalyzer_1).default; } });
/** @internal */
var Constant_1 = require("./lib/Constant");
Object.defineProperty(exports, "constant", { enumerable: true, get: function () { return __importDefault(Constant_1).default; } });
/** @internal */
var MemoryBarChart_1 = require("./lib/charts/MemoryBarChart");
Object.defineProperty(exports, "memoryBarChart", { enumerable: true, get: function () { return __importDefault(MemoryBarChart_1).default; } });
/** @internal */
var RunningModes_1 = require("./modes/RunningModes");
Object.defineProperty(exports, "modes", { enumerable: true, get: function () { return __importDefault(RunningModes_1).default; } });
/** @internal */
var ProcessManager_1 = require("./lib/ProcessManager");
Object.defineProperty(exports, "ProcessManager", { enumerable: true, get: function () { return __importDefault(ProcessManager_1).default; } });
/** @internal */
var LeakClusterLogger_1 = require("./logger/LeakClusterLogger");
Object.defineProperty(exports, "leakClusterLogger", { enumerable: true, get: function () { return __importDefault(LeakClusterLogger_1).default; } });
/** @internal */
var TraceBucket_1 = require("./trace-cluster/TraceBucket");
Object.defineProperty(exports, "NormalizedTrace", { enumerable: true, get: function () { return __importDefault(TraceBucket_1).default; } });
/** @internal */
var EvalutationMetric_1 = require("./trace-cluster/EvalutationMetric");
Object.defineProperty(exports, "EvaluationMetric", { enumerable: true, get: function () { return __importDefault(EvalutationMetric_1).default; } });
/** @internal */
var RunInfoUtils_2 = require("./lib/RunInfoUtils");
Object.defineProperty(exports, "RunMetaInfoManager", { enumerable: true, get: function () { return RunInfoUtils_2.RunMetaInfoManager; } });
/** @internal */
__exportStar(require("./lib/PackageInfoLoader"), exports);
/** @internal */
var SequentialClustering_1 = require("./trace-cluster/SequentialClustering");
Object.defineProperty(exports, "SequentialClustering", { enumerable: true, get: function () { return __importDefault(SequentialClustering_1).default; } });
/** @internal */
var MultiIterationSeqClustering_1 = require("./trace-cluster/MultiIterationSeqClustering");
Object.defineProperty(exports, "MultiIterationSeqClustering", { enumerable: true, get: function () { return __importDefault(MultiIterationSeqClustering_1).default; } });
/** @internal */
var TraceFinder_1 = require("./paths/TraceFinder");
Object.defineProperty(exports, "TraceFinder", { enumerable: true, get: function () { return __importDefault(TraceFinder_1).default; } });
/** @internal */
__exportStar(require("./trace-cluster/ClusterUtils"), exports);
