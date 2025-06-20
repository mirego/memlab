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
import type { AnyRecord, MemLabConfig, Optional } from '@memlab/core';
import { BaseOption } from '@memlab/core';
export default class NumberOfRunsOption extends BaseOption {
    private defaultRunNumber;
    constructor(runNumber?: number);
    getOptionName(): string;
    getDescription(): string;
    getExampleValues(): string[];
    static getParsedOption(configFromOptions: Optional<AnyRecord>): number;
    parse(config: MemLabConfig, args: ParsedArgs): Promise<AnyRecord>;
}
//# sourceMappingURL=NumberOfRunsOption.d.ts.map