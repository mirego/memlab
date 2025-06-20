/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { ParsedArgs } from 'minimist';
import { IHeapSnapshot, IHeapNode, AnyOptions, IHeapEdge, Nullable, MemLabConfig } from '@memlab/core';
declare function isNodeWorthInspecting(node: IHeapNode): boolean;
/**
 * This is the auto-generated arguments passed to all the `process` method
 * that your self-defined heap analysis should implement.
 * You are not supposed to construct instances of this class.
 *
 * For code examples on how this options could be used, see
 * {@link getSnapshotFileForAnalysis}, {@link loadHeapSnapshot},
 * or {@link snapshotMapReduce}.
 */
export type HeapAnalysisOptions = {
    /** @internal */
    args: ParsedArgs;
    /** @internal */
    config?: MemLabConfig;
};
/**
 * This is the input option for {@link analyzeSnapshotFromFile}
 * and {@link analyzeSnapshotsInDirectory}.
 */
export type RunHeapAnalysisOptions = {
    /**
     * specify the working directory to where the intermediate, logging,
     * and output files should be saved
     */
    workDir?: string;
};
/**
 * This is the return type from calling {@link analyzeSnapshotFromFile}
 * or {@link analyzeSnapshotsInDirectory}.
 */
export type AnalyzeSnapshotResult = {
    /**
     * file path of the console output of the heap analysis call
     */
    analysisOutputFile: string;
};
type PrintNodeOption = {
    indent?: string;
    printReferences?: boolean;
};
declare function printNodeListInTerminal(nodeList: IHeapNode[], options?: AnyOptions & PrintNodeOption): void;
declare function printNodeInTerminal(node: IHeapNode): void;
declare function printReferencesInTerminal(edgeList: IHeapEdge[], options?: AnyOptions & PrintNodeOption): void;
declare function printReferrersInTerminal(edgeList: IHeapEdge[], options?: AnyOptions & PrintNodeOption): void;
declare function getObjectOutgoingEdgeCount(node: IHeapNode): number;
/**
 * Get the heap snapshot file's absolute path passed to the hosting heap
 * analysis via `HeapAnalysisOptions`.
 *
 * This API is supposed to be used within the overridden `process` method
 * of an `BaseAnalysis` instance.
 *
 * @param options this is the auto-generated input passed to all the `BaseAnalysis` instances
 * @returns the absolute path of the heap snapshot file
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {getSnapshotFileForAnalysis, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     const file = getSnapshotFileForAnalysis(options);
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // any .heapsnapshot file recorded by memlab or saved manually from Chrome
 * await analysis.analyzeSnapshotFromFile(snapshotFile);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `getSnapshotFileForAnalysis` will use the last heap snapshot in alphanumerically
 * ascending order from {@link BrowserInteractionResultReader}.
 */
declare function getSnapshotFileForAnalysis(options: HeapAnalysisOptions): string;
/**
 * Get the absolute path of the directory holding all the heap snapshot files
 * passed to the hosting heap analysis via `HeapAnalysisOptions`.
 *
 * This API is supposed to be used within the overridden `process` method
 * of an `BaseAnalysis` instance.
 *
 * @param options this is the auto-generated input passed
 * to all the `BaseAnalysis` instances
 * @returns the absolute path of the directory
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {getSnapshotFileForAnalysis, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     const directory = getSnapshotDirForAnalysis(options);
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // any .heapsnapshot file recorded by memlab or saved manually from Chrome
 * await analysis.analyzeSnapshotFromFile(snapshotFile);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `getSnapshotDirForAnalysis` use the snapshot directory from
 * {@link BrowserInteractionResultReader}.
 */
declare function getSnapshotDirForAnalysis(options: HeapAnalysisOptions): Nullable<string>;
/**
 * Load the heap graph based on the single JavaScript heap snapshot
 * passed to the hosting heap analysis via `HeapAnalysisOptions`.
 *
 * This API is supposed to be used within the `process` implementation
 * of an `BaseAnalysis` instance.
 *
 * @param options this is the auto-generated input passed to all the `BaseAnalysis` instances
 * @returns the graph representation of the heap
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {loadHeapSnapshot, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     const heap = await loadHeapSnapshot(options);
 *     // doing heap analysis
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // any .heapsnapshot file recorded by memlab or saved manually from Chrome
 * await analysis.analyzeSnapshotFromFile(snapshotFile);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `loadHeapSnapshot` will use the last heap snapshot in alphanumerically
 * ascending order from {@link BrowserInteractionResultReader}.
 */
declare function loadHeapSnapshot(options: HeapAnalysisOptions): Promise<IHeapSnapshot>;
/**
 * Load and parse a `.heapsnapshot` file and calculate meta data like
 * dominator nodes and retained sizes.
 * @param file the absolute path of the `.heapsnapshot` file
 * @returns the heap graph representation instance that supports querying
 * the heap
 * * **Examples**:
 * ```typescript
 * import {dumpNodeHeapSnapshot} from '@memlab/core';
 * import {getFullHeapFromFile} from '@memlab/heap-analysis';
 *
 * (async function (){
 *   const heapFile = dumpNodeHeapSnapshot();
 *   const heap = await getFullHeapFromFile(heapFile);
 * })();
 * ```
 */
declare function getFullHeapFromFile(file: string): Promise<IHeapSnapshot>;
/**
 * Take a heap snapshot of the current program state
 * and parse it as {@link IHeapSnapshot}. This
 * API also calculates some heap analysis meta data
 * for heap analysis. But this also means slower heap parsing
 * comparing with {@link takeNodeMinimalHeap}.
 *
 * @returns heap representation with heap analysis meta data.
 *
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {takeNodeFullHeap} from '@memlab/heap-analysis';
 *
 * (async function () {
 *   const heap: IHeapSnapshot = await takeNodeFullHeap();
 * })();
 * ```
 */
declare function takeNodeFullHeap(): Promise<IHeapSnapshot>;
/** @deprecated */
declare function getHeapFromFile(file: string): Promise<IHeapSnapshot>;
/**
 * When a heap analysis is taking multiple heap snapshots as input for memory
 * analysis (e.g., finding which object keeps growing in size in a series of
 * heap snapshots), this API could be used to do
 * [MapRedue](https://en.wikipedia.org/wiki/MapReduce) on all heap snapshots.
 *
 * This API is supposed to be used within the `process` implementation
 * of an `BaseAnalysis` instance that is designed to analyze multiple heap
 * snapshots (as an example, finding which object keeps growing overtime)
 *
 * @param mapCallback the map function in MapReduce, the function will be applied
 * to each heap snapshot
 * @param reduceCallback the reduce function in MapReduce, the function will take
 * as input all intermediate results from all map function calls
 * @typeParam T1 - the type of the intermediate result from each map function call
 * @typeParam T2 - the type of the final result of the reduce function call
 * @param options this is the auto-generated input passed to all the `BaseAnalysis` instances
 * @returns the return value of your reduce function
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {snapshotMapReduce, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     // check if the number of heap objects keeps growing overtime
 *     const isMonotonicIncreasing = await snapshotMapReduce(
 *       (heap) => heap.nodes.length,
 *       (nodeCounts) =>
 *         nodeCounts[0] < nodeCounts[nodeCounts.length - 1] &&
 *         nodeCounts.every((count, i) => i === 0 || count >= nodeCounts[i - 1]),
 *       options,
 *     );
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // snapshotDir includes a series of .heapsnapshot files recorded by
 * // memlab or saved manually from Chrome, those files will be loaded
 * // in alphanumerically ascending order
 * await analysis.analyzeSnapshotsInDirectory(snapshotDir);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `snapshotMapReduce` will use all the heap snapshot in alphanumerically
 * ascending order from {@link BrowserInteractionResultReader}.
 *
 * **Why not passing in all heap snapshots as an array of {@link IHeapSnapshot}s?**
 * Each heap snapshot could be non-trivial in size, loading them all at once
 * may not be possible.
 */
declare function snapshotMapReduce<T1, T2>(mapCallback: (snapshot: IHeapSnapshot, i: number, file: string) => T1, reduceCallback: (results: T1[]) => T2, options: HeapAnalysisOptions): Promise<T2>;
/**
 * This API aggregates metrics from the
 * [dominator nodes](https://firefox-source-docs.mozilla.org/devtools-user/memory/dominators/index.html)
 * of the set of input heap objects.
 *
 * @param ids Set of ids of heap objects (or nodes)
 * @param snapshot heap graph loaded from a heap snapshot
 * @param checkNodeCb filter callback to exclude some heap object/nodes
 * before calculating the dominator nodes
 * @param nodeMetricsCb callback to calculate metrics from each dominator node
 * @returns the aggregated metrics
 */
declare function aggregateDominatorMetrics(ids: Set<number>, snapshot: IHeapSnapshot, checkNodeCb: (node: IHeapNode) => boolean, nodeMetricsCb: (node: IHeapNode) => number): number;
/**
 * This API calculate the set of
 * [dominator nodes](https://firefox-source-docs.mozilla.org/devtools-user/memory/dominators/index.html)
 * of the set of input heap objects.
 * @param ids Set of ids of heap objects (or nodes)
 * @param snapshot heap loaded from a heap snapshot
 * @returns the set of dominator nodes/objects
 * * * **Examples**:
 * ```typescript
 * import {dumpNodeHeapSnapshot} from '@memlab/core';
 * import {getFullHeapFromFile, getDominatorNodes} from '@memlab/heap-analysis';
 *
 * class TestObject {}
 *
 * (async function () {
 *   const t1 = new TestObject();
 *   const t2 = new TestObject();
 *
 *   // dump the heap of this running JavaScript program
 *   const heapFile = dumpNodeHeapSnapshot();
 *   const heap = await getFullHeapFromFile(heapFile);
 *
 *   // find the heap node for TestObject
 *   let nodes = [];
 *   heap.nodes.forEach(node => {
 *     if (node.name === 'TestObject' && node.type === 'object') {
 *       nodes.push(node);
 *     }
 *   });
 *
 *   // get the dominator nodes
 *   const dominatorIds = getDominatorNodes(
 *     new Set(nodes.map(node => node.id)),
 *     heap,
 *   );
 * })();
 * ```
 */
declare function getDominatorNodes(ids: Set<number>, snapshot: IHeapSnapshot): Set<number>;
declare function filterOutLargestObjects(snapshot: IHeapSnapshot, objectFilter: (node: IHeapNode) => boolean, listSize?: number): IHeapNode[];
declare function calculateRetainedSizes(snapshot: IHeapSnapshot): void;
declare function isCollectObject(node: IHeapNode): boolean;
declare function getCollectionFanout(node: IHeapNode): number;
declare const _default: {
    aggregateDominatorMetrics: typeof aggregateDominatorMetrics;
    calculateRetainedSizes: typeof calculateRetainedSizes;
    defaultAnalysisArgs: {
        args: {
            _: never[];
        };
    };
    filterOutLargestObjects: typeof filterOutLargestObjects;
    getCollectionFanout: typeof getCollectionFanout;
    getDominatorNodes: typeof getDominatorNodes;
    getObjectOutgoingEdgeCount: typeof getObjectOutgoingEdgeCount;
    getSnapshotDirForAnalysis: typeof getSnapshotDirForAnalysis;
    getSnapshotFileForAnalysis: typeof getSnapshotFileForAnalysis;
    isCollectObject: typeof isCollectObject;
    isNodeWorthInspecting: typeof isNodeWorthInspecting;
    loadHeapSnapshot: typeof loadHeapSnapshot;
    getHeapFromFile: typeof getHeapFromFile;
    getFullHeapFromFile: typeof getFullHeapFromFile;
    printNodeListInTerminal: typeof printNodeListInTerminal;
    printReferencesInTerminal: typeof printReferencesInTerminal;
    printReferrersInTerminal: typeof printReferrersInTerminal;
    printNodeInTerminal: typeof printNodeInTerminal;
    snapshotMapReduce: typeof snapshotMapReduce;
    takeNodeFullHeap: typeof takeNodeFullHeap;
};
export default _default;
//# sourceMappingURL=PluginUtils.d.ts.map