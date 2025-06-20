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
/**
 * mark XMLHTTPRequest with status ok as memory leaks
 */
export declare class FilterXMLHTTPRequestRule extends LeakObjectFilterRuleBase {
    filter(_config: MemLabConfig, node: IHeapNode): LeakDecision;
    protected checkFinishedXMLHTTPRequest(node: IHeapNode): boolean;
}
//# sourceMappingURL=FilterXMLHTTPRequest.rule.d.ts.map