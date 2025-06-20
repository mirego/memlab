/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { E2EStepInfo, TraceCluster, TraceClusterDiff, TraceClusterMetaInfo } from '../lib/Types';
declare class LeakClusterLogger {
    _fileIdx: number;
    constructor();
    _loadClustersData(dir: string): Promise<TraceClusterMetaInfo[]>;
    loadClusters(dir: string): Promise<TraceCluster[]>;
    dumpReadableCluster(options?: {
        metaFile?: string;
    }): Promise<void>;
    loadClusterMeta(file: string): Promise<TraceClusterMetaInfo>;
    logUnclassifiedClusters(clusters: TraceCluster[]): void;
    logClusters(clusters: TraceCluster[], options?: {
        clusterDiff?: TraceClusterDiff;
    }): void;
    logAllClusters(clusters: TraceCluster[][]): void;
    logClusterDiff(clusterDiff: TraceClusterDiff): void;
    _logStaleCluster(cluster: TraceCluster): void;
    _logClusterToAdd(cluster: TraceCluster): void;
    _saveClusterSummary(clusters: TraceCluster[]): void;
    _logCluster(tabsOrder: E2EStepInfo[], cluster: TraceCluster, interactSummary: string, interactionVector: string[], options?: {
        filepath?: string;
    }): void;
    _getTraceFilePath(cluster: TraceCluster): string;
    _logSingleUnClassifiedCluster(tabsOrder: E2EStepInfo[], cluster: TraceCluster, interactSummary: string, interactionVector: string[], options?: {
        filepath?: string;
    }): void;
    _getUnclassifiedTraceFilePath(cluster: TraceCluster): string;
}
declare const _default: LeakClusterLogger;
export default _default;
//# sourceMappingURL=LeakClusterLogger.d.ts.map