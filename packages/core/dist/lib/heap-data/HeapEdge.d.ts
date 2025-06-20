/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @lightSyntaxTransform
 * @oncall memory_lab
 */
import type { AnyRecord, AnyValue, IHeapEdge } from '../Types';
import type HeapSnapshot from './HeapSnapshot';
import HeapNode from './HeapNode';
export default class HeapEdge implements IHeapEdge {
    private heapSnapshot;
    private idx;
    constructor(heapSnapshot: HeapSnapshot, idx: number);
    get snapshot(): HeapSnapshot;
    get edgeIndex(): number;
    get type(): string;
    get is_index(): boolean;
    get name_or_index(): number | string;
    get to_node(): number;
    get toNode(): HeapNode;
    get fromNode(): HeapNode;
    getJSONifyableObject(): AnyRecord;
    toJSONString(...args: Array<AnyValue>): string;
}
//# sourceMappingURL=HeapEdge.d.ts.map