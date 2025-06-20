/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
/**
 * A heap analysis calculating the memory breakdown of React
 * components and their React hooks.
 *
 * The idea of this heap analysis comes from the tech talk by Giulio Zausa in
 * React Berlin Day 2023. For more context and overview about how the analysis
 * works, please check out the talk here:
 * https://portal.gitnation.org/contents/how-much-ram-is-your-usememo-using-lets-profile-it
 */
import type { AnalyzeSnapshotResult, HeapAnalysisOptions } from '../PluginUtils';
import type { BaseOption } from '@memlab/core';
import BaseAnalysis from '../BaseAnalysis';
declare class ReactComponentHookAnalysis extends BaseAnalysis {
    private isHeapSnapshotMinified;
    private fiberNodeName;
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
    breakDownMemoryByReactComponents(options?: {
        file?: string;
    }): Promise<void>;
    /** @internal */
    private walkHookChain;
    /**
     * This methods get readable React component name corresponds to
     * a specific FiberNode object.
     * @internal
     **/
    private getComponentNameFromFiberNode;
    /**
     * Detects Fiber nodes in the heap snaphot and returns the string name
     * representation for the FiberNode objects.
     * For unminified heap snapshot, this method returns 'FiberNode'.
     * For minified heap snapshot, this method returns the FiberNode object's
     * minified name.
     * @internal
     **/
    private probeHeapAndFiberInfo;
    /** @internal */
    private hasFiberNodeAttributes;
    /** @internal */
    private breakDownSnapshotByReactComponents;
    /** @internal */
    private printHeapInfo;
    /** @internal */
    private printReactComponentStats;
}
export default ReactComponentHookAnalysis;
//# sourceMappingURL=ReactComponentHookAnalysis.d.ts.map