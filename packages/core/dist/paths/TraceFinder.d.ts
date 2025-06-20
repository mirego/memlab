/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnyOptions, HeapNodeIdSet, IHeapEdge, IHeapNode, IHeapSnapshot, LeakTracePathItem, Nullable, Optional, Predicator } from '../lib/Types';
declare class TraceFinder {
    getRootNodeList(snapshot: IHeapSnapshot, opt?: {
        prioritize?: boolean;
    }): [IHeapNode[], IHeapNode[]];
    visitReachableNodesbyDFS(snapshot: IHeapSnapshot, nodeVisitor?: Optional<Predicator<IHeapNode>>, edgeVisitor?: Optional<Predicator<IHeapEdge>>): void;
    flagReachableNodesFromWindow(snapshot: IHeapSnapshot, flags: Uint32Array, flag: number): void;
    private buildPostOrderIndex;
    private calculateDominatorNodesFromPostOrder;
    private calculateRetainedSizesFromDominatorNodes;
    shouldIgnoreEdgeInTraceFinding(edge: IHeapEdge): boolean;
    shouldTraverseEdge(edge: IHeapEdge, snapshot: IHeapSnapshot, options?: AnyOptions): boolean;
    private shouldTraverseNodeByInternalStandard;
    isBlockListedEdge(edge: IHeapEdge): boolean;
    isLessPreferableEdge(edge: IHeapEdge): boolean;
    isLessPreferableNode(node: IHeapNode): boolean;
    getEdgeKey(edge: IHeapEdge): string;
    calculateAllNodesRetainedSizes(snapshot: IHeapSnapshot): void;
    annotateShortestPaths(snapshot: IHeapSnapshot, excludeKeySet?: HeapNodeIdSet): void;
    getPathToGCRoots(_snapshot: IHeapSnapshot, node: Nullable<IHeapNode>): Optional<LeakTracePathItem>;
}
export default TraceFinder;
//# sourceMappingURL=TraceFinder.d.ts.map