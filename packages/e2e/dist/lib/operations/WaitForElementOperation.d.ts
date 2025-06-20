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
import BaseOperation from './BaseOperation';
type WaitForOptions = {
    waitForElementTo?: string;
};
/**
 * This operation waits for an element matching the given selector. It only
 * fails if the given selector does not come to exist within the timeout
 * specified in `checkIfPresent`. If you want to invert this behavior and wait
 * for it to disappear, pass the option `{waitForElementTo: 'disappear'}`.
 * Furthermore, if you want to ensure that the element not only comes to exist
 * but is visible (ie. neither `display:none` nor `visibility:hidden`) then pass
 * the option `{waitForElementTo: 'appear'}`.
 */
declare class WaitForElementOperation extends BaseOperation {
    kind: string;
    selector: string;
    waitForElementTo: string;
    constructor(selector: string, options?: WaitForOptions);
    act(page: Page): Promise<void>;
}
export default WaitForElementOperation;
//# sourceMappingURL=WaitForElementOperation.d.ts.map