/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import BaseMode from './BaseMode';
declare class InteractionTestMode extends BaseMode {
    shouldGC(): boolean;
    shouldScroll(): boolean;
    shouldGetMetrics(): boolean;
    shouldUseConciseConsole(): boolean;
    shouldTakeScreenShot(): boolean;
    shouldTakeHeapSnapshot(): boolean;
    shouldExtraWaitForTarget(): boolean;
    shouldExtraWaitForFinal(): boolean;
    shouldRunExtraTargetOperations(): boolean;
}
export default InteractionTestMode;
//# sourceMappingURL=InteractionTestMode.d.ts.map