/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { LeakTrace } from '../lib/Types';
type ClusterOption = {
    numberOfIteration?: number;
    numberOfTraceToRetainInCluster?: number;
};
export default class MultiIterationSeqClustering {
    private traceSimilarity;
    constructor();
    cluster(newLeakTraces: LeakTrace[], options?: ClusterOption): LeakTrace[][];
}
export {};
//# sourceMappingURL=MultiIterationSeqClustering.d.ts.map