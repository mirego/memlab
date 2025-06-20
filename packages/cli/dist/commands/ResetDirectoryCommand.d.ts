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
import BaseCommand from '../BaseCommand';
import { BaseOption } from '@memlab/core';
export default class ResetDirectoryCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    getOptions(): BaseOption[];
    run(options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=ResetDirectoryCommand.d.ts.map