/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { IHeapNode, IHeapSnapshot, LeakTrace, LeakTracePathItem, Optional, TraceCluster, TraceClusterDiff, IClusterStrategy, ControlTreatmentClusterResult } from '../lib/Types';
import type { NormalizedTraceElement } from './TraceElement';
type AggregateNodeCb = (ids: Set<number>, snapshot: IHeapSnapshot, checkCb: (node: IHeapNode) => boolean, calculateCb: (node: IHeapNode) => number) => number;
export default class NormalizedTrace {
    private trace;
    private traceSummary;
    constructor(p?: LeakTracePathItem | null, snapshot?: IHeapSnapshot | null);
    static getPathLastNode(p: LeakTracePathItem, options?: {
        untilFirstDetachedDOMElem?: boolean;
    }): Optional<IHeapNode>;
    static pathToTrace(p: LeakTracePathItem, options?: {
        untilFirstDetachedDOMElem?: boolean;
    }): NormalizedTraceElement[];
    static traceToPath(trace: Optional<LeakTrace>): LeakTracePathItem;
    getTraceSummary(): string;
    static addLeakedNodeToCluster(cluster: TraceCluster, path: LeakTracePathItem): void;
    static calculateClusterRetainedSize(cluster: TraceCluster, snapshot: IHeapSnapshot, aggregateDominatorMetrics: AggregateNodeCb): number;
    static getSamplePathMaxLength(paths: LeakTracePathItem[]): number;
    static samplePaths(paths: LeakTracePathItem[]): LeakTracePathItem[];
    private static diffTraces;
    static diffClusters(newClusters: TraceCluster[], existingClusters: TraceCluster[]): TraceClusterDiff;
    static clusterLeakTraces(leakTraces: LeakTrace[]): Record<string, string>;
    static clusteredLeakTracesToRecord(allClusters: LeakTrace[][]): Record<string, string>;
    static filterClusters(clusters: TraceCluster[]): TraceCluster[];
    static clusterPaths(paths: LeakTracePathItem[], snapshot: IHeapSnapshot, aggregateDominatorMetrics: AggregateNodeCb, option?: {
        strategy?: IClusterStrategy;
    }): TraceCluster[];
    private static buildTraceToPathMap;
    private static pushLeakPathToCluster;
    private static initEmptyCluster;
    static clusterControlTreatmentPaths(leakPathsFromControlRuns: LeakTracePathItem[][], controlSnapshots: IHeapSnapshot[], leakPathsFromTreatmentRuns: LeakTracePathItem[][], treatmentSnapshots: IHeapSnapshot[], aggregateDominatorMetrics: AggregateNodeCb, option?: {
        strategy?: IClusterStrategy;
    }): ControlTreatmentClusterResult;
    static generateUnClassifiedClusters(paths: LeakTracePathItem[], snapshot: IHeapSnapshot, aggregateDominatorMetrics: AggregateNodeCb): TraceCluster[];
    static loadCluster(): NormalizedTrace[];
    static saveCluster(clusters: NormalizedTrace[]): void;
}
export {};
//# sourceMappingURL=TraceBucket.d.ts.map