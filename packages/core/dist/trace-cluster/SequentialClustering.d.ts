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
export default class SequentialClustering {
    private existingRepresentativeTraces;
    private traceSimilarity;
    constructor();
    cluster(newLeakTraces: LeakTrace[]): LeakTrace[][];
}
//# sourceMappingURL=SequentialClustering.d.ts.map