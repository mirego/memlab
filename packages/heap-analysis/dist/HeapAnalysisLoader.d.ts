/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Optional } from '@memlab/core';
import type BaseAnalysis from './BaseAnalysis';
export type HeapAnalysisLoaderOptions = {
    heapAnalysisPlugin?: Optional<string>;
    errorWhenPluginFailed?: boolean;
};
declare class HeapAnalysisLoader {
    private modules;
    loadAllAnalysis(options?: HeapAnalysisLoaderOptions): Map<string, BaseAnalysis>;
    private registerAnalyses;
    private registerAnalysesFromDir;
    private registerAnalysisFromFile;
}
declare const _default: HeapAnalysisLoader;
export default _default;
//# sourceMappingURL=HeapAnalysisLoader.d.ts.map