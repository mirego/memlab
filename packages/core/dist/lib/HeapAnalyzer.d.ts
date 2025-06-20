/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { E2EStepInfo, HeapNodeIdSet, IHeapSnapshot, IMemoryAnalystSnapshotDiff, IOveralHeapInfo, LeakTracePathItem, Optional, IOveralLeakInfo, TraceCluster, ISerializedInfo, DiffLeakOptions } from './Types';
import TraceFinder from '../paths/TraceFinder';
type DiffSnapshotsOptions = {
    loadAllSnapshots?: boolean;
    workDir?: string;
};
type WorkDirOptions = {
    workDir?: string;
};
type GetTraceOptions = {
    workDir?: string;
    printConsoleOnly?: boolean;
};
declare class MemoryAnalyst {
    checkLeak(): Promise<ISerializedInfo[]>;
    diffLeakByWorkDir(options: DiffLeakOptions): Promise<ISerializedInfo[]>;
    diffMemoryLeakTraces(options: DiffLeakOptions): Promise<ISerializedInfo[]>;
    detectMemoryLeaks(): Promise<ISerializedInfo[]>;
    focus(options?: {
        file?: string;
    }): Promise<void>;
    shouldLoadCompleteSnapshot(tabsOrder: E2EStepInfo[], tab: E2EStepInfo): boolean;
    diffSnapshots(options?: DiffSnapshotsOptions): Promise<IMemoryAnalystSnapshotDiff>;
    preparePathFinder(snapshot: IHeapSnapshot): TraceFinder;
    private dumpPageInteractionSummary;
    private dumpLeakSummaryToConsole;
    private filterLeakedObjects;
    getOverallHeapInfo(snapshot: IHeapSnapshot, options?: {
        force?: boolean;
    }): Optional<IOveralHeapInfo>;
    getOverallLeakInfo(leakedNodeIds: HeapNodeIdSet, snapshot: IHeapSnapshot): Optional<IOveralLeakInfo>;
    printHeapInfo(leakInfo: IOveralHeapInfo): void;
    private printHeapAndLeakInfo;
    private logLeakTraceSummary;
    filterLeakPaths(leakedNodeIds: HeapNodeIdSet, snapshot: IHeapSnapshot, options?: WorkDirOptions): LeakTracePathItem[];
    findLeakTraces(leakedNodeIds: HeapNodeIdSet, snapshot: IHeapSnapshot, options?: WorkDirOptions): Promise<LeakTracePathItem[]>;
    /**
     * Given a set of heap object ids, cluster them based on the similarity
     * of their retainer traces
     * @param leakedNodeIds
     * @param snapshot
     * @returns
     */
    clusterHeapObjects(objectIds: HeapNodeIdSet, snapshot: IHeapSnapshot): TraceCluster[];
    serializeClusterUpdate(clusters: TraceCluster[], options?: {
        reclusterOnly?: boolean;
    }): Promise<void>;
    dumpPathByNodeId(leakedIdSet: HeapNodeIdSet, snapshot: IHeapSnapshot, nodeIdsInSnapshots: Array<HeapNodeIdSet>, id: number, pathLoaderFile: string, summaryFile: string, options?: GetTraceOptions): void;
}
declare const _default: MemoryAnalyst;
export default _default;
//# sourceMappingURL=HeapAnalyzer.d.ts.map