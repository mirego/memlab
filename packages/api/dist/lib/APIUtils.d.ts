/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Browser } from 'puppeteer';
import type { MemLabConfig } from '@memlab/core';
declare function getBrowser(options?: {
    config?: MemLabConfig;
    warmup?: boolean;
}): Promise<Browser>;
declare const _default: {
    getBrowser: typeof getBrowser;
};
export default _default;
//# sourceMappingURL=APIUtils.d.ts.map