/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { CLIOptions } from '@memlab/core';
import { BaseOption } from '@memlab/core';
import BaseCommand, { CommandCategory } from '../../BaseCommand';
import { BaseAnalysis } from '@memlab/heap-analysis';
export default class HeapAnalysisSubCommandWrapper extends BaseCommand {
    private heapAnalysis;
    constructor(analysis: BaseAnalysis);
    getCommandName(): string;
    getDescription(): string;
    getCategory(): CommandCategory;
    getOptions(): BaseOption[];
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=HeapAnalysisSubCommandWrapper.d.ts.map