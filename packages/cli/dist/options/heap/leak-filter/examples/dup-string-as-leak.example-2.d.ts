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
declare const _default: {
    beforeLeakFilter: (snapshot: IHeapSnapshot, _leakedNodeIds: HeapNodeIdSet) => void;
    leakFilter: (node: IHeapNode) => boolean;
};
export default _default;
//# sourceMappingURL=dup-string-as-leak.example-2.d.ts.map