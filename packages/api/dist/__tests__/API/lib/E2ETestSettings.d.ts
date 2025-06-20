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
export declare const testTimeout: number;
export declare const defaultAnalysisArgs: {
    args: {
        _: never[];
    };
};
export declare const scenario: {
    app: () => string;
    url: () => string;
    action: (page: Page) => Promise<void>;
};
export declare const testSetup: () => void;
export declare function getUniqueID(): string;
//# sourceMappingURL=E2ETestSettings.d.ts.map