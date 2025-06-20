/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { AnyOptions, AnyValue, E2EOperation, E2EStepInfo, IE2EScenarioVisitPlan, IScenario, Nullable, OperationArgs } from '@memlab/core';
import type { CDPSession, Page } from 'puppeteer';
type ExceptionHandler = (ex: Error) => void;
declare function checkLastSnapshotChunk(chunk: string): void;
declare function getURLParameter(tab: E2EStepInfo, visitPlan: IE2EScenarioVisitPlan): string;
declare function compareURL(page: Page, url: string): void;
declare function logTabProgress(i: number, visitPlan: IE2EScenarioVisitPlan): void;
declare function serializeVisitPlan(visitPlan: IE2EScenarioVisitPlan): void;
declare function logMetaData(visitPlan: IE2EScenarioVisitPlan, opt?: AnyOptions & {
    final?: boolean;
}): void;
declare function setPermissions(page: Page, origin: Nullable<string>): Promise<void>;
declare function checkURL(page: Page, intendedURL: string): void;
declare function injectPageReloadChecker(page: Page): Promise<void>;
declare function checkPageReload(page: Page): Promise<void>;
declare function maybeWaitForConsoleInput(stepId: number): Promise<void>;
declare function applyAsyncWithGuard(f: (...args: AnyValue[]) => Promise<AnyValue>, self: AnyValue, args: AnyValue[], exceptionHandler?: ExceptionHandler): Promise<AnyValue>;
declare function applyAsyncWithRetry(f: (...args: AnyValue[]) => Promise<AnyValue>, self: AnyValue, args: AnyValue[], options?: AnyOptions & {
    retry?: number;
    delayBeforeRetry?: number;
}): Promise<void>;
declare function clearConsole(page: Page): Promise<void>;
declare function dispatchOperation(page: Page, operation: E2EOperation, opArgs: OperationArgs): Promise<void>;
declare function waitExtraForTab(tabInfo: E2EStepInfo): Promise<void>;
declare function getNavigationHistoryLength(page: Page): Promise<number>;
declare function startTrackingHeapAllocation(page: Page, file: string): Promise<CDPSession>;
declare function getScenarioAppName(scenario?: Nullable<IScenario>): string;
declare const _default: {
    applyAsyncWithGuard: typeof applyAsyncWithGuard;
    applyAsyncWithRetry: typeof applyAsyncWithRetry;
    checkLastSnapshotChunk: typeof checkLastSnapshotChunk;
    checkPageReload: typeof checkPageReload;
    checkURL: typeof checkURL;
    clearConsole: typeof clearConsole;
    compareURL: typeof compareURL;
    dispatchOperation: typeof dispatchOperation;
    getNavigationHistoryLength: typeof getNavigationHistoryLength;
    getScenarioAppName: typeof getScenarioAppName;
    getURLParameter: typeof getURLParameter;
    injectPageReloadChecker: typeof injectPageReloadChecker;
    logMetaData: typeof logMetaData;
    logTabProgress: typeof logTabProgress;
    maybeWaitForConsoleInput: typeof maybeWaitForConsoleInput;
    serializeVisitPlan: typeof serializeVisitPlan;
    setPermissions: typeof setPermissions;
    startTrackingHeapAllocation: typeof startTrackingHeapAllocation;
    waitExtraForTab: typeof waitExtraForTab;
};
export default _default;
//# sourceMappingURL=E2EUtils.d.ts.map