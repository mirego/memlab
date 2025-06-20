/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { IHeapNode, IHeapSnapshot, HeapNodeIdSet } from '@memlab/core';
export declare function beforeLeakFilter(snapshot: IHeapSnapshot, _leakedNodeIds: HeapNodeIdSet): void;
export declare function leakFilter(node: IHeapNode): boolean;
//# sourceMappingURL=dup-string-as-leak.example-1.d.ts.map