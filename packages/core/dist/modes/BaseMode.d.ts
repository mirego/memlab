/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { E2EStepInfo, Config, IE2EScenarioVisitPlan, Optional } from '../lib/Types';
import type { Page } from 'puppeteer';
declare class BaseMode {
    protected config: Config;
    protected visitPlan: Optional<IE2EScenarioVisitPlan>;
    setConfig(config: Config): void;
    beforeRunning(visitPlan: IE2EScenarioVisitPlan): void;
    shouldGC(_tabInfo?: E2EStepInfo): boolean;
    shouldScroll(_tabInfo?: E2EStepInfo): boolean;
    shouldGetMetrics(_tabInfo?: E2EStepInfo): boolean;
    shouldUseConciseConsole(_tabInfo?: E2EStepInfo): boolean;
    shouldTakeScreenShot(_tabInfo?: E2EStepInfo): boolean;
    shouldTakeHeapSnapshot(_tabInfo?: E2EStepInfo): boolean;
    shouldExtraWaitForTarget(_tabInfo?: E2EStepInfo): boolean;
    shouldExtraWaitForFinal(_tabInfo?: E2EStepInfo): boolean;
    shouldRunExtraTargetOperations(_tabInfo?: E2EStepInfo): boolean;
    getAdditionalMetrics(_page: Page, _tabInfo?: E2EStepInfo): Promise<E2EStepInfo['metrics']>;
    postProcessData(_visitPlan: IE2EScenarioVisitPlan): void;
}
export default BaseMode;
//# sourceMappingURL=BaseMode.d.ts.map