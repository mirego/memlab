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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Config_1 = __importDefault(require("../lib/Config"));
const Console_1 = __importDefault(require("../lib/Console"));
const Serializer_1 = __importDefault(require("../lib/Serializer"));
const Utils_1 = __importDefault(require("../lib/Utils"));
const TraceElement_1 = require("./TraceElement");
const TraceSimilarityStrategy_1 = __importDefault(require("./strategies/TraceSimilarityStrategy"));
const TraceAsClusterStrategy_1 = __importDefault(require("./strategies/TraceAsClusterStrategy"));
const MLTraceSimilarityStrategy_1 = __importDefault(require("./strategies/MLTraceSimilarityStrategy"));
const ClusterUtils_1 = require("./ClusterUtils");
const TraceSampler_1 = __importDefault(require("../lib/TraceSampler"));
// sync up with html/intern/js/webspeed/memlab/lib/LeakCluster.js
class NormalizedTrace {
    constructor(p = null, snapshot = null) {
        if (!p) {
            this.trace = [];
            this.traceSummary = '';
        }
        else {
            this.trace = NormalizedTrace.pathToTrace(p, {
                untilFirstDetachedDOMElem: true,
            });
            this.traceSummary = snapshot
                ? Serializer_1.default.summarizePath(p, new Set(), snapshot)
                : '';
        }
    }
    static getPathLastNode(p, options = {}) {
        const skipRest = !!options.untilFirstDetachedDOMElem;
        const shouldSkip = (node) => {
            // only consider the trace from GC root to the first detached element
            // NOTE: do not use utils.isDetachedDOMNode, which relies on
            //       the fact that p.node is a HeapNode
            return (skipRest &&
                node.name.startsWith('Detached ') &&
                node.name !== 'Detached InternalNode');
        };
        let curItem = p;
        while (curItem.next) {
            if (curItem.node) {
                if (shouldSkip(curItem.node)) {
                    break;
                }
            }
            curItem = curItem.next;
        }
        return curItem === null || curItem === void 0 ? void 0 : curItem.node;
    }
    // convert path to leak trace
    static pathToTrace(p, options = {}) {
        const skipRest = !!options.untilFirstDetachedDOMElem;
        const shouldSkip = (node) => {
            // only consider the trace from GC root to the first detached element
            // NOTE: do not use utils.isDetachedDOMNode, which relies on
            //       the fact that p.node is a HeapNode
            return (skipRest &&
                node.name.startsWith('Detached ') &&
                node.name !== 'Detached InternalNode');
        };
        const trace = [];
        let curItem = p;
        while (curItem) {
            if (curItem.node) {
                trace.push(new TraceElement_1.NodeRecord(curItem.node));
                if (shouldSkip(curItem.node)) {
                    break;
                }
            }
            if (curItem.edge) {
                trace.push(new TraceElement_1.EdgeRecord(curItem.edge));
            }
            curItem = curItem.next;
        }
        return trace;
    }
    // convert leak trace to path
    static traceToPath(trace) {
        if (!trace) {
            return {};
        }
        let p = {};
        for (let i = trace.length - 1; i >= 0; --i) {
            const item = trace[i];
            if (item.kind === 'edge') {
                p.edge = item;
            }
            if (item.kind === 'node') {
                p.node = item;
                p = { next: p };
            }
        }
        return p.next || {};
    }
    getTraceSummary() {
        return this.traceSummary;
    }
    static addLeakedNodeToCluster(cluster, path) {
        const leakedNode = Utils_1.default.getLeakedNode(path);
        if (!cluster.leakedNodeIds) {
            cluster.leakedNodeIds = new Set();
        }
        if (leakedNode) {
            cluster.leakedNodeIds.add(leakedNode.id);
        }
    }
    static calculateClusterRetainedSize(cluster, snapshot, aggregateDominatorMetrics) {
        if (!cluster.leakedNodeIds) {
            return 0;
        }
        return (cluster.retainedSize = aggregateDominatorMetrics(cluster.leakedNodeIds, snapshot, () => true, (node) => node.retainedSize));
    }
    static getSamplePathMaxLength(paths) {
        const lengthArr = paths.map(p => Utils_1.default.getLeakTracePathLength(p));
        return Math.max(30, Utils_1.default.getNumberAtPercentile(lengthArr, 80));
    }
    static samplePaths(paths) {
        const maxCount = Config_1.default.maxSamplesForClustering;
        if (paths.length <= maxCount) {
            return [...paths];
        }
        const sampler = new TraceSampler_1.default(paths.length);
        const ret = [];
        const samplePathMaxLength = NormalizedTrace.getSamplePathMaxLength(paths);
        if (Config_1.default.verbose) {
            Console_1.default.lowLevel(` Sample Trace's Max Length: ${samplePathMaxLength}`);
        }
        paths = paths.filter(p => Utils_1.default.getLeakTracePathLength(p) <= samplePathMaxLength);
        for (const p of paths) {
            if (sampler.sample()) {
                ret.push(p);
            }
            else {
                // force sample objects with non-trvial self size
                const lastNode = NormalizedTrace.getPathLastNode(p);
                if (lastNode && lastNode.self_size >= 100000) {
                    ret.push(p);
                }
            }
        }
        if (Config_1.default.verbose) {
            Console_1.default.lowLevel(`Number of samples after sampling: ${ret.length}.`);
        }
        return ret;
    }
    static diffTraces(newTraces, existingTraces, // existing representative traces
    option = {}) {
        var _a, _b;
        const strategy = (_b = (_a = option.strategy) !== null && _a !== void 0 ? _a : Config_1.default.clusterStrategy) !== null && _b !== void 0 ? _b : new TraceSimilarityStrategy_1.default();
        return strategy.diffTraces(newTraces, existingTraces);
    }
    static diffClusters(newClusters, existingClusters) {
        Console_1.default.overwrite('Diffing clusters');
        // build trace to cluster map
        const traceToClusterMap = new Map();
        const newTraces = [];
        const convertOption = { untilFirstDetachedDOMElem: true };
        for (const cluster of newClusters) {
            const trace = NormalizedTrace.pathToTrace(cluster.path, convertOption);
            newTraces.push(trace);
            traceToClusterMap.set(trace, cluster);
        }
        const existingTraces = [];
        for (const cluster of existingClusters) {
            const trace = NormalizedTrace.pathToTrace(cluster.path, convertOption);
            existingTraces.push(trace);
            traceToClusterMap.set(trace, cluster);
        }
        // differing representative traces in existing clusters vs new traces
        // and calculate which representative traces are stale
        // and which new traces should form new clusters
        const traceDiff = NormalizedTrace.diffTraces(newTraces, existingTraces);
        const { staleClusters, clustersToAdd, allClusters } = traceDiff;
        // map trace to cluster
        const traceToCluster = (trace) => {
            if (!traceToClusterMap.has(trace)) {
                throw Utils_1.default.haltOrThrow('trace to cluster mapping failed');
            }
            return traceToClusterMap.get(trace);
        };
        if (Config_1.default.isContinuousTest) {
            Console_1.default.lowLevel(`${staleClusters.length} stale clusters`);
            Console_1.default.lowLevel(`${clustersToAdd.length} new clusters`);
            Console_1.default.lowLevel(`${allClusters.length} clusters in total`);
        }
        return {
            staleClusters: staleClusters.map(traceToCluster),
            clustersToAdd: clustersToAdd.map(traceToCluster),
            allClusters: allClusters.map(cluster => cluster.map(traceToCluster)),
        };
    }
    static clusterLeakTraces(leakTraces) {
        const { allClusters } = NormalizedTrace.diffTraces(leakTraces, [], {
            strategy: Config_1.default.isMLClustering
                ? new MLTraceSimilarityStrategy_1.default()
                : void 0,
        });
        return NormalizedTrace.clusteredLeakTracesToRecord(allClusters);
    }
    static clusteredLeakTracesToRecord(allClusters) {
        const labaledLeakTraces = allClusters.reduce((acc, bucket) => {
            const lastNodeFromFirstTrace = (0, ClusterUtils_1.lastNodeFromTrace)(bucket[0]);
            bucket.map(ClusterUtils_1.lastNodeFromTrace).forEach(lastNodeInTrace => {
                if (lastNodeInTrace.id == null || lastNodeFromFirstTrace.id == null) {
                    throw new Error('node id not found in last node of the leak trace');
                }
                acc[lastNodeInTrace.id] = String(lastNodeFromFirstTrace.id);
            });
            return acc;
        }, {});
        return labaledLeakTraces;
    }
    static filterClusters(clusters) {
        if (Config_1.default.clusterRetainedSizeThreshold <= 0) {
            return clusters;
        }
        return clusters.filter(cluster => {
            var _a;
            return ((_a = cluster.retainedSize) !== null && _a !== void 0 ? _a : Infinity) >
                Config_1.default.clusterRetainedSizeThreshold;
        });
    }
    static clusterPaths(paths, snapshot, aggregateDominatorMetrics, option = {}) {
        Console_1.default.overwrite('Clustering leak traces');
        if (paths.length === 0) {
            Console_1.default.midLevel('No leaks found');
            return [];
        }
        // sample paths if there are too many
        paths = this.samplePaths(paths);
        // build trace to path map
        const traceToPathMap = new Map();
        const traces = [];
        for (const p of paths) {
            const trace = NormalizedTrace.pathToTrace(p, {
                untilFirstDetachedDOMElem: true,
            });
            traceToPathMap.set(trace, p);
            traces.push(trace);
        }
        // cluster traces
        const { allClusters } = NormalizedTrace.diffTraces(traces, [], option);
        // construct TraceCluster from clustering result
        let clusters = allClusters.map((traces) => {
            const representativeTrace = traces[0];
            const cluster = {
                path: traceToPathMap.get(representativeTrace),
                count: traces.length,
                snapshot,
                retainedSize: 0,
            };
            // add representative object id if there is one
            const lastNode = representativeTrace[representativeTrace.length - 1];
            if ('id' in lastNode) {
                cluster.id = lastNode.id;
            }
            traces.forEach((trace) => {
                NormalizedTrace.addLeakedNodeToCluster(cluster, traceToPathMap.get(trace));
            });
            this.calculateClusterRetainedSize(cluster, snapshot, aggregateDominatorMetrics);
            return cluster;
        });
        clusters = NormalizedTrace.filterClusters(clusters);
        clusters.sort((c1, c2) => { var _a, _b; return ((_a = c2.retainedSize) !== null && _a !== void 0 ? _a : 0) - ((_b = c1.retainedSize) !== null && _b !== void 0 ? _b : 0); });
        return clusters;
    }
    static buildTraceToPathMap(paths) {
        const traceToPathMap = new Map();
        for (const p of paths) {
            const trace = NormalizedTrace.pathToTrace(p, {
                untilFirstDetachedDOMElem: true,
            });
            traceToPathMap.set(trace, p);
        }
        return traceToPathMap;
    }
    static pushLeakPathToCluster(traceToPathMap, trace, cluster) {
        // if this is a control path, update control cluster
        const curPath = traceToPathMap.get(trace);
        if (cluster.count === 0) {
            cluster.path = curPath;
            // add representative object id if there is one
            const lastNode = trace[trace.length - 1];
            if ('id' in lastNode) {
                cluster.id = lastNode.id;
            }
        }
        cluster.count = cluster.count + 1;
        NormalizedTrace.addLeakedNodeToCluster(cluster, curPath);
    }
    static initEmptyCluster(snapshot) {
        return {
            path: {},
            count: 0,
            snapshot,
            retainedSize: 0,
            leakedNodeIds: new Set(),
        };
    }
    static clusterControlTreatmentPaths(leakPathsFromControlRuns, controlSnapshots, leakPathsFromTreatmentRuns, treatmentSnapshots, aggregateDominatorMetrics, option = {}) {
        const result = {
            controlLikelyOrOnlyClusters: [],
            treatmentOnlyClusters: [],
            treatmentLikelyClusters: [],
            hybridClusters: [],
        };
        Console_1.default.overwrite('Clustering leak traces');
        const totalControlPaths = leakPathsFromControlRuns.reduce((count, leakPaths) => count + leakPaths.length, 0);
        const totalTreatmentPaths = leakPathsFromTreatmentRuns.reduce((count, leakPaths) => count + leakPaths.length, 0);
        if (totalControlPaths === 0 && totalTreatmentPaths === 0) {
            Console_1.default.midLevel('No leaks found');
            return result;
        }
        // sample paths if there are too many
        const flattenedLeakPathsFromControlRuns = leakPathsFromControlRuns.reduce((arr, leakPaths) => [...arr, ...leakPaths], []);
        const controlPaths = this.samplePaths(flattenedLeakPathsFromControlRuns);
        const pathsForEachTreatmentGroup = leakPathsFromTreatmentRuns.map((treatmentPaths) => this.samplePaths(treatmentPaths));
        // build control trace to control path map
        const controlTraceToPathMap = NormalizedTrace.buildTraceToPathMap(controlPaths);
        const controlTraces = Array.from(controlTraceToPathMap.keys());
        // build treatment trace to treatment path maps
        // we need to know the mapping to each treatment group
        // to figure out if a trace cluster contains traces from all treatment groups
        const treatmentTraceToPathMaps = pathsForEachTreatmentGroup.map(treatmentPaths => NormalizedTrace.buildTraceToPathMap(treatmentPaths));
        const treatmentTraceToPathMap = new Map();
        const treatmentTraces = [];
        for (const map of treatmentTraceToPathMaps) {
            for (const [key, value] of map.entries()) {
                treatmentTraceToPathMap.set(key, value);
                treatmentTraces.push(key);
            }
        }
        // cluster traces from both the control group and the treatment group
        const { allClusters } = NormalizedTrace.diffTraces([...controlTraces, ...treatmentTraces], [], option);
        // pick one of the control and treatment heap snapshots
        const controlSnapshot = controlSnapshots[0];
        const treatmentSnapshot = treatmentSnapshots[0];
        // construct TraceCluster from clustering result
        allClusters.forEach((traces) => {
            var _a, _b;
            const controlCluster = NormalizedTrace.initEmptyCluster(controlSnapshot);
            const treatmentCluster = NormalizedTrace.initEmptyCluster(treatmentSnapshot);
            // a set containing each the treatment group that
            // has at least one trace in this cluster
            const treatmentSetWithClusterTrace = new Set();
            for (const trace of traces) {
                const normalizedTrace = trace;
                if (controlTraceToPathMap.has(normalizedTrace)) {
                    NormalizedTrace.pushLeakPathToCluster(controlTraceToPathMap, normalizedTrace, controlCluster);
                }
                else {
                    for (let i = 0; i < treatmentTraceToPathMaps.length; ++i) {
                        if (treatmentTraceToPathMaps[i].has(normalizedTrace)) {
                            treatmentSetWithClusterTrace.add(i);
                            break;
                        }
                    }
                    NormalizedTrace.pushLeakPathToCluster(treatmentTraceToPathMap, normalizedTrace, treatmentCluster);
                }
            }
            const controlClusterSize = (_a = controlCluster.count) !== null && _a !== void 0 ? _a : 0;
            const treatmentClusterSize = (_b = treatmentCluster.count) !== null && _b !== void 0 ? _b : 0;
            // calculate aggregated cluster size for control cluster
            if (controlClusterSize > 0) {
                this.calculateClusterRetainedSize(controlCluster, controlSnapshot, aggregateDominatorMetrics);
            }
            // calculate aggregated cluster size for treatment cluster
            if (treatmentClusterSize > 0) {
                this.calculateClusterRetainedSize(treatmentCluster, treatmentSnapshot, aggregateDominatorMetrics);
            }
            if (controlClusterSize === 0 &&
                treatmentSetWithClusterTrace.size === leakPathsFromTreatmentRuns.length) {
                // only when the leak cluster consists of traces from all treatment groups
                result.treatmentOnlyClusters.push(treatmentCluster);
            }
            else if (controlClusterSize === 0) {
                // when the leak cluster consists of traces from
                // some but not all of treatment groups
                result.treatmentLikelyClusters.push(treatmentCluster);
            }
            else if (treatmentClusterSize === 0) {
                // when the leak cluster consists of traces from any of the control groups
                result.controlLikelyOrOnlyClusters.push(controlCluster);
            }
            else {
                result.hybridClusters.push({
                    control: controlCluster,
                    treatment: treatmentCluster,
                });
            }
        });
        result.treatmentOnlyClusters.sort((c1, c2) => { var _a, _b; return ((_a = c2.retainedSize) !== null && _a !== void 0 ? _a : 0) - ((_b = c1.retainedSize) !== null && _b !== void 0 ? _b : 0); });
        result.treatmentLikelyClusters.sort((c1, c2) => { var _a, _b; return ((_a = c2.retainedSize) !== null && _a !== void 0 ? _a : 0) - ((_b = c1.retainedSize) !== null && _b !== void 0 ? _b : 0); });
        result.controlLikelyOrOnlyClusters.sort((c1, c2) => { var _a, _b; return ((_a = c2.retainedSize) !== null && _a !== void 0 ? _a : 0) - ((_b = c1.retainedSize) !== null && _b !== void 0 ? _b : 0); });
        result.hybridClusters.sort((g1, g2) => {
            var _a, _b, _c, _d;
            return ((_a = g2.control.retainedSize) !== null && _a !== void 0 ? _a : 0) +
                ((_b = g2.treatment.retainedSize) !== null && _b !== void 0 ? _b : 0) -
                ((_c = g1.control.retainedSize) !== null && _c !== void 0 ? _c : 0) -
                ((_d = g1.treatment.retainedSize) !== null && _d !== void 0 ? _d : 0);
        });
        return result;
    }
    static generateUnClassifiedClusters(paths, snapshot, aggregateDominatorMetrics) {
        return this.clusterPaths(paths, snapshot, aggregateDominatorMetrics, {
            strategy: new TraceAsClusterStrategy_1.default(),
        });
    }
    static loadCluster() {
        let ret = [];
        const file = Config_1.default.traceClusterFile;
        if (!fs_1.default.existsSync(file)) {
            return ret;
        }
        try {
            const content = fs_1.default.readFileSync(file, 'UTF-8');
            ret = JSON.parse(content);
        }
        catch (ex) {
            throw Utils_1.default.haltOrThrow(Utils_1.default.getError(ex));
        }
        return ret;
    }
    static saveCluster(clusters) {
        const file = Config_1.default.traceClusterFile;
        const content = JSON.stringify(clusters, null, 2);
        fs_1.default.writeFileSync(file, content, 'UTF-8');
    }
}
exports.default = NormalizedTrace;
