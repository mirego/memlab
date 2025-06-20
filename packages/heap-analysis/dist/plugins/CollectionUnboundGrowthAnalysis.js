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
const fs_1 = __importDefault(require("fs"));
const core_1 = require("@memlab/core");
const BaseAnalysis_1 = __importDefault(require("../BaseAnalysis"));
const HeapAnalysisSnapshotDirectoryOption_1 = __importDefault(require("../options/HeapAnalysisSnapshotDirectoryOption"));
const PluginUtils_1 = __importDefault(require("../PluginUtils"));
const __1 = require("..");
class CollectionUnboundGrowthAnalysis extends BaseAnalysis_1.default {
    getCommandName() {
        return 'unbound-collection';
    }
    /** @internal */
    getDescription() {
        return ('Check unbound collection growth ' +
            '(e.g., Map with growing number of entries)');
    }
    /** @internal */
    getOptions() {
        return [new HeapAnalysisSnapshotDirectoryOption_1.default()];
    }
    /** @internal */
    analyzeSnapshotFromFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const f = file;
            throw core_1.utils.haltOrThrow(`${this.constructor.name} does not support analyzeSnapshotFromFile`);
        });
    }
    /** @internal */
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshotDir = PluginUtils_1.default.getSnapshotDirForAnalysis(options);
            const opt = snapshotDir ? { minSnapshots: 2, snapshotDir } : {};
            core_1.config.chaseWeakMapEdge = false;
            core_1.memoryBarChart.plotMemoryBarChart(opt);
            core_1.utils.checkSnapshots(opt);
            yield this.checkUnboundCollection(opt);
        });
    }
    checkUnboundCollection(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeInfo = Object.create(null);
            let hasCheckedFirstSnapshot = false;
            let snapshot = null;
            const initNodeInfo = (node) => {
                if (!__1.PluginUtils.isCollectObject(node)) {
                    return;
                }
                const n = __1.PluginUtils.getCollectionFanout(node);
                nodeInfo[node.id] = {
                    type: node.type,
                    name: node.name,
                    min: n,
                    max: n,
                    history: [n],
                    node,
                };
            };
            const updateNodeInfo = (node) => {
                const item = nodeInfo[node.id];
                if (!item) {
                    return;
                }
                if (node.name !== item.name || node.type !== item.type) {
                    nodeInfo[node.id] = null;
                    return;
                }
                const n = __1.PluginUtils.getCollectionFanout(node);
                // only monotonic increase?
                if (core_1.config.monotonicUnboundGrowthOnly && n < item.max) {
                    nodeInfo[node.id] = null;
                    return;
                }
                item.history.push(n);
                item.max = Math.max(item.max, n);
                item.min = Math.min(item.min, n);
            };
            core_1.info.overwrite('Checking unbounded collections...');
            const snapshotFiles = options.snapshotDir
                ? // load snapshots from a directory
                    core_1.utils.getSnapshotFilesInDir(options.snapshotDir)
                : // load snapshots based on the visit sequence meta data
                    core_1.utils.getSnapshotFilesFromTabsOrder();
            for (const file of snapshotFiles) {
                // force GC before loading each snapshot
                if (global.gc) {
                    global.gc();
                }
                // load and preprocess heap snapshot
                const opt = { buildNodeIdIndex: true, verbose: true };
                snapshot = yield core_1.utils.getSnapshotFromFile(file, opt);
                __1.PluginUtils.calculateRetainedSizes(snapshot);
                // keep track of heap objects
                if (!hasCheckedFirstSnapshot) {
                    // record Ids in the snapshot
                    snapshot.nodes.forEach(initNodeInfo);
                    hasCheckedFirstSnapshot = true;
                }
                else {
                    snapshot.nodes.forEach(updateNodeInfo);
                }
            }
            // exit if no heap snapshot found
            if (!hasCheckedFirstSnapshot) {
                return;
            }
            // post process and print the unbounded objects
            const idsInLastSnapshot = new Set();
            snapshot === null || snapshot === void 0 ? void 0 : snapshot.nodes.forEach(node => {
                idsInLastSnapshot.add(node.id);
            });
            let ids = [];
            for (const key in nodeInfo) {
                const id = parseInt(key, 10);
                const item = nodeInfo[id];
                if (!item) {
                    continue;
                }
                if (!idsInLastSnapshot.has(id)) {
                    continue;
                }
                if (item.min === item.max) {
                    continue;
                }
                ids.push(Object.assign({ id }, item));
            }
            if (ids.length === 0) {
                core_1.info.midLevel('No increasing collections found.');
                return;
            }
            ids = ids
                .sort((o1, o2) => o2.history[o2.history.length - 1] - o1.history[o1.history.length - 1])
                .slice(0, 20);
            const formatter = (n) => `${n}`;
            ids.forEach(item => (item.historyNumberFormatter = formatter));
            // print on terminal
            const str = core_1.serializer.summarizeUnboundedObjects(ids, { color: true });
            core_1.info.topLevel('Top growing objects in sizes:');
            core_1.info.lowLevel(' (Use `memlab trace --node-id=@ID` to get trace)');
            core_1.info.topLevel('\n' + str);
            // save results to file
            const csv = core_1.serializer.summarizeUnboundedObjectsToCSV(ids);
            fs_1.default.writeFileSync(core_1.config.unboundObjectCSV, csv, 'UTF-8');
        });
    }
}
exports.default = CollectionUnboundGrowthAnalysis;
