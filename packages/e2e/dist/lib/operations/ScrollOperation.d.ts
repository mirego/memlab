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
import type { OperationArgs } from '@memlab/core';
import BaseOperation from './BaseOperation';
type ScrollOptions = {
    scrollUp?: boolean;
    scrollBack?: boolean;
};
declare class ScrollOperation extends BaseOperation {
    kind: string;
    strideLength: number;
    repeat: number;
    scrollDirection: number;
    scrollBack: boolean;
    constructor(strideLength: number, repeat?: number, opt?: ScrollOptions);
    act(page: Page, opArgs?: OperationArgs): Promise<void>;
}
export default ScrollOperation;
//# sourceMappingURL=ScrollOperation.d.ts.map