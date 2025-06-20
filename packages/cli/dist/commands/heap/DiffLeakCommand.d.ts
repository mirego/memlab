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
import { BaseOption, CLIOptions } from '@memlab/core';
import type { CheckLeakCommandOptions } from './CheckLeakCommand';
import BaseCommand, { CommandCategory } from '../../BaseCommand';
export type WorkDirSettings = {
    controlWorkDirs: Array<string>;
    treatmentWorkDirs: Array<string>;
};
export default class CheckLeakCommand extends BaseCommand {
    private isMLClustering;
    private isMLClusteringSettingCache;
    protected useDefaultMLClusteringSetting(cliArgs: ParsedArgs): void;
    protected restoreDefaultMLClusteringSetting(cliArgs: ParsedArgs): void;
    constructor(options?: CheckLeakCommandOptions);
    getCommandName(): string;
    getDescription(): string;
    getCategory(): CommandCategory;
    getPrerequisites(): BaseCommand[];
    getOptions(): BaseOption[];
    protected showWorkingDirErrorMessageAndHalt(): never;
    protected getWorkDirs(options: CLIOptions): WorkDirSettings;
    private dumpVerboseInfo;
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=DiffLeakCommand.d.ts.map