/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnyValue, LeakTraceElement, LeakTrace } from '../lib/Types';
type NameWeightMapType = Map<string | RegExp | number, number>;
interface ClusteringHeuristic {
    edgeNameStopWords: NameWeightMapType;
    nodeNameStopWords: NameWeightMapType;
    similarWordRegExps: Map<RegExp, number>;
    decendentDecayFactors: {
        kind: string;
        name: string;
        decay: number;
    }[];
    startingModuleForTraceMatching: (string | RegExp)[];
}
export declare function debugLog(...args: AnyValue[]): void;
interface DebugElementSimilarityStatsParams {
    elementA: LeakTraceElement;
    elementB: LeakTraceElement;
    matchedSum: number;
    totalSum: number;
}
export declare const debugTraceElementSimilarityStats: ({ elementA, elementB, matchedSum, totalSum, }: DebugElementSimilarityStatsParams) => void;
type ClusteringUtilReturnType = {
    isSimilarTrace: (t1: LeakTrace, t2: LeakTrace) => boolean;
};
declare const _default: {
    initialize: (heuristics: ClusteringHeuristic) => ClusteringUtilReturnType;
};
export default _default;
//# sourceMappingURL=ClusterUtilsHelper.d.ts.map