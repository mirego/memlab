/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { CDPSession, Page } from 'puppeteer';
export default class NetworkManager {
    private cdpSession;
    private page;
    private requestCache;
    private scriptManager;
    constructor(page: Page);
    setCDPSession(session: CDPSession): void;
    private networkLog;
    interceptScript(): Promise<void>;
}
//# sourceMappingURL=NetworkManager.d.ts.map