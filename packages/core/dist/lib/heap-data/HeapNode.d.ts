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
import type { IHeapNode, IHeapEdge, Nullable, EdgeIterationCallback, Predicator, IHeapStringNode, AnyRecord, AnyValue } from '../Types';
import type HeapSnapshot from './HeapSnapshot';
import HeapEdge from './HeapEdge';
import HeapLocation from './HeapLocation';
export declare function isHeapStringType(type: string): boolean;
export default class HeapNode implements IHeapNode {
    private heapSnapshot;
    private idx;
    constructor(heapSnapshot: HeapSnapshot, idx: number);
    get snapshot(): HeapSnapshot;
    get type(): string;
    get name(): string;
    get is_detached(): boolean;
    set detachState(detachState: number);
    markAsDetached(): void;
    get attributes(): number;
    set attributes(attr: number);
    get id(): number;
    get self_size(): number;
    get edge_count(): number;
    get trace_node_id(): number;
    get references(): HeapEdge[];
    forEachReference(callback: EdgeIterationCallback): void;
    findAnyReference(predicate: Predicator<IHeapEdge>): Nullable<IHeapEdge>;
    findAnyReferrer(predicate: Predicator<IHeapEdge>): Nullable<IHeapEdge>;
    findAnyReferrerNode(predicate: Predicator<IHeapNode>): Nullable<IHeapNode>;
    findReferrers(predicate: Predicator<IHeapEdge>): IHeapEdge[];
    findReferrerNodes(predicate: Predicator<IHeapNode>): IHeapNode[];
    get referrers(): HeapEdge[];
    get numOfReferrers(): number;
    forEachReferrer(callback: EdgeIterationCallback): void;
    get hasPathEdge(): boolean;
    get pathEdge(): Nullable<HeapEdge>;
    set pathEdge(edge: Nullable<HeapEdge>);
    get nodeIndex(): number;
    get retainedSize(): number;
    set retainedSize(size: number);
    get dominatorNode(): Nullable<HeapNode>;
    set dominatorNode(node: Nullable<HeapNode>);
    get location(): Nullable<HeapLocation>;
    getReference(edgeName: string | number, edgeType?: string): Nullable<IHeapEdge>;
    getReferenceNode(edgeName: string | number, edgeType?: string): Nullable<IHeapNode>;
    getAnyReferrer(edgeName: string | number, edgeType?: string): Nullable<IHeapEdge>;
    getReferrers(edgeName: string | number, edgeType?: string): IHeapEdge[];
    getAnyReferrerNode(edgeName: string | number, edgeType?: string): Nullable<IHeapNode>;
    getReferrerNodes(edgeName: string | number, edgeType?: string): IHeapNode[];
    get isString(): boolean;
    toStringNode(): Nullable<IHeapStringNode>;
    getJSONifyableObject(): AnyRecord;
    toJSONString(...args: Array<AnyValue>): string;
}
//# sourceMappingURL=HeapNode.d.ts.map