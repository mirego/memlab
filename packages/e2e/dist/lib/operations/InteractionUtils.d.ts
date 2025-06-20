/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Page, ElementHandle } from 'puppeteer';
import type { CheckPageLoadCallback, OperationArgs } from '@memlab/core';
declare function waitFor(delay: number): Promise<void>;
declare function WaitUntilCallbackReturnsTrue(page: Page, isPageLoaded: CheckPageLoadCallback, options?: OperationArgs): Promise<void>;
declare function waitUntilLoaded(page: Page, options?: OperationArgs): Promise<void>;
declare function screenshot(page: Page, name: string | number): Promise<void>;
declare function waitForSelector(page: Page, selector: string, whatToWaitForSelectorToDo?: string, optional?: boolean): Promise<boolean>;
declare function checkIfPresent(page: Page, selector: string, optional?: boolean): Promise<boolean>;
declare function checkIfVisible(page: Page, selector: string, optional?: boolean): Promise<boolean>;
declare function waitForDisappearance(page: Page, selector: string, optional?: boolean): Promise<boolean>;
declare function getElementsContainingText(page: Page, text: string): Promise<ElementHandle<Element>[]>;
declare const _default: {
    checkIfPresent: typeof checkIfPresent;
    checkIfVisible: typeof checkIfVisible;
    getElementsContainingText: typeof getElementsContainingText;
    screenshot: typeof screenshot;
    waitFor: typeof waitFor;
    waitForDisappearance: typeof waitForDisappearance;
    waitForSelector: typeof waitForSelector;
    WaitUntilCallbackReturnsTrue: typeof WaitUntilCallbackReturnsTrue;
    waitUntilLoaded: typeof waitUntilLoaded;
};
export default _default;
//# sourceMappingURL=InteractionUtils.d.ts.map