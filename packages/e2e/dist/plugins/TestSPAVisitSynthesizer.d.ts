/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnyOptions, CheckPageLoadCallback, IE2EScenarioVisitPlan, IE2EStepBasic } from '@memlab/core';
import BaseSynthesizer from '../BaseSynthesizer';
export default class TestSPAVisitSynthesizer extends BaseSynthesizer {
    getBaseURL(_options?: AnyOptions): string;
    getAppName(): string;
    getNumberOfWarmup(): number;
    getCookieFile(): string | null;
    getDomain(): string;
    getAvailableSteps(): IE2EStepBasic[];
    getDefaultStartStepName(): string;
    getAvailableVisitPlans(): IE2EScenarioVisitPlan[];
    getPageLoadChecker(): CheckPageLoadCallback;
}
//# sourceMappingURL=TestSPAVisitSynthesizer.d.ts.map