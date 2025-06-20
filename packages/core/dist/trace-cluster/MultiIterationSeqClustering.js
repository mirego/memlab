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
const ClusterUtils_1 = require("./ClusterUtils");
const TraceSimilarityStrategy_1 = __importDefault(require("./strategies/TraceSimilarityStrategy"));
const MLTraceSimilarityStrategy_1 = __importDefault(require("./strategies/MLTraceSimilarityStrategy"));
const Config_1 = __importDefault(require("../lib/Config"));
const Utils_1 = __importDefault(require("../lib/Utils"));
const Console_1 = __importDefault(require("../lib/Console"));
class MultiIterationSeqClustering {
    constructor() {
        this.traceSimilarity = Config_1.default.isMLClustering
            ? new MLTraceSimilarityStrategy_1.default()
            : new TraceSimilarityStrategy_1.default();
    }
    cluster(newLeakTraces, options = {}) {
        const maxNumOfSampleTraceInCluster = positiveIntOrDefaultValue(options.numberOfTraceToRetainInCluster, Infinity);
        const numIteration = positiveIntOrDefaultValue(options.numberOfIteration, 1);
        if (Config_1.default.verbose) {
            Console_1.default.lowLevel(`maxNumOfSampleTraceInCluster: ${maxNumOfSampleTraceInCluster}`);
            Console_1.default.lowLevel(`numIteration: ${numIteration}`);
        }
        // build trace and id mapping
        const traceId2RepTraceId = new Map();
        const traceId2Trace = new Map();
        for (const trace of newLeakTraces) {
            traceId2Trace.set(traceId(trace), trace);
        }
        // split all traces into several batches
        const splitFn = Config_1.default.seqClusteringIsRandomChunks ? ClusterUtils_1.randomChunks : ClusterUtils_1.chunks;
        const traceGroups = splitFn(newLeakTraces, numIteration);
        let clusteredTraceSamples = [];
        for (let iter = 0; iter < numIteration; ++iter) {
            Console_1.default.overwrite(`Iteration: ${iter + 1}`);
            // mix the current traces to cluster with all clustered trace samples
            const curTraceGroup = traceGroups[iter].concat(clusteredTraceSamples);
            // cluster the trace group
            const { allClusters: clusters } = this.traceSimilarity.diffTraces(curTraceGroup, []);
            // assign trace id to representative trace id
            updateTraceId2RepTraceIdMap(clusters, traceId2RepTraceId);
            // sample each group
            for (let i = 0; i < clusters.length; ++i) {
                clusters[i] = clusters[i].slice(0, maxNumOfSampleTraceInCluster);
            }
            // update samples
            clusteredTraceSamples = clusters.reduce((acc, cluster) => acc.concat(cluster), []);
        }
        // rebuild full clusters based on the mappings
        const repTraceId2Cluster = new Map();
        for (const id of traceId2RepTraceId.keys()) {
            const repTraceId = traceId2RepTraceId.get(id);
            if (!repTraceId2Cluster.has(repTraceId)) {
                repTraceId2Cluster.set(repTraceId, []);
            }
            const cluster = repTraceId2Cluster.get(repTraceId);
            if (cluster.length === 0) {
                const repTrace = traceId2Trace.get(repTraceId);
                cluster.push(repTrace);
            }
            if (id !== repTraceId) {
                const trace = traceId2Trace.get(id);
                cluster.push(trace);
            }
        }
        return Array.from(repTraceId2Cluster.values());
    }
}
exports.default = MultiIterationSeqClustering;
function traceId(trace) {
    const lastNode = (0, ClusterUtils_1.lastNodeFromTrace)(trace);
    if (lastNode.id == null) {
        throw Utils_1.default.haltOrThrow('last node id missing');
    }
    return lastNode.id;
}
function updateTraceId2RepTraceIdMap(clusters, traceId2RepTraceId) {
    for (const cluster of clusters) {
        const repTrace = cluster[0];
        for (const trace of cluster) {
            traceId2RepTraceId.set(traceId(trace), traceId(repTrace));
        }
    }
    // update trace id to representative trace id closure
    for (const id of traceId2RepTraceId.keys()) {
        const queue = [];
        let cur = id;
        let repTraceId = traceId2RepTraceId.get(cur);
        while (repTraceId !== cur) {
            queue.push(cur);
            cur = repTraceId;
            repTraceId = traceId2RepTraceId.get(cur);
        }
        for (const idInQueue of queue) {
            traceId2RepTraceId.set(idInQueue, repTraceId);
        }
    }
    return traceId2RepTraceId;
}
function positiveIntOrDefaultValue(v, d) {
    return typeof v !== 'number' || v <= 0 ? d : v;
}
