/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { ConsoleMessage, Dialog, LaunchOptions, Page } from 'puppeteer';
import type { IBrowserInfo } from './Types';
type Options = {
    color?: boolean;
};
declare class BrowserInfo {
    _browserVersion: string;
    _puppeteerConfig: LaunchOptions;
    _consoleMessages: string[];
    constructor();
    clear(): void;
    recordBrowserVersion(version: string): void;
    recordPuppeteerConfig(puppeteerConfig: LaunchOptions): void;
    load(browserInfo: IBrowserInfo): void;
    formatConsoleMessage(message: ConsoleMessage, options?: Options): string[];
    formatDialogMessage(dialog: Dialog, options?: Options): string;
    addMarker(marker: string): void;
    summarizeConsoleMessage(): string;
    dump(): void;
    monitorWebConsole(page: Page): void;
}
declare const _default: BrowserInfo;
export default _default;
//# sourceMappingURL=BrowserInfo.d.ts.map