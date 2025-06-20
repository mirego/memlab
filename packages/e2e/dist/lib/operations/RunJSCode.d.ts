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
import type { AnyFunction, AnyOptions, AnyValue } from '@memlab/core';
import BaseOperation from './BaseOperation';
declare class RunJSCode extends BaseOperation {
    kind: string;
    private callback;
    private repeat;
    private args;
    constructor(callback: AnyFunction, opt?: AnyOptions & {
        repeat?: number;
        args?: AnyValue[];
    });
    act(page: Page): Promise<void>;
}
export default RunJSCode;
//# sourceMappingURL=RunJSCode.d.ts.map