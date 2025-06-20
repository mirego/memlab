/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { IClusterStrategy, LeakTrace, TraceDiff } from '../../lib/Types';
export default class TraceSimilarityStrategy implements IClusterStrategy {
    diffTraces(newTraces: LeakTrace[], existingTraces: LeakTrace[]): TraceDiff;
    static isSimilarTrace(t1: LeakTrace, t2: LeakTrace): boolean;
}
//# sourceMappingURL=TraceSimilarityStrategy.d.ts.map