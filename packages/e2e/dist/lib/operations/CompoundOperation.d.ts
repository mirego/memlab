/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { Page } from 'puppeteer';
import type { E2EOperation } from '@memlab/core';
import BaseOperation from './BaseOperation';
declare class CompoundOperation extends BaseOperation {
    kind: string;
    protected operations: E2EOperation[];
    constructor(operations?: never[]);
    act(page: Page): Promise<void>;
}
export default CompoundOperation;
//# sourceMappingURL=CompoundOperation.d.ts.map