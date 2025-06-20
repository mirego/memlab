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
import { BaseOption, MemLabConfig } from '@memlab/core';
export default class CleanupSnapshotOption extends BaseOption {
    getOptionName(): string;
    getDescription(): string;
    parse(config: MemLabConfig, args: ParsedArgs): Promise<{
        cleanUpSnapshot: boolean;
    }>;
}
//# sourceMappingURL=CleanupSnapshotOption.d.ts.map