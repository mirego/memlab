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
export default class ListScenariosCommand extends BaseCommand {
    getCommandName(): string;
    getDescription(): string;
    run(_options: CLIOptions): Promise<void>;
}
//# sourceMappingURL=ListScenariosCommand.d.ts.map