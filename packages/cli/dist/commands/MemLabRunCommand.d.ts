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
import BaseCommand, { CommandCategory } from '../BaseCommand';
export default class MemLabRunCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    getExamples(): CommandOptionExample[];
    getPrerequisites(): BaseCommand[];
    getOptions(): BaseOption[];
    getExcludedOptions(): BaseOption[];
    getCategory(): CommandCategory;
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=MemLabRunCommand.d.ts.map