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
const DistanceMatrix_1 = require("./machine-learning/DistanceMatrix");
const HAC_1 = require("./machine-learning/HAC");
const TfidfVectorizer_1 = require("./machine-learning/TfidfVectorizer");
class MLTraceSimilarityStrategy {
    diffTraces(newLeakTraces) {
        var _a;
        const rawDocuments = newLeakTraces.map(this.traceToDoc);
        const vectorizer = new TfidfVectorizer_1.TfidfVectorizer({ rawDocuments });
        const tfidfs = vectorizer.computeTfidfs();
        const dmatrix = (0, DistanceMatrix_1.distance)(tfidfs);
        const result = (0, HAC_1.cluster)(rawDocuments.length, dmatrix, Config_1.default.mlClusteringLinkageMaxDistance);
        const map = new Map();
        for (let i = 0; i < result.length; i++) {
            const traceIdx = result[i];
            const repTrace = newLeakTraces[traceIdx];
            const trace = newLeakTraces[i];
            if (!map.has(repTrace)) {
                map.set(repTrace, [repTrace]);
            }
            // to please linter
            (_a = map.get(repTrace)) === null || _a === void 0 ? void 0 : _a.push(trace);
        }
        return {
            allClusters: Array.from(map.values()),
            staleClusters: [],
            clustersToAdd: [],
        };
    }
    traceToDoc(trace) {
        const res = [];
        for (const t of trace) {
            let name = t.kind === 'node' ? String(t.name) : String(t.name_or_index);
            if (name === '') {
                name = '_null_';
            }
            name = name.replace(/ /g, '_');
            name = name.replace(/\d/g, '');
            if (name === '') {
                name = '_number_';
            }
            res.push(name);
        }
        return res.join(' ');
    }
}
exports.default = MLTraceSimilarityStrategy;
