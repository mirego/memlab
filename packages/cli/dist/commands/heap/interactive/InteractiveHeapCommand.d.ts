/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { CLIOptions, CommandOptionExample } from '@memlab/core';
import BaseCommand, { CommandCategory } from '../../../BaseCommand';
import { BaseOption } from '@memlab/core';
export default class InteractiveHeapCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    getCategory(): CommandCategory;
    getExamples(): CommandOptionExample[];
    getOptions(): BaseOption[];
    private exitAttempt;
    private printPromptInfo;
    private quit;
    private initPrompt;
    private setupInterruptHandle;
    private setupCommandHandle;
    private startInteractiveCLI;
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=InteractiveHeapCommand.d.ts.map