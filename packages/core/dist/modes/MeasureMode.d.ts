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
import type { Page } from 'puppeteer';
import type { E2EStepInfo, IE2EScenarioVisitPlan } from '../lib/Types';
declare class MeasureMode extends BaseMode {
    shouldTakeScreenShot(): boolean;
    shouldTakeHeapSnapshot(): boolean;
    shouldExtraWaitForTarget(): boolean;
    shouldExtraWaitForFinal(): boolean;
    shouldRunExtraTargetOperations(): boolean;
    getAdditionalMetrics(page: Page): Promise<E2EStepInfo['metrics']>;
    postProcessData(visitPlan: IE2EScenarioVisitPlan): void;
}
export default MeasureMode;
//# sourceMappingURL=MeasureMode.d.ts.map