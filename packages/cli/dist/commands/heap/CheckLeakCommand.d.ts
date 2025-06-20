/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { ParsedArgs } from 'minimist';
import type { BaseOption, CLIOptions, CommandOptionExample } from '@memlab/core';
import BaseCommand, { CommandCategory } from '../../BaseCommand';
export type CheckLeakCommandOptions = {
    isMLClustering?: boolean;
};
export default class CheckLeakCommand extends BaseCommand {
    private isMLClustering;
    private isMLClusteringSettingCache;
    protected useDefaultMLClusteringSetting(cliArgs: ParsedArgs): void;
    protected restoreDefaultMLClusteringSetting(cliArgs: ParsedArgs): void;
    constructor(options?: CheckLeakCommandOptions);
    getCommandName(): string;
    getExamples(): CommandOptionExample[];
    getDescription(): string;
    getDocumentation(): string;
    getCategory(): CommandCategory;
    getPrerequisites(): BaseCommand[];
    getOptions(): BaseOption[];
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=CheckLeakCommand.d.ts.map