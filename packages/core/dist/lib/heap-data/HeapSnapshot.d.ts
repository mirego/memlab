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
import type { AnyRecord, AnyValue, IHeapNode, IHeapNodes, IHeapEdges, IHeapSnapshot, HeapNodeTypes, HeapEdgeTypes, HeapSnapshotMeta, RawHeapSnapshot, Nullable } from '../Types';
import HeapNode from './HeapNode';
import NumericDictionary from './utils/NumericDictionary';
export default class HeapSnapshot implements IHeapSnapshot {
    snapshot: RawHeapSnapshot;
    isProcessed: boolean;
    nodes: IHeapNodes;
    _nodeCount: number;
    edges: IHeapEdges;
    _edgeCount: number;
    _nodeId2NodeIdx: NumericDictionary;
    _nodeIdxHasPathEdge: Uint8Array;
    _nodeIdx2PathEdgeIdx: Uint32Array;
    _nodeIdx2DominatorNodeIdx: Uint32Array;
    _nodeIdxHasDominatorNode: Uint8Array;
    _nodeIdx2RetainedSize: BigUint64Array;
    _additionalAttributes: Uint8Array;
    _nodeDetachednessOffset: number;
    _externalDetachedness: Uint8Array;
    _nodeIdx2LocationIdx: Uint32Array;
    _locationFieldsCount: number;
    _locationCount: number;
    _locationObjectIndexOffset: number;
    _nodeFieldsCount: number;
    _nodeIdOffset: number;
    forwardEdges: number[];
    _metaNode: HeapSnapshotMeta;
    _nodeTypeOffset: number;
    _nodeNameOffset: number;
    _nodeSelfSizeOffset: number;
    _nodeEdgeCountOffset: number;
    _nodeTraceNodeIdOffset: number;
    _nodeTypes: HeapNodeTypes;
    _nodeArrayType: number;
    _nodeHiddenType: number;
    _nodeObjectType: number;
    _nodeNativeType: number;
    _nodeConsStringType: number;
    _nodeSlicedStringType: number;
    _nodeCodeType: number;
    _nodeSyntheticType: number;
    _edgeFieldsCount: number;
    _edgeTypeOffset: number;
    _edgeNameOrIndexOffset: number;
    _edgeToNodeOffset: number;
    _edgeTypes: HeapEdgeTypes;
    _edgeElementType: number;
    _edgeHiddenType: number;
    _edgeInternalType: number;
    _edgeShortcutType: number;
    _edgeWeakType: number;
    _edgeInvisibleType: number;
    _locationScriptIdOffset: number;
    _locationLineOffset: number;
    _locationColumnOffset: number;
    _firstEdgePointers: Uint32Array;
    _retainingEdgeIndex2EdgeIndex: Uint32Array;
    _firstRetainerIndex: Uint32Array;
    _edgeIndex2SrcNodeIndex: Uint32Array;
    constructor(snapshot: RawHeapSnapshot, _options?: Record<string, never>);
    getJSONifyableObject(): AnyRecord;
    toJSONString(...args: Array<AnyValue>): string;
    hasObjectWithClassName(className: string): boolean;
    getAnyObjectWithClassName(className: string): Nullable<IHeapNode>;
    hasObjectWithPropertyName(nameOrIndex: string | number): boolean;
    hasObjectWithTag(tag: string): boolean;
    getNodeById(id: number): Nullable<HeapNode>;
    getNodesByIds(ids: number[]): Array<Nullable<HeapNode>>;
    getNodesByIdSet(ids: Set<number>): Set<HeapNode>;
    clearShortestPathInfo(): void;
    _buildMetaData(): void;
    _buildExtraMetaData(): void;
    _buildLocationIdx(): void;
    _buildNodeIdx(): void;
    _calculateBasicInfo(): void;
    _buildReferencesIndex(): void;
    _buildReferrersIndex(): void;
    _iterateDirectChildren(nodeIndex: number, edgeFilterCallback: (edgeType: number) => boolean, childCallback: (nodeIndex: number) => void): void;
    _propagateDetachednessState(): void;
}
//# sourceMappingURL=HeapSnapshot.d.ts.map