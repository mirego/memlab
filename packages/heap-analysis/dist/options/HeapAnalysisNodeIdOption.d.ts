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
import type { MemLabConfig } from '@memlab/core';
import { BaseOption } from '@memlab/core';
export default class HeapAnalysisNodeIdOption extends BaseOption {
    getOptionName(): string;
    getDescription(): string;
    getExampleValues(): string[];
    parse(config: MemLabConfig, args: ParsedArgs): Promise<void>;
}
//# sourceMappingURL=HeapAnalysisNodeIdOption.d.ts.map