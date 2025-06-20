/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { BaseOption } from '@memlab/core';
import type { AnalyzeSnapshotResult, HeapAnalysisOptions } from '../PluginUtils';
import BaseAnalysis from '../BaseAnalysis';
declare class ObjectUnboundGrowthAnalysis extends BaseAnalysis {
    getCommandName(): string;
    /** @internal */
    getDescription(): string;
    /** @internal */
    getOptions(): BaseOption[];
    /** @internal */
    analyzeSnapshotFromFile(file: string): Promise<AnalyzeSnapshotResult>;
    /** @internal */
    process(options: HeapAnalysisOptions): Promise<void>;
    private checkUnbound;
    private detectUnboundGrowth;
    private calculateRetainedSizes;
}
export default ObjectUnboundGrowthAnalysis;
//# sourceMappingURL=ObjectUnboundGrowthAnalysis.d.ts.map