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
import type { AnyValue } from '@memlab/core';
import BaseOperation from './BaseOperation';
type PageFunction = (page: Page) => Promise<AnyValue>;
declare class CachePageContent extends BaseOperation {
    kind: string;
    private pageFunction;
    private varName;
    constructor(pageFunction: PageFunction, varName: string);
    act(page: Page): Promise<void>;
}
export default CachePageContent;
//# sourceMappingURL=CachePageContent.d.ts.map