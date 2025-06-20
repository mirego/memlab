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
import type { AnyRecord, IHeapStringNode } from '../Types';
import type HeapSnapshot from './HeapSnapshot';
import HeapNode from './HeapNode';
export default class HeapStringNode extends HeapNode implements IHeapStringNode {
    constructor(heapSnapshot: HeapSnapshot, idx: number);
    get stringValue(): string;
    getJSONifyableObject(): AnyRecord;
}
//# sourceMappingURL=HeapStringNode.d.ts.map