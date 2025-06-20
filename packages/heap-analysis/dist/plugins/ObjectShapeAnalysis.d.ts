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
import type { BaseOption } from '@memlab/core';
import BaseAnalysis from '../BaseAnalysis';
declare class ObjectShapeAnalysis extends BaseAnalysis {
    getCommandName(): string;
    /** @internal */
    getDescription(): string;
    /** @internal */
    getOptions(): BaseOption[];
    /** @internal */
    analyzeSnapshotsInDirectory(directory: string): Promise<AnalyzeSnapshotResult>;
    /** @internal */
    process(options: HeapAnalysisOptions): Promise<void>;
    /** @internal */
    breakDownMemoryByShapes(options?: {
        file?: string;
    }): Promise<void>;
    /** @internal */
    private breakDownSnapshotByShapes;
    /** @internal */
    private breakDownByReferrers;
    /** @internal */
    private isTrivialEdgeForBreakDown;
}
export default ObjectShapeAnalysis;
//# sourceMappingURL=ObjectShapeAnalysis.d.ts.map