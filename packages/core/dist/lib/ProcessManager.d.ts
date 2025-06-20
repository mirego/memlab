/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Command, Optional } from './Types';
type Options = {
    msg?: string;
    processLimit?: number;
};
declare class ProcessManager {
    private procLimit;
    private nProc;
    start(nextCommand: () => Optional<Command>, options?: Options): void;
    private init;
    private hasFreeProcess;
    private freeProcess;
    private runInProcess;
}
export default ProcessManager;
//# sourceMappingURL=ProcessManager.d.ts.map