/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { CLIOptions } from '@memlab/core';
import BaseCommand, { CommandCategory } from '../../BaseCommand';
import { BaseOption } from '@memlab/core';
export default class QueryDefaultWorkDirCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    getCategory(): CommandCategory;
    getOptions(): BaseOption[];
    run(_options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=QueryDefaultWorkDirCommand.d.ts.map