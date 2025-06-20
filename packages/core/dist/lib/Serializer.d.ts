/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { E2EStepInfo, HeapNodeIdSet, IHeapEdge, IHeapNode, IHeapSnapshot, ISerializedInfo, JSONifyArgs, LeakTracePathItem, Nullable } from './Types';
declare function JSONifyPath(path: LeakTracePathItem, snapshot: IHeapSnapshot, args: JSONifyArgs): Nullable<ISerializedInfo>;
type SummarizeOptions = {
    compact?: boolean;
    color?: boolean;
    progress?: number;
    abstract?: boolean;
    depth?: number;
    excludeKeySet?: HeapNodeIdSet;
};
declare function summarizeNodeShape(node: IHeapNode, options?: SummarizeOptions): string;
type UnboundedObjectInfo = {
    id: number;
    name: string;
    node: IHeapNode;
    type: string;
    history: number[];
    historyNumberFormatter?: (n: number) => string;
};
declare function summarizeUnboundedObjects(unboundedObjects: UnboundedObjectInfo[], options?: SummarizeOptions): string;
declare function summarizeUnboundedObjectsToCSV(unboundedObjects: UnboundedObjectInfo[]): string;
declare function summarizeTabsOrder(tabsOrder: E2EStepInfo[], options?: SummarizeOptions): string;
declare function summarizeNodeName(node: IHeapNode, options: SummarizeOptions): string;
declare function summarizeEdgeName(edge: IHeapEdge, options?: SummarizeOptions): string;
declare function summarizePath(pathArg: LeakTracePathItem, nodeIdInPaths: Set<number>, snapshot: IHeapSnapshot, options?: SummarizeOptions): string;
declare const _default: {
    JSONifyPath: typeof JSONifyPath;
    summarizeEdgeName: typeof summarizeEdgeName;
    summarizeNodeName: typeof summarizeNodeName;
    summarizeNodeShape: typeof summarizeNodeShape;
    summarizePath: typeof summarizePath;
    summarizeTabsOrder: typeof summarizeTabsOrder;
    summarizeUnboundedObjects: typeof summarizeUnboundedObjects;
    summarizeUnboundedObjectsToCSV: typeof summarizeUnboundedObjectsToCSV;
};
export default _default;
//# sourceMappingURL=Serializer.d.ts.map