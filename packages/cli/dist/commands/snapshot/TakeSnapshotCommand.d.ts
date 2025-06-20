/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { CLIOptions, CommandOptionExample } from '@memlab/core';
import BaseCommand from '../../BaseCommand';
import { BaseOption } from '@memlab/core';
export default class TakeSnapshotCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    getPrerequisites(): BaseCommand[];
    getExamples(): CommandOptionExample[];
    getOptions(): BaseOption[];
    run(_options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=TakeSnapshotCommand.d.ts.map