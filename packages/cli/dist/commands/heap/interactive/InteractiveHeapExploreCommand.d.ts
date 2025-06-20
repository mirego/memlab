/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { BaseOption, CLIOptions, CommandOptionExample } from '@memlab/core';
import BaseCommand, { CommandCategory } from '../../../BaseCommand';
export default class InteractiveHeapViewCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    getCategory(): CommandCategory;
    getExamples(): CommandOptionExample[];
    getOptions(): BaseOption[];
    private getHeap;
    private getNodesToFocus;
    private getDetachedNodes;
    private getNodesWithLargestRetainedSize;
    private getHeapNodes;
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=InteractiveHeapExploreCommand.d.ts.map