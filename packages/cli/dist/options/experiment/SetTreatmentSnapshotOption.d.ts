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
import { MemLabConfig, Nullable } from '@memlab/core';
import { BaseOption } from '@memlab/core';
export default class SetTreatmentWorkDirOption extends BaseOption {
    getOptionName(): string;
    getDescription(): string;
    parse(config: MemLabConfig, args: ParsedArgs): Promise<{
        treatmentWorkDirs?: Nullable<string[]>;
    }>;
}
//# sourceMappingURL=SetTreatmentSnapshotOption.d.ts.map