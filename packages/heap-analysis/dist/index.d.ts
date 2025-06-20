/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
/** @internal */
export declare function registerPackage(): Promise<void>;
export declare const getDominatorNodes: (ids: Set<number>, snapshot: import("@memlab/core").IHeapSnapshot) => Set<number>, 
/** @deprecated */
getHeapFromFile: (file: string) => Promise<import("@memlab/core").IHeapSnapshot>, getFullHeapFromFile: (file: string) => Promise<import("@memlab/core").IHeapSnapshot>, getSnapshotDirForAnalysis: (options: import("./PluginUtils").HeapAnalysisOptions) => import("@memlab/core").Nullable<string>, getSnapshotFileForAnalysis: (options: import("./PluginUtils").HeapAnalysisOptions) => string, loadHeapSnapshot: (options: import("./PluginUtils").HeapAnalysisOptions) => Promise<import("@memlab/core").IHeapSnapshot>, snapshotMapReduce: <T1, T2>(mapCallback: (snapshot: import("@memlab/core").IHeapSnapshot, i: number, file: string) => T1, reduceCallback: (results: T1[]) => T2, options: import("./PluginUtils").HeapAnalysisOptions) => Promise<T2>, takeNodeFullHeap: () => Promise<import("@memlab/core").IHeapSnapshot>;
export type { AnalyzeSnapshotResult, HeapAnalysisOptions, RunHeapAnalysisOptions, } from './PluginUtils';
export { default as BaseAnalysis } from './BaseAnalysis';
export { default as DetachedDOMElementAnalysis } from './plugins/DetachedDOMElementAnalysis';
export { default as GlobalVariableAnalysis } from './plugins/GlobalVariableAnalysis/GlobalVariableAnalysis';
export { default as CollectionsHoldingStaleAnalysis } from './plugins/CollectionsHoldingStaleAnalysis';
export { default as ObjectShallowAnalysis } from './plugins/ObjectShallowAnalysis';
export { default as ObjectSizeAnalysis } from './plugins/ObjectSizeAnalysis';
export { default as ShapeUnboundGrowthAnalysis } from './plugins/ShapeUnboundGrowthAnalysis';
export { default as ObjectFanoutAnalysis } from './plugins/ObjectFanoutAnalysis';
export { default as ObjectShapeAnalysis } from './plugins/ObjectShapeAnalysis';
export { default as ObjectUnboundGrowthAnalysis } from './plugins/ObjectUnboundGrowthAnalysis';
export { default as StringAnalysis } from './plugins/StringAnalysis';
/** @internal */
export { default as PluginUtils } from './PluginUtils';
/** @internal */
export { default as heapAnalysisLoader } from './HeapAnalysisLoader';
/** @internal */
export { default as heapConfig } from './HeapConfig';
//# sourceMappingURL=index.d.ts.map