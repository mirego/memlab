/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnalyzeSnapshotResult, HeapAnalysisOptions } from '../PluginUtils';
import { BaseOption } from '@memlab/core';
import BaseAnalysis from '../BaseAnalysis';
/**
 * duplicated object pattern information
 */
export type ObjectRecord = {
    /** number of duplicated objects with this pattern */
    n: number;
    /** aggregated retained sizes of all duplicated objects with this pattern */
    size: number;
    /** heap object ids of the duplicated JS objects */
    ids: string[];
    /** duplicated object pattern */
    obj: string;
};
declare class ObjectShallowAnalysis extends BaseAnalysis {
    private topDupObjInCnt;
    private topDupObjInCntListSize;
    private topDupObjInSize;
    private topDupObjInSizeListSize;
    private objectPatternsStat;
    /**
     * get CLI command name for this memory analysis;
     * use it with `memlab analyze <ANALYSIS_NAME>` in CLI
     * @returns command name
     */
    getCommandName(): string;
    /**
     * get a textual description of the memory analysis
     * @returns textual description
     * @internal
     */
    getDescription(): string;
    /** @internal */
    getOptions(): BaseOption[];
    /** @internal */
    analyzeSnapshotsInDirectory(directory: string): Promise<AnalyzeSnapshotResult>;
    /** @internal */
    process(options: HeapAnalysisOptions): Promise<void>;
    /**
     * get the top duplicated object in terms of duplicated object count
     * @returns an array of the top-duplicated objects' information
     */
    getTopDuplicatedObjectInCount(): ObjectRecord[];
    /** @ignore */
    private getPreprocessedObjectMap;
    private nodeToObject;
    private static objectPatternsToObserve;
    private shouldIgnoreNode;
    private textEllipsis;
    private rankRecords;
    private calculateTopDuplicatedObjectsInCount;
    private calculateTopDuplicatedObjectsInSize;
    private calculateobjectPatternsStatistics;
    private print;
}
export default ObjectShallowAnalysis;
//# sourceMappingURL=ObjectShallowAnalysis.d.ts.map