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
import type { Optional } from '@memlab/core';
import BaseOperation from './BaseOperation';
type HoverOptions = {
    delay?: number;
    optional?: boolean;
    indexInMatches?: number;
};
declare class HoverOperation extends BaseOperation {
    kind: string;
    selector: string;
    delay: Optional<number>;
    indexInMatches: Optional<number>;
    constructor(selector: string, args?: HoverOptions);
    private hoverOverElement;
    act(page: Page): Promise<void>;
}
export default HoverOperation;
//# sourceMappingURL=HoverOperation.d.ts.map