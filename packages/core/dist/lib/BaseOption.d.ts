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
import type { AnyRecord } from './Types';
import { MemLabConfig } from './Config';
declare abstract class Option {
    private optionalFlag;
    getOptionName(): string;
    getOptionShortcut(): string | null;
    protected parse(_config: MemLabConfig, _args: ParsedArgs): Promise<AnyRecord | void>;
    run(config: MemLabConfig, args: ParsedArgs): Promise<AnyRecord | void>;
    optional(): BaseOption;
    required(): BaseOption;
    isOptional(): boolean;
}
export default class BaseOption extends Option {
    getOptionName(): string;
    getOptionShortcut(): string | null;
    getExampleValues(): string[];
    getDescription(): string;
    protected parse(_config: MemLabConfig, _args: ParsedArgs): Promise<AnyRecord | void>;
}
export {};
//# sourceMappingURL=BaseOption.d.ts.map