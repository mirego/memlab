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
const Config_1 = __importDefault(require("../../lib/Config"));
const Console_1 = __importDefault(require("../../lib/Console"));
const ClusterUtils_1 = __importDefault(require("../ClusterUtils"));
// cluster by putting similar traces together
class TraceSimilarityStrategy {
    diffTraces(newTraces, existingTraces) {
        // duplicated cluster to remove
        const staleClusters = [];
        // new cluster to save
        const clustersToAdd = [];
        // all clusters, with duplicated cluters in the same sub-array
        const clusters = [];
        // consolidating existing clusters
        if (existingTraces.length > 0) {
            clusters.push([existingTraces[0]]);
            outer: for (let i = 1; i < existingTraces.length; ++i) {
                const traceToCheck = existingTraces[i];
                for (let j = 0; j < clusters.length; ++j) {
                    const repTrace = clusters[j][0];
                    if (TraceSimilarityStrategy.isSimilarTrace(repTrace, traceToCheck)) {
                        staleClusters.push(traceToCheck);
                        clusters[j].push(traceToCheck);
                        continue outer;
                    }
                }
                clusters.push([traceToCheck]);
            }
        }
        // checking new clusters
        outer: for (let i = 0; i < newTraces.length; ++i) {
            const traceToCheck = newTraces[i];
            // use an odd number as the divider. If we choose 10 as the divider,
            // when updating the progress indicator, the final digit always ends
            // with a zero, which can appear strange and not representative of
            // the actual progress.
            if (!Config_1.default.isContinuousTest && i % 17 === 0) {
                Console_1.default.overwrite(`clustering trace: ${i} / ${newTraces.length}`);
            }
            for (let j = 0; j < clusters.length; ++j) {
                const repTrace = clusters[j][0];
                if (TraceSimilarityStrategy.isSimilarTrace(repTrace, traceToCheck)) {
                    clusters[j].push(traceToCheck);
                    continue outer;
                }
            }
            clustersToAdd.push(traceToCheck);
            clusters.push([traceToCheck]);
        }
        Console_1.default.overwrite('');
        return { staleClusters, clustersToAdd, allClusters: clusters };
    }
    static isSimilarTrace(t1, t2) {
        return ClusterUtils_1.default.isSimilarTrace(t1, t2);
    }
}
exports.default = TraceSimilarityStrategy;
