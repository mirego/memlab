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
const ClusterUtils_1 = __importDefault(require("./ClusterUtils"));
const TraceSimilarityStrategy_1 = __importDefault(require("./strategies/TraceSimilarityStrategy"));
const MLTraceSimilarityStrategy_1 = __importDefault(require("./strategies/MLTraceSimilarityStrategy"));
const Config_1 = __importDefault(require("../lib/Config"));
class SequentialClustering {
    constructor() {
        this.existingRepresentativeTraces = [];
        this.traceSimilarity = Config_1.default.isMLClustering
            ? new MLTraceSimilarityStrategy_1.default()
            : new TraceSimilarityStrategy_1.default();
    }
    cluster(newLeakTraces) {
        const { allClusters: clusters } = this.traceSimilarity.diffTraces(newLeakTraces, []);
        const representativeTracesToAdd = [];
        // Second round of clustering and relabeling
        outer: for (let i = 0; i < clusters.length; i++) {
            const newRepTrace = clusters[i][0];
            for (const exRepTrace of this.existingRepresentativeTraces) {
                if (ClusterUtils_1.default.isSimilarTrace(exRepTrace, newRepTrace)) {
                    clusters[i].unshift(exRepTrace);
                    continue outer;
                }
            }
            representativeTracesToAdd.push(newRepTrace);
        }
        this.existingRepresentativeTraces = [
            ...this.existingRepresentativeTraces,
            ...representativeTracesToAdd,
        ];
        return clusters;
    }
}
exports.default = SequentialClustering;
