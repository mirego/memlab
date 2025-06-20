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
import type { IHeapNode } from '../../Types';
import { LeakDecision, LeakObjectFilterRuleBase } from '../BaseLeakFilter.rule';
export declare class FilterHermesNodeRule extends LeakObjectFilterRuleBase {
    filter(config: MemLabConfig, node: IHeapNode): LeakDecision;
}
//# sourceMappingURL=FilterHermesNode.rule.d.ts.map