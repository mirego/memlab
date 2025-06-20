/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnyOptions, Cookies, IE2EScenarioSynthesizer, IE2EScenarioVisitPlan, Nullable } from '@memlab/core';
import type { MemLabConfig } from '@memlab/core';
type TestPlanOptions = {
    config?: MemLabConfig;
};
export declare class TestPlanner {
    private synthesizers;
    private visitPlan;
    private cookies;
    private scenario;
    private origin;
    private synthesizer;
    private config;
    constructor(options?: TestPlanOptions);
    private initSynthesizers;
    getVisitPlan(): IE2EScenarioVisitPlan;
    getCookies(): Cookies;
    getOrigin(): Nullable<string>;
    getSynthesizer(options?: AnyOptions): IE2EScenarioSynthesizer;
    preloadSynthesizer(): IE2EScenarioSynthesizer;
    private init;
    private prepareSynthesizer;
    private generateVisitPlan;
    loadCookies(visitPlan: IE2EScenarioVisitPlan, synthesizer: IE2EScenarioSynthesizer): Cookies;
    private populateDomainInCookiesFromScenario;
    private populateDomainInCookies;
    private setSnapshotMode;
    private assignSnapshotIds;
    getAppNames(): string[];
    getTargetNames(appName: string, options?: AnyOptions): string[];
    getAllTargets(options?: AnyOptions): {
        app: string;
        interaction: string;
    }[];
}
declare const _default: TestPlanner;
export default _default;
//# sourceMappingURL=TestPlanner.d.ts.map