/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnyRecord, AnyValue, EdgeIterationCallback, IHeapEdge, IHeapLocation, IHeapNode, IHeapSnapshot, IHeapStringNode, Nullable } from '../lib/Types';
export declare class NodeRecord implements IHeapNode {
    kind: string;
    name: string;
    type: string;
    id: number;
    is_detached: boolean;
    detachState: number;
    attributes: number;
    self_size: number;
    edge_count: number;
    trace_node_id: number;
    nodeIndex: number;
    retainedSize: number;
    highlight?: boolean;
    markAsDetached(): void;
    get isString(): boolean;
    set isString(b: boolean);
    set snapshot(s: IHeapSnapshot);
    get snapshot(): IHeapSnapshot;
    set references(r: IHeapEdge[]);
    get references(): IHeapEdge[];
    forEachReference(_callback: EdgeIterationCallback): void;
    set referrers(r: IHeapEdge[]);
    get referrers(): IHeapEdge[];
    get numOfReferrers(): number;
    toStringNode(): IHeapStringNode;
    forEachReferrer(_callback: EdgeIterationCallback): void;
    findAnyReference(): Nullable<IHeapEdge>;
    findAnyReferrer(): Nullable<IHeapEdge>;
    findAnyReferrerNode(): Nullable<IHeapNode>;
    findReferrers(): IHeapEdge[];
    findReferrerNodes(): IHeapNode[];
    set hasPathEdge(f: boolean);
    get hasPathEdge(): boolean;
    set pathEdge(r: IHeapEdge);
    get pathEdge(): IHeapEdge;
    set dominatorNode(r: IHeapNode);
    get dominatorNode(): IHeapNode;
    set location(r: IHeapLocation);
    get location(): IHeapLocation;
    getReference(_edgeName: string | number, _edgeType?: string): Nullable<IHeapEdge>;
    getReferenceNode(_edgeName: string | number, _edgeType?: string): Nullable<IHeapNode>;
    getAnyReferrer(_edgeName: string | number, _edgeType?: string): Nullable<IHeapEdge>;
    getAnyReferrerNode(_edgeName: string | number, _edgeType?: string): Nullable<IHeapNode>;
    getReferrers(_edgeName: string | number, _edgeType?: string): IHeapEdge[];
    getReferrerNodes(_edgeName: string | number, _edgeType?: string): IHeapNode[];
    getJSONifyableObject(): AnyRecord;
    toJSONString(...args: Array<AnyValue>): string;
    constructor(node: IHeapNode);
    private extraceNodeName;
}
export declare class EdgeRecord implements IHeapEdge {
    kind: string;
    name_or_index: string | number;
    type: string;
    edgeIndex: number;
    is_index: boolean;
    to_node: number;
    constructor(edge: IHeapEdge);
    getJSONifyableObject(): AnyRecord;
    toJSONString(...args: Array<AnyValue>): string;
    set snapshot(s: IHeapSnapshot);
    get snapshot(): IHeapSnapshot;
    set toNode(s: IHeapNode);
    get toNode(): IHeapNode;
    set fromNode(s: IHeapNode);
    get fromNode(): IHeapNode;
}
export type NormalizedTraceElement = NodeRecord | EdgeRecord;
//# sourceMappingURL=TraceElement.d.ts.map