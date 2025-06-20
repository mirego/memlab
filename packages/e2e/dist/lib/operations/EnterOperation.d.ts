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
import BaseOperation from './BaseOperation';
declare class EnterOperation extends BaseOperation {
    kind: string;
    constructor();
    act(page: Page): Promise<void>;
}
export default EnterOperation;
//# sourceMappingURL=EnterOperation.d.ts.map