/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnalyzeSnapshotResult, HeapAnalysisOptions } from '../../PluginUtils';
import { BaseOption } from '@memlab/core';
import BaseAnalysis from '../../BaseAnalysis';
declare class GlobalVariableAnalysis extends BaseAnalysis {
    getCommandName(): string;
    /** @internal */
    getDescription(): string;
    /** @internal */
    getOptions(): BaseOption[];
    /** @internal */
    process(options: HeapAnalysisOptions): Promise<void>;
    /** @internal */
    analyzeSnapshotsInDirectory(directory: string): Promise<AnalyzeSnapshotResult>;
    private shouldFilterOutEdge;
    /** @internal */
    private getGlobalVariables;
}
export default GlobalVariableAnalysis;
//# sourceMappingURL=GlobalVariableAnalysis.d.ts.map