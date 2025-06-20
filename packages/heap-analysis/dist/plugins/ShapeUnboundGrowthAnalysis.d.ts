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
type ShapeSummary = {
    shape: string;
    counts: number[];
    sizes: number[];
    examples: number[];
};
export default class ShapeUnboundGrowthAnalysis extends BaseAnalysis {
    private shapesOfInterest;
    private shapesWithUnboundGrowth;
    getCommandName(): string;
    /** @internal */
    getDescription(): string;
    /** @internal */
    getOptions(): BaseOption[];
    /** @internal */
    analyzeSnapshotFromFile(file: string): Promise<AnalyzeSnapshotResult>;
    getShapesWithUnboundGrowth(): ShapeSummary[];
    /** @internal */
    process(options: HeapAnalysisOptions): Promise<void>;
    private retrieveShapesOfInterest;
    private getShapesInfo;
    private getSummary;
    private print;
}
export {};
//# sourceMappingURL=ShapeUnboundGrowthAnalysis.d.ts.map