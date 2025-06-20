/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Permission } from 'puppeteer';
import type { FileOption, IClusterStrategy, IRunningMode, IScenario, IHeapConfig, Nullable, Optional, QuickExperiment, ILeakFilter, IPackageInfo, PuppeteerConfig } from './Types';
interface Device {
    name: string;
    userAgent: string;
    viewport: {
        width: number;
        height: number;
        deviceScaleFactor: number;
        isMobile: boolean;
        hasTouch: boolean;
        isLandscape: boolean;
    };
}
type ConfigOption = {
    workDir?: string;
};
/** @internal */
export declare enum TraceObjectMode {
    Default = 1,
    SelectedJSObjects = 2
}
/** @internal */
export declare enum OutputFormat {
    Text = 1,
    Json = 2
}
/** @internal */
export declare enum ErrorHandling {
    Halt = 1,
    Throw = 2
}
/** @internal */
export type MuteConfig = {
    muteError?: boolean;
    muteWarning?: boolean;
    muteInfo?: boolean;
    muteSuccess?: boolean;
    muteLog?: boolean;
    muteTable?: boolean;
    muteTrace?: boolean;
    muteTopLevel?: boolean;
    muteHighLevel?: boolean;
    muteMidLevel?: boolean;
    muteLowLevel?: boolean;
    muteOutput?: boolean;
};
/** @internal */
export declare class MemLabConfig {
    _reportLeaksInTimers: boolean;
    _deviceManualOverridden: boolean;
    _timerNodes: string[];
    _timerEdges: string[];
    _isFullRun: boolean;
    _scenario: Optional<IScenario>;
    _isHeadfulBrowser: boolean;
    _disableWebSecurity: boolean;
    _browser: string;
    _chromeUserDataDir: string;
    snapshotHasDetachedness: boolean;
    specifiedEngine: boolean;
    verbose: boolean;
    jsEngine: string;
    targetApp: string;
    targetTab: string;
    analysisMode: string;
    focusFiberNodeId: number;
    isFB: boolean;
    machineSupportsXVFB: boolean;
    useXVFB: boolean;
    workDir: string;
    browserDir: string;
    dataBaseDir: string;
    curDataDir: string;
    webSourceDir: string;
    debugDataDir: string;
    runMetaFile: string;
    snapshotSequenceFile: string;
    exploreResultFile: string;
    singleReportSummary: string;
    browserInfoSummary: string;
    unboundObjectCSV: string;
    viewJsonFile: string;
    reportBaseDir: string;
    reportDistDir: string;
    reportOutDir: string;
    previewReportDir: string;
    inputDataDir: string;
    persistentDataDir: string;
    consoleLogFile: string;
    cookieSettingFile: string;
    traceClusterFile: string;
    traceClusterOutDir: string;
    traceJsonOutDir: string;
    metricsOutDir: string;
    heapAnalysisLogDir: string;
    reportScreenshotFile: string;
    newUniqueClusterDir: string;
    staleUniqueClusterDir: string;
    currentUniqueClusterDir: string;
    allClusterSummaryFile: string;
    dataBuilderDataDir: string;
    unclassifiedClusterDir: string;
    externalCookiesFile: Optional<string>;
    extraRunInfoMap: Map<string, string>;
    heapConfig: Optional<IHeapConfig>;
    puppeteerConfig: PuppeteerConfig;
    openDevtoolsConsole: boolean;
    emulateDevice: Nullable<Device>;
    addEnableGK: Set<string>;
    addDisableGK: Set<string>;
    qes: QuickExperiment[];
    isOndemand: boolean;
    useExternalSnapshot: boolean;
    externalRunMetaTemplateFile: string;
    externalSnapshotVisitOrderFile: string;
    externalSnapshotDir: Nullable<string>;
    externalSnapshotFilePaths: string[];
    runningMode: IRunningMode;
    dumpWebConsole: boolean;
    clearConsole: boolean;
    traverseDevToolsConsole: boolean;
    skipWarmup: boolean;
    skipSnapshot: boolean;
    skipScreenshot: boolean;
    skipScroll: boolean;
    skipExtraOps: boolean;
    skipGC: boolean;
    isContinuousTest: boolean;
    isTest: boolean;
    isLocalPuppeteer: boolean;
    isManualDebug: boolean;
    warmupRepeat: number;
    delayWhenNoPageLoadCheck: number;
    repeatIntermediateTabs: number;
    interactionFailRetry: number;
    initialLoadFailRetry: number;
    presenceCheckTimeout: number;
    delayBeforeExitUponException: number;
    windowWidth: number;
    windowHeight: number;
    disableScroll: boolean;
    scrollRepeat: number;
    extraWaitingForTarget: number;
    extraWaitingForFinal: number;
    defaultAfterClickDelay: number;
    warmupPageLoadTimeout: number;
    initialPageLoadTimeout: number;
    waitAfterGC: number;
    waitAfterPageLoad: number;
    waitAfterOperation: number;
    waitAfterScrolling: number;
    waitAfterTyping: number;
    waitForNetworkInDefaultScenario: number;
    stressTestRepeat: number;
    avoidLeakWithoutDetachedElements: boolean;
    hideBrowserLeak: boolean;
    chaseWeakMapEdge: boolean;
    detectFiberNodeLeak: boolean;
    grantedPermissions: Permission[];
    monotonicUnboundGrowthOnly: boolean;
    unboundSizeThreshold: number;
    resetGK: boolean;
    defaultUserAgent: Nullable<string>;
    dumpNodeInfo: boolean;
    maxSearchSteps: number;
    maxSearchReferences: number;
    nodeToShowMoreInfo: Set<string>;
    ignoreDevToolsConsoleLeak: boolean;
    ignoreInternalNode: boolean;
    nodeNameBlockList: Set<string>;
    edgeNameBlockList: Set<string>;
    nodeNameGreyList: Set<string>;
    edgeNameGreyList: Set<string>;
    localBrowserPort: number;
    ignoreTypesInContinuousTest: Set<string>;
    ignoreAppsInContinuousTest: Set<string>;
    URLParamLengthLimit: number;
    edgeIgnoreSetInShape: Set<string | number>;
    nodeIgnoreSetInShape: Set<string>;
    oversizeObjectAsLeak: boolean;
    oversizeThreshold: number;
    traceAllObjectsMode: TraceObjectMode;
    clusterRetainedSizeThreshold: number;
    externalLeakFilter?: Optional<ILeakFilter>;
    monoRepoDir: string;
    muteConsole: boolean;
    muteConfig?: MuteConfig;
    includeObjectInfoInTraceReturnChain: boolean;
    logUnclassifiedClusters: boolean;
    errorHandling: ErrorHandling;
    clusterStrategy: Optional<IClusterStrategy>;
    packageInfo: IPackageInfo[];
    isMLClustering: boolean;
    mlClusteringLinkageMaxDistance: number;
    mlMaxDF: number;
    isSequentialClustering: boolean;
    isMultiIterationSeqClustering: boolean;
    seqClusteringSplitCount: number;
    multiIterSeqClusteringIteration: number;
    multiIterSeqClusteringSampleSize: number;
    seqClusteringIsRandomChunks: boolean;
    instrumentJS: boolean;
    interceptScript: boolean;
    isAnalyzingMainThread: boolean;
    targetWorkerTitle: Nullable<string>;
    noReCluster: boolean;
    maxSamplesForClustering: number;
    filterTraceByName: Nullable<string>;
    skipBrowserCloseWait: boolean;
    simplifyCodeSerialization: boolean;
    heapParserDictFastStoreSize: number;
    outputFormat: OutputFormat;
    displayLeakOutlines: boolean;
    maxNumOfEdgesToJSONifyPerNode: number;
    maxLevelsOfTraceToJSONify: number;
    defaultPrioritizedHTMLTagAttributes: Set<string>;
    constructor(options?: ConfigOption);
    private initInternalConfigs;
    private init;
    getAdditionalConfigInContinuousTest(_app: string, _interaction: string): string[];
    private static instance;
    static getInstance(): MemLabConfig;
    static resetConfigWithTransientDir(): MemLabConfig;
    private haltOrThrow;
    setTarget(app: string, tab: string): void;
    set userDataDir(chromeUserDataDir: string);
    get userDataDir(): string;
    set scenario(scenario: Optional<IScenario>);
    get scenario(): Optional<IScenario>;
    set isFullRun(isFull: boolean);
    get isFullRun(): boolean;
    set browser(v: string);
    get browser(): string;
    set isHeadfulBrowser(isHeadful: boolean);
    get isHeadfulBrowser(): boolean;
    set disableWebSecurity(disable: boolean);
    get disableWebSecurity(): boolean;
    get browserBinaryPath(): string;
    set defaultFileManagerOption(fileOption: FileOption);
    get defaultFileManagerOption(): FileOption;
    set reportLeaksInTimers(shouldReport: boolean);
    get reportLeaksInTimers(): boolean;
    setDevice(deviceName: string, options?: {
        manualOverride?: boolean;
    }): void;
    setRunInfo(key: string, value: string): void;
    private removeFromSet;
    private addToSet;
    enableXvfb(display: string): void;
    disableXvfb(): void;
}
/** @internal */
declare const config: MemLabConfig;
/** @internal */
export default config;
//# sourceMappingURL=Config.d.ts.map