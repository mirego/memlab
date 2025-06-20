/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnyValue, BaseOption } from '@memlab/core';
import type { AnalyzeSnapshotResult, HeapAnalysisOptions, RunHeapAnalysisOptions } from './PluginUtils';
declare abstract class Analysis {
    process(_options: HeapAnalysisOptions): Promise<void>;
    /**
     * DO NOT override this method if you are implementing your own analysis
     * by extending {@link BaseAnalysis}.
     * @param options This is the auto-generated arguments passed to all the
     * `process` method that your self-defined heap analysis should implement.
     * You are not supposed to construct instances of this class.
     * @returns any type of value returned from the overridden `process` method
     * of the heap analysis instance. Each heap analysis class can define
     * different return value format.
     * @internal
     */
    run(options?: HeapAnalysisOptions): Promise<void>;
    /**
     * Run heap analysis for a single heap snapshot file
     * @param file the absolute path of a `.heapsnapshot` file.
     * @param options optional configuration for the heap analysis run
     * @returns this API returns {@link AnalyzeSnapshotResult}, which contains
     * the logging file of analysis console output. Alternatively, to get more
     * structured analysis results, check out the documentation of the hosting
     * heap analysis class and call the analysis-specific API to get results
     * after calling this method.
     * * **Example**:
     * ```typescript
     * const analysis = new StringAnalysis();
     * // analysis console output is saved in result.analysisOutputFile
     * const result = await analysis.analyzeSnapshotFromFile(snapshotFile);
     * // query analysis-specific and structured results
     * const stringPatterns = analysis.getTopDuplicatedStringsInCount();
     * ```
     * Additionally, you can specify a working directory to where
     * the intermediate, logging, and final output files will be dumped:
     * ```typescript
     * const analysis = new StringAnalysis();
     * // analysis console output is saved in result.analysisOutputFile
     * // which is inside the specified working directory
     * const result = await analysis.analyzeSnapshotFromFile(snapshotFile, {
     *   // if the specified directory doesn't exist, memlab will create it
     *   workDir: '/tmp/your/work/dir',
     * });
     * ```
     */
    analyzeSnapshotFromFile(file: string, options?: RunHeapAnalysisOptions): Promise<AnalyzeSnapshotResult>;
    /**
     * Run heap analysis for a series of heap snapshot files
     * @param directory the absolute path of the directory holding a series of
     * `.heapsnapshot` files, all snapshot files will be loaded and analyzed
     * in the alphanumerically ascending order of those snapshot file names.
     * @param options optional configuration for the heap analysis run
     * @returns this API returns {@link AnalyzeSnapshotResult}, which contains
     * the logging file of analysis console output. Alternatively, to get more
     * structured analysis results, check out the documentation of the hosting
     * heap analysis class and call the analysis-specific API to get results
     * after calling this method.
     * * **Example**:
     * ```typescript
     * const analysis = new ShapeUnboundGrowthAnalysis();
     * // analysis console output is saved in result.analysisOutputFile
     * const result = await analysis.analyzeSnapshotsInDirectory(snapshotDirectory);
     * // query analysis-specific and structured results
     * const shapes = analysis.getShapesWithUnboundGrowth();
     * ```
     * * Additionally, you can specify a working directory to where
     * the intermediate, logging, and final output files will be dumped:
     * ```typescript
     * const analysis = new ShapeUnboundGrowthAnalysis();
     * // analysis console output is saved in result.analysisOutputFile
     * // which is inside the specified working directory
     * const result = await analysis.analyzeSnapshotsInDirectory(snapshotDirectory, {
     *   // if the specified directory doesn't exist, memlab will create it
     *   workDir: '/tmp/your/work/dir',
     * });
     * ```
     */
    analyzeSnapshotsInDirectory(directory: string, options?: RunHeapAnalysisOptions): Promise<AnalyzeSnapshotResult>;
}
/**
 *
 */
declare class BaseAnalysis extends Analysis {
    /**
     * Get the name of the heap analysis, which is also used to reference
     * the analysis in memlab command-line tool.
     *
     * The following terminal command will initiate with this analysis:
     * `memlab analyze <ANALYSIS_NAME>`
     *
     * @returns the name of the analysis
     * * **Examples**:
     * ```typescript
     * const analysis = new YourAnalysis();
     * const name = analysis.getCommandName();
     * ```
     */
    getCommandName(): string;
    /**
     * Get the textual description of the heap analysis.
     * The description of this analysis will be printed by:
     * `memlab analyze list`
     *
     * @returns the description
     */
    getDescription(): string;
    /**
     * Callback for `memlab analyze <command-name>`.
     * Do the memory analysis and print results in this callback
     * The analysis should support:
     *  1) printing results on screen
     *  2) returning results via the return value
     * @param options This is the auto-generated arguments passed to all the
     * `process` method that your self-defined heap analysis should implement.
     * You are not supposed to construct instances of this class.
     */
    process(options: HeapAnalysisOptions): Promise<AnyValue>;
    /**
     * override this method if you would like CLI to print the option info
     * @returns an array of command line options
     */
    getOptions(): BaseOption[];
}
export default BaseAnalysis;
//# sourceMappingURL=BaseAnalysis.d.ts.map