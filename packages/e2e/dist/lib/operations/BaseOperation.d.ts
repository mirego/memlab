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
import type { E2EOperation, OperationArgs } from '@memlab/core';
declare abstract class BaseOperation implements E2EOperation {
    kind: string;
    selector: string;
    protected optional: boolean;
    constructor();
    protected log(msg: string): void;
    do(page: Page, opArgs?: OperationArgs): Promise<void>;
    act(_page: Page, _opArgs?: OperationArgs): Promise<void>;
}
export default BaseOperation;
//# sourceMappingURL=BaseOperation.d.ts.map