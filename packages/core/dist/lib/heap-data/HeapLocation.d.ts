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
import type { AnyRecord, AnyValue, IHeapLocation, IHeapNode, Nullable } from '../Types';
import type HeapSnapshot from './HeapSnapshot';
export default class HeapLocation implements IHeapLocation {
    private heapSnapshot;
    private idx;
    constructor(heapSnapshot: HeapSnapshot, idx: number);
    get snapshot(): HeapSnapshot;
    get node(): Nullable<IHeapNode>;
    get script_id(): number;
    get line(): number;
    get column(): number;
    getJSONifyableObject(): AnyRecord;
    toJSONString(...args: Array<AnyValue>): string;
}
//# sourceMappingURL=HeapLocation.d.ts.map