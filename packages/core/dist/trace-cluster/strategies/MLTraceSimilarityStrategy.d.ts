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
export default class MLTraceSimilarityStrategy implements IClusterStrategy {
    diffTraces(newLeakTraces: LeakTrace[]): TraceDiff;
    traceToDoc(trace: LeakTrace): string;
}
//# sourceMappingURL=MLTraceSimilarityStrategy.d.ts.map