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
import BaseCommand, { CommandCategory } from '../../BaseCommand';
export default class RunHeapAnalysisCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    getCategory(): CommandCategory;
    getPrerequisites(): BaseCommand[];
    getOptions(): BaseOption[];
    getSubCommands(): BaseCommand[];
    getExamples(): CommandOptionExample[];
    private errorIfNoSubCommand;
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=HeapAnalysisCommand.d.ts.map