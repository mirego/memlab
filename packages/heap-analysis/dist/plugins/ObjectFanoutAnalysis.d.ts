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
declare class ObjectFanoutAnalysis extends BaseAnalysis {
    getCommandName(): string;
    /** @internal */
    getDescription(): string;
    /** @internal */
    getOptions(): BaseOption[];
    /** @internal */
    analyzeSnapshotsInDirectory(directory: string): Promise<AnalyzeSnapshotResult>;
    /** @internal */
    process(options: HeapAnalysisOptions): Promise<void>;
    private getObjectsWithHighFanout;
}
export default ObjectFanoutAnalysis;
//# sourceMappingURL=ObjectFanoutAnalysis.d.ts.map