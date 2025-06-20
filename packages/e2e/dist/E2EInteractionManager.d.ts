/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Browser, CDPSession, Page, Target } from 'puppeteer';
import type { AnyFunction, Nullable, OperationArgs, MemLabConfig } from '@memlab/core';
import { TestPlanner } from './lib/operations/TestPlanner';
type PageInteractOptions = {
    config?: MemLabConfig;
    testPlanner?: TestPlanner;
};
export default class E2EInteractionManager {
    private mainThreadCdpsession;
    private page;
    private browser;
    private pageHistoryLength;
    private evalFuncAfterInitLoad;
    private networkManager;
    constructor(page: Page, browser: Browser);
    getChosenCDPSession(): Promise<CDPSession>;
    getMainThreadCDPSession(): Promise<CDPSession>;
    selectCDPSession(predicate: (t: Target) => boolean): Promise<Nullable<CDPSession>>;
    clearCDPSession(): void;
    setEvalFuncAfterInitLoad(func: AnyFunction | null): void;
    private enableLeakOutlineDisplay;
    protected initialLoad(page: Page, url: string, opArgs?: OperationArgs): Promise<void>;
    private beforeInteractions;
    visitAndGetSnapshots(options?: PageInteractOptions): Promise<void>;
    warmupInPage(): Promise<void>;
    private visitPage;
    private getPageStatistics;
    private interactWithPage;
    private startTrackingHeap;
    private writeSnapshotFileFromCDPSession;
    private removeListener;
    private saveHeapSnapshotToFile;
    private fullGC;
    private forceMainThreadGC;
    private collectMetrics;
}
export {};
//# sourceMappingURL=E2EInteractionManager.d.ts.map