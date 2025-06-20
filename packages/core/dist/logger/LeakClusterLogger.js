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
const BrowserInfo_1 = __importDefault(require("../lib/BrowserInfo"));
const Config_1 = __importDefault(require("../lib/Config"));
const Console_1 = __importDefault(require("../lib/Console"));
const Serializer_1 = __importDefault(require("../lib/Serializer"));
const Utils_1 = __importDefault(require("../lib/Utils"));
const TraceBucket_1 = __importDefault(require("../trace-cluster/TraceBucket"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const readdir = (0, util_1.promisify)(fs_1.default.readdir);
const readFile = (0, util_1.promisify)(fs_1.default.readFile);
class LeakClusterLogger {
    constructor() {
        this._fileIdx = 0;
    }
    _loadClustersData(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield readdir(dir);
            return Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const p = path_1.default.join(dir, file);
                const content = yield readFile(p, 'UTF-8');
                return JSON.parse(content);
            })));
        });
    }
    loadClusters(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._loadClustersData(dir);
            return data.map((info) => {
                const meta = JSON.parse(info.meta_data);
                const traceRecord = meta.trace_record;
                return {
                    id: info.cluster_id,
                    path: TraceBucket_1.default.traceToPath(traceRecord),
                    clusterMetaInfo: info,
                };
            });
        });
    }
    dumpReadableCluster(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const metaFile = options.metaFile;
            if (!metaFile || !fs_1.default.existsSync(metaFile)) {
                throw Utils_1.default.haltOrThrow(`File doesn't exist: ${metaFile}`);
            }
            const meta = yield this.loadClusterMeta(metaFile);
            Console_1.default.topLevel(`\nApp: ${meta.app}, Interaction: ${meta.interaction}`);
            Console_1.default.lowLevel(`Created on: ${new Date(meta.creation_time * 1000)}`);
            Console_1.default.topLevel(`\nTest interactions: ${meta.interaction_summary}`);
            Console_1.default.topLevel(`\nLeak trace:`);
            Console_1.default.topLevel(meta.leak_trace_summary);
        });
    }
    loadClusterMeta(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield readFile(file, 'UTF-8');
            return JSON.parse(content);
        });
    }
    logUnclassifiedClusters(clusters) {
        const tabsOrder = Utils_1.default.loadTabsOrder();
        const interactSummary = Serializer_1.default.summarizeTabsOrder(tabsOrder);
        const interactionVector = tabsOrder.map(tab => tab.name);
        for (const cluster of clusters) {
            this._logSingleUnClassifiedCluster(tabsOrder, cluster, interactSummary, interactionVector);
        }
    }
    logClusters(clusters, options = {}) {
        this._saveClusterSummary(clusters);
        if (Config_1.default.useExternalSnapshot) {
            return;
        }
        const tabsOrder = Utils_1.default.loadTabsOrder();
        const interactSummary = Serializer_1.default.summarizeTabsOrder(tabsOrder);
        const interactionVector = tabsOrder.map(tab => tab.name);
        for (const cluster of clusters) {
            this._logCluster(tabsOrder, cluster, interactSummary, interactionVector);
        }
        // manage unique clusters
        if (!options.clusterDiff) {
            return;
        }
        this.logClusterDiff(options.clusterDiff);
    }
    logAllClusters(clusters) {
        const file = Config_1.default.allClusterSummaryFile;
        let content = '';
        for (let i = 0; i < clusters.length; ++i) {
            content += `--------- cluster ${i + 1} ---------\n\n`;
            for (let j = 0; j < clusters[i].length; ++j) {
                const cluster = clusters[i][j];
                content += `cluster: ${cluster.id}\n\n`;
                let traceSummary;
                if (cluster.clusterMetaInfo) {
                    traceSummary = cluster.clusterMetaInfo.leak_trace_summary;
                }
                else {
                    const trace = new TraceBucket_1.default(cluster.path, cluster.snapshot);
                    traceSummary = trace.getTraceSummary();
                }
                content += traceSummary + '\n\n';
            }
        }
        fs_1.default.writeFileSync(file, content, 'UTF-8');
    }
    logClusterDiff(clusterDiff) {
        const staleClusters = clusterDiff.staleClusters || [];
        for (const cluster of staleClusters) {
            this._logStaleCluster(cluster);
        }
        const clustersToAdd = clusterDiff.clustersToAdd || [];
        for (const cluster of clustersToAdd) {
            this._logClusterToAdd(cluster);
        }
        this.logAllClusters(clusterDiff.allClusters);
    }
    _logStaleCluster(cluster) {
        const info = {
            cluster_id: cluster.id,
        };
        const file = path_1.default.join(Config_1.default.staleUniqueClusterDir, `cluster-${cluster.id}.json`);
        fs_1.default.writeFileSync(file, JSON.stringify(info, null, 2), 'UTF-8');
    }
    _logClusterToAdd(cluster) {
        const tabsOrder = Utils_1.default.loadTabsOrder();
        const interactSummary = Serializer_1.default.summarizeTabsOrder(tabsOrder);
        const interactionVector = tabsOrder.map(tab => tab.name);
        const nodeId = Utils_1.default.getLastNodeId(cluster.path);
        const filepath = path_1.default.join(Config_1.default.newUniqueClusterDir, `@${nodeId}.json`);
        this._logCluster(tabsOrder, cluster, interactSummary, interactionVector, {
            filepath,
        });
    }
    _saveClusterSummary(clusters) {
        // log cluster summary to a readable file
        fs_1.default.appendFileSync(Config_1.default.exploreResultFile, `\n------${clusters.length} clusters------\n`, 'UTF-8');
        const opt = { color: !Config_1.default.isContinuousTest };
        for (const cluster of clusters) {
            const size = Utils_1.default.getReadableBytes(cluster.retainedSize);
            const stat = `\n--Similar leaks in this run: ${cluster.count}--` +
                `\n--Retained size of leaked objects: ${size}--\n`;
            const { path, snapshot } = cluster;
            if (snapshot) {
                // print trace in terminal
                let trace = Serializer_1.default.summarizePath(path, new Set(), snapshot, opt);
                Console_1.default.topLevel(stat + trace);
                // dump plain text train in files
                trace = Serializer_1.default.summarizePath(path, new Set(), snapshot);
                fs_1.default.appendFileSync(Config_1.default.exploreResultFile, stat + trace, 'UTF-8');
            }
        }
    }
    _logCluster(tabsOrder, cluster, interactSummary, interactionVector, options = {}) {
        const file = options.filepath || this._getTraceFilePath(cluster);
        const trace = new TraceBucket_1.default(cluster.path, cluster.snapshot);
        const info = {
            cluster_id: cluster.id || 0,
            creation_time: Date.now(),
            app: Config_1.default.targetApp,
            interaction: Config_1.default.targetTab,
            num_duplicates: cluster.count,
            retained_size: cluster.retainedSize,
            interaction_summary: interactSummary,
            leak_trace_summary: trace.getTraceSummary(),
            interaction_vector: interactionVector,
            meta_data: JSON.stringify({
                extraRunInfo: Utils_1.default.mapToObject(Config_1.default.extraRunInfoMap),
                browser_info: BrowserInfo_1.default,
                visit_plan: tabsOrder,
                trace_record: TraceBucket_1.default.pathToTrace(cluster.path),
            }),
        };
        fs_1.default.writeFileSync(file, JSON.stringify(info, null, 2), 'UTF-8');
    }
    _getTraceFilePath(cluster) {
        const filename = `@${Utils_1.default.getLastNodeId(cluster.path)}.json`;
        return path_1.default.join(Config_1.default.traceClusterOutDir, filename);
    }
    _logSingleUnClassifiedCluster(tabsOrder, cluster, interactSummary, interactionVector, options = {}) {
        var _a;
        const file = options.filepath || this._getUnclassifiedTraceFilePath(cluster);
        const trace = new TraceBucket_1.default(cluster.path, cluster.snapshot);
        const info = {
            cluster_id: (_a = cluster.id) !== null && _a !== void 0 ? _a : 0,
            creation_time: Date.now(),
            app: Config_1.default.targetApp,
            interaction: Config_1.default.targetTab,
            num_duplicates: cluster.count,
            retained_size: cluster.retainedSize,
            interaction_summary: interactSummary,
            leak_trace_summary: trace.getTraceSummary(),
            interaction_vector: interactionVector,
            meta_data: JSON.stringify({
                browser_info: BrowserInfo_1.default,
                visit_plan: tabsOrder,
                trace_record: TraceBucket_1.default.pathToTrace(cluster.path),
            }),
        };
        fs_1.default.writeFileSync(file, JSON.stringify(info, null, 2), 'UTF-8');
    }
    _getUnclassifiedTraceFilePath(cluster) {
        const filename = `@${Utils_1.default.getLastNodeId(cluster.path)}.json`;
        return path_1.default.join(Config_1.default.unclassifiedClusterDir, filename);
    }
}
exports.default = new LeakClusterLogger();
