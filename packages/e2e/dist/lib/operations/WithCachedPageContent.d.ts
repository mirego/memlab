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
import type { AnyValue } from '@memlab/core';
import BaseOperation from './BaseOperation';
type OperationFactory = (memCache: Record<string, AnyValue>) => BaseOperation;
/**
 * Supply a factory function that produces an operation, and this operation will
 * supply the memory cache to it. Use this in cases where you want the inner
 * operation to be customizable based on some piece of cached content (eg. the
 * URL of a post permalink created in an earlier step).
 */
declare class WithCachedPageContent extends BaseOperation {
    operationFactory: OperationFactory;
    constructor(operationFactory: OperationFactory);
    act(page: Page): Promise<void>;
}
export default WithCachedPageContent;
//# sourceMappingURL=WithCachedPageContent.d.ts.map