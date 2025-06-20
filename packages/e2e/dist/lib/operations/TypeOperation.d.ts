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
type TypeOptions = {
    randomSuffix?: boolean;
    clear?: boolean;
    delay?: number;
};
declare class TypeOperation extends BaseOperation {
    kind: string;
    selector: string;
    inputText: string;
    clear: boolean;
    randomSuffix: boolean;
    delay: number;
    constructor(selector: string, inputText: string, args?: TypeOptions);
    private clearInput;
    act(page: Page): Promise<void>;
}
export default TypeOperation;
//# sourceMappingURL=TypeOperation.d.ts.map