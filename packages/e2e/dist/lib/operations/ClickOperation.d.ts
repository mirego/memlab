/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Page } from 'puppeteer';
import type { AnyOptions, Optional } from '@memlab/core';
import BaseOperation from './BaseOperation';
type PageFunction = (page: Page) => Promise<void>;
type IfPageFunction = (page: Page) => Promise<boolean>;
declare class ClickOperation extends BaseOperation {
    kind: string;
    selector: string;
    delay: Optional<number>;
    waitFor: Optional<string | PageFunction>;
    clickCount: Optional<number>;
    indexInMatches: Optional<number>;
    if: Optional<string | IfPageFunction>;
    constructor(selector: string, args?: AnyOptions & {
        delay?: number;
        waitFor?: string | PageFunction;
        clickCount?: number;
        indexInMatches?: number;
        if?: string | IfPageFunction;
    });
    _shouldClick(page: Page): Promise<boolean>;
    private useContains;
    private clickElement;
    act(page: Page): Promise<void>;
}
export default ClickOperation;
//# sourceMappingURL=ClickOperation.d.ts.map