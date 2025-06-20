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
import type { HeapNodeIdSet, IHeapNode, IHeapSnapshot } from '../Types';
/**
 * Every leak object filter rule needs to give a label
 * to each object passed to the filter
 */
export declare enum LeakDecision {
    LEAK = "leak",
    MAYBE_LEAK = "maybe-leak",
    NOT_LEAK = "not-leak"
}
export interface ILeakObjectFilterRule {
    beforeFiltering(config: MemLabConfig, snapshot: IHeapSnapshot, leakedNodeIds: HeapNodeIdSet): void;
    filter(config: MemLabConfig, node: IHeapNode, snapshot: IHeapSnapshot, leakedNodeIds: HeapNodeIdSet): LeakDecision;
}
export declare abstract class LeakObjectFilterRuleBase implements ILeakObjectFilterRule {
    beforeFiltering(_config: MemLabConfig, _snapshot: IHeapSnapshot, _leakedNodeIds: HeapNodeIdSet): void;
    abstract filter(config: MemLabConfig, node: IHeapNode, snapshot: IHeapSnapshot, leakedNodeIds: HeapNodeIdSet): LeakDecision;
}
//# sourceMappingURL=BaseLeakFilter.rule.d.ts.map