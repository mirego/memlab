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
const ClusterUtils_1 = __importDefault(require("../ClusterUtils"));
// each trace is a cluster
class TraceAsClusterStrategy {
    diffTraces(newTraces, existingTraces) {
        // duplicated cluster to remove
        const staleClusters = [];
        // new cluster to save
        const clustersToAdd = [];
        // all clusters, with duplicated cluters in the same sub-array
        const clusters = existingTraces.map(trace => [trace]);
        // checking new clusters
        for (let i = 0; i < newTraces.length; ++i) {
            const traceToCheck = newTraces[i];
            clustersToAdd.push(traceToCheck);
            clusters.push([traceToCheck]);
        }
        return { staleClusters, clustersToAdd, allClusters: clusters };
    }
    static isSimilarTrace(t1, t2) {
        return ClusterUtils_1.default.isSimilarTrace(t1, t2);
    }
}
exports.default = TraceAsClusterStrategy;
