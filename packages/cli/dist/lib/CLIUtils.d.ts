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
import type { AnyRecord } from '@memlab/core';
export type BlockTextOption = {
    leftIndent?: number;
    lineLength?: number;
};
export declare const READABLE_CMD_FLAG_WIDTH = 70;
export declare const READABLE_TEXT_WIDTH = 150;
export declare function filterAndGetUndefinedArgs(cliArgs: ParsedArgs): AnyRecord;
export declare function argsToString(args: AnyRecord): string;
export declare function getBlankSpaceString(length: number): string;
export declare function alignTextInBlock(text: string, options: BlockTextOption): string;
//# sourceMappingURL=CLIUtils.d.ts.map