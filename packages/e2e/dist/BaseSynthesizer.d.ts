/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @lightSyntaxTransform
 * @oncall memory_lab
 */
import type { AnyOptions, Config, E2EOperation, E2EStepInfo, IE2EScenarioVisitPlan, E2ESynthesizerOptions, IScenario, IE2EStepBasic, IE2EScenarioSynthesizer, CheckPageLoadCallback, Nullable, PageSetupCallback } from '@memlab/core';
declare class BaseSynthesizer implements IE2EScenarioSynthesizer {
    protected config: Config;
    protected steps: Map<string, IE2EStepBasic>;
    private _repeatIntermediate;
    protected plans: Map<string, IE2EScenarioVisitPlan>;
    constructor(config: Config);
    private injectBuiltInSteps;
    private repeatIntermediate;
    protected init(): void;
    protected postInit(): void;
    getAppName(): string;
    getOrigin(): Nullable<string>;
    getDomain(): string;
    getDomainPrefixes(): string[];
    getCookieFile(_visitPlan: IE2EScenarioVisitPlan): string | null;
    getAvailableSteps(): IE2EStepBasic[];
    getNodeNameBlocklist(): string[];
    getEdgeNameBlocklist(): string[];
    getDefaultStartStepName(): string;
    injectPlan(stepName: string, scenario: IScenario): void;
    synthesisForTarget(stepName: string): IE2EScenarioVisitPlan;
    getAvailableVisitPlans(): IE2EScenarioVisitPlan[];
    getAvailableTargetNames(opt?: AnyOptions & {
        filterCb?: (node: IE2EScenarioVisitPlan) => boolean;
    }): string[];
    getNumberOfWarmup(): number;
    getBaseURL(_options?: AnyOptions): string;
    private getNormalizedBaseURL;
    getURLParameters(_options?: AnyOptions): string;
    getDevice(): string;
    getExtraOperationsForStep(_stepInfo: E2EStepInfo): E2EOperation[];
    getPageLoadChecker(): CheckPageLoadCallback;
    getPageSetupCallback(): PageSetupCallback;
    synthesis(baseline: string, target: string, intermediates: string[], options?: E2ESynthesizerOptions): IE2EScenarioVisitPlan;
    private getActualNumberOfWarmup;
    private synthesisInitPart;
    private synthesisFinalPart;
    private synthesisRepeat;
    private synthesisStandard;
    private processStepUrl;
    private synthesisForScenario;
    private synthesisSimple;
    private synthesisInitialPageLoad;
    private getActionFromStep;
    private getAction;
    protected shouldTakeSnapshot(option: AnyOptions & {
        type?: string;
    }): boolean;
    protected shouldTakeScreenshot(_option: AnyOptions): boolean;
    private fillInInfo;
}
export default BaseSynthesizer;
//# sourceMappingURL=BaseSynthesizer.d.ts.map