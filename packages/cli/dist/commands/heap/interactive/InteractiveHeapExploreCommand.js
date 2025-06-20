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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("@memlab/core");
const heap_analysis_1 = require("@memlab/heap-analysis");
const BaseCommand_1 = __importStar(require("../../../BaseCommand"));
const SnapshotFileOption_1 = __importDefault(require("../../../options/heap/SnapshotFileOption"));
const JSEngineOption_1 = __importDefault(require("../../../options/heap/JSEngineOption"));
const CliScreen_1 = __importDefault(require("./ui-components/CliScreen"));
const HeapNodeIdOption_1 = __importDefault(require("../../../options/heap/HeapNodeIdOption"));
const MLClusteringOption_1 = __importDefault(require("../../../options/MLClusteringOption"));
const SetWorkingDirectoryOption_1 = __importDefault(require("../../../options/SetWorkingDirectoryOption"));
const HeapParserDictFastStoreSizeOption_1 = __importDefault(require("../../../options/heap/HeapParserDictFastStoreSizeOption"));
class InteractiveHeapViewCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'view-heap';
    }
    getDescription() {
        return 'interactive command to view a single heap snapshot';
    }
    getCategory() {
        return BaseCommand_1.CommandCategory.COMMON;
    }
    getExamples() {
        return ['--snapshot <HEAP_SNAPSHOT_FILE>'];
    }
    getOptions() {
        return [
            new SnapshotFileOption_1.default(),
            new JSEngineOption_1.default(),
            new HeapNodeIdOption_1.default(),
            new MLClusteringOption_1.default(),
            new SetWorkingDirectoryOption_1.default(),
            new HeapParserDictFastStoreSizeOption_1.default(),
        ];
    }
    // get the heap snapshot to view
    getHeap(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // load single heap snapshot
            heap_analysis_1.heapConfig.isCliInteractiveMode = true;
            yield (0, heap_analysis_1.loadHeapSnapshot)({ args: options.cliArgs });
            // get heap
            const heap = heap_analysis_1.heapConfig.currentHeap;
            if (!heap) {
                throw core_1.utils.haltOrThrow('heap snapshot not found, please specify a heap snapshot ' +
                    `via --${new SnapshotFileOption_1.default().getOptionName()}`);
            }
            return heap;
        });
    }
    getNodesToFocus(heap) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = new Map();
            const nodes = this.getNodesWithLargestRetainedSize(heap);
            ret.set('large-object', nodes);
            const detachedNodes = yield this.getDetachedNodes(heap);
            ret.set('detached', detachedNodes);
            return ret;
        });
    }
    getDetachedNodes(heap) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = [];
            const idSet = new Set();
            heap.nodes.forEach(node => {
                if (core_1.utils.isDetachedDOMNode(node) || core_1.utils.isDetachedFiberNode(node)) {
                    idSet.add(node.id);
                }
            });
            // get a minimal set of objects to represent all the detached DOM elements
            const dominatorIds = core_1.utils.getConditionalDominatorIds(idSet, heap, () => true);
            dominatorIds.forEach(id => {
                const node = heap.getNodeById(id);
                if (node) {
                    ret.push({ tag: 'Detached', heapObject: node });
                }
            });
            return ret;
        });
    }
    getNodesWithLargestRetainedSize(heap) {
        const sizeThreshold = 2 * 1024 * 1024; // 2MB
        const ret = [];
        heap.nodes.forEach(node => {
            if (node.retainedSize >= sizeThreshold && !core_1.utils.isRootNode(node)) {
                ret.push({
                    tag: `${core_1.utils.getReadableBytes(node.retainedSize)}`,
                    heapObject: node,
                });
            }
        });
        return ret;
    }
    // get heap node to focus on
    getHeapNodes(heap) {
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.focusFiberNodeId >= 0) {
                const node = heap.getNodeById(core_1.config.focusFiberNodeId);
                if (node) {
                    const map = new Map();
                    map.set('Chosen', [
                        {
                            tag: 'Chosen',
                            heapObject: node,
                        },
                    ]);
                    return map;
                }
            }
            const category = yield this.getNodesToFocus(heap);
            if (category.size === 0) {
                throw core_1.utils.haltOrThrow('please specify a heap node ' +
                    `via --${new HeapNodeIdOption_1.default().getOptionName()}`);
            }
            return category;
        });
    }
    run(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const workDir = (_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.workDir;
            core_1.fileManager.initDirs(core_1.config, { workDir, errorWhenAbsent: true });
            const reportOutDir = core_1.fileManager.getReportOutDir({ workDir });
            fs_extra_1.default.emptyDirSync(reportOutDir);
            const heap = yield this.getHeap(options);
            const nodes = yield this.getHeapNodes(heap);
            new CliScreen_1.default('memlab heap viewer', heap, nodes).start();
        });
    }
}
exports.default = InteractiveHeapViewCommand;
