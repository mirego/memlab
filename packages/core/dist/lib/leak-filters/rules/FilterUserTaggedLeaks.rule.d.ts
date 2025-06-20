/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { MemLabConfig } from '../../Config';
import type { IHeapNode, IHeapSnapshot } from '../../Types';
import { LeakDecision, LeakObjectFilterRuleBase } from '../BaseLeakFilter.rule';
/**
 * leaked objects that are tagged by user code
 */
export declare class FilterUserTaggedLeaksRule extends LeakObjectFilterRuleBase {
    _taggedNodeIds: Set<number>;
    beforeFiltering(_config: MemLabConfig, snapshot: IHeapSnapshot): void;
    filter(config: MemLabConfig, node: IHeapNode): LeakDecision;
    protected isReferencedByTaggedWeakRef(node: IHeapNode): boolean;
    protected isReferencedByMemLabObjectTracker(node: IHeapNode): boolean;
}
//# sourceMappingURL=FilterUserTaggedLeaks.rule.d.ts.map