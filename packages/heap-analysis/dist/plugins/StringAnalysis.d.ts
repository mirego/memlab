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
 * duplicated string pattern information
 */
export type StringRecord = {
    /** number of duplicated strings with this pattern */
    n: number;
    /** aggregated retained sizes of all duplicated strings with this pattern */
    size: number;
    /** heap object ids of the duplicated string */
    ids: string[];
    /** duplicated string pattern */
    str?: string;
};
/**
 * This analysis finds duplicated string instance in JavaScript heap
 * and rank them based on the duplicated string size and count.
 */
export default class StringAnalysis extends BaseAnalysis {
    private topDupStrInCnt;
    private topDupStrInCntListSize;
    private topDupStrInSize;
    private topDupStrInSizeListSize;
    private stringPatternsStat;
    /**
     * get the top duplicated string in terms of duplicated string count
     * @returns an array of the top-duplicated strings' information
     */
    getTopDuplicatedStringsInCount(): StringRecord[];
    /**
     * collect statistics for specified string patterns
     * pattern name -> string pattern checker
     */
    private static stringPatternsToObserve;
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
    private static shouldIgnoreNode;
    /** @internal */
    process(options: HeapAnalysisOptions): Promise<void>;
    private getPreprocessedStringMap;
    private rankRecords;
    private calculateTopDuplicatedStringsInCount;
    private calculateTopDuplicatedStringsInSize;
    private calculateStringPatternsStatistics;
    private print;
}
//# sourceMappingURL=StringAnalysis.d.ts.map