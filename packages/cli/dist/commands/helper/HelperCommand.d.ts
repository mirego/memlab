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
import BaseCommand from '../../BaseCommand';
type PrintCommandOptions = {
    printOptions?: boolean;
    printDoc?: boolean;
};
type HelperOption = CLIOptions & PrintCommandOptions & {
    modules: Map<string, BaseCommand>;
    command: BaseCommand | null;
    indent?: string;
};
export default class HelperCommand extends BaseCommand {
    private printedCommand;
    private universalOptions;
    getCommandName(): string;
    getDescription(): string;
    getExamples(): CommandOptionExample[];
    setUniversalOptions(options: BaseOption[]): void;
    private printHeader;
    private printCommandCategories;
    private printCategoryHeader;
    private printCategory;
    private getCommandOptionsSummary;
    private printOptions;
    private formatOptionText;
    private printCommand;
    private printHelperTextForCommand;
    private printFullHelperTextForCommand;
    run(options: HelperOption): Promise<void>;
}
export {};
//# sourceMappingURL=HelperCommand.d.ts.map