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
import { MemLabConfig } from '@memlab/core';
import { BaseOption, TraceObjectMode } from '@memlab/core';
export default class TraceAllObjectsOption extends BaseOption {
    getOptionName(): string;
    getDescription(): string;
    getAvailableOptions(): Array<string>;
    getMode(optionValue: string): TraceObjectMode;
    parse(config: MemLabConfig, args: ParsedArgs): Promise<void>;
}
//# sourceMappingURL=TraceAllObjectsOption.d.ts.map