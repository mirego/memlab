/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { MemLabConfig } from '../Config';
import type { HeapNodeIdSet, IHeapSnapshot, LeakTracePathItem } from '../Types';
/**
 * Every leak trace filter rule needs to give a label
 * to each leak trace passed to the filter
 */
export declare enum TraceDecision {
    INSIGHTFUL = "insightful",
    MAYBE_INSIGHTFUL = "maybe-insightful",
    NOT_INSIGHTFUL = "not-insightful"
}
export type LeakTraceFilterOptions = {
    config?: MemLabConfig;
    snapshot?: IHeapSnapshot;
    leakedNodeIds?: HeapNodeIdSet;
};
export interface ILeakTraceFilterRule {
    filter(p: LeakTracePathItem, options: LeakTraceFilterOptions): TraceDecision;
}
//# sourceMappingURL=BaseTraceFilter.rule.d.ts.map