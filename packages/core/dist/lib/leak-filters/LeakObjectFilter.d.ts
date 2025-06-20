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
 * apply the leak object filter rules chain and decide
 * if an object is a memory leak or not
 */
export declare class LeakObjectFilter {
    beforeFiltering(config: MemLabConfig, snapshot: IHeapSnapshot, leakedNodeIds: HeapNodeIdSet): void;
    filter(config: MemLabConfig, node: IHeapNode, snapshot: IHeapSnapshot, leakedNodeIds: HeapNodeIdSet): boolean;
}
//# sourceMappingURL=LeakObjectFilter.d.ts.map