"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const E2EUtils_1 = __importDefault(require("./lib/E2EUtils"));
const core_1 = require("@memlab/core");
const lens_1 = require("@memlab/lens");
const InteractionUtils_1 = __importDefault(require("./lib/operations/InteractionUtils"));
const TestPlanner_1 = __importDefault(require("./lib/operations/TestPlanner"));
const NetworkManager_1 = __importDefault(require("./NetworkManager"));
const { logMetaData, setPermissions, logTabProgress, maybeWaitForConsoleInput, applyAsyncWithRetry, compareURL, waitExtraForTab, checkURL, injectPageReloadChecker, checkPageReload, dispatchOperation, clearConsole, getNavigationHistoryLength, checkLastSnapshotChunk, getURLParameter, } = E2EUtils_1.default;
class E2EInteractionManager {
    constructor(page, browser) {
        this.pageHistoryLength = [];
        this.evalFuncAfterInitLoad = null;
        this.page = page;
        this.browser = browser;
        this.networkManager = new NetworkManager_1.default(page);
    }
    getChosenCDPSession() {
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.isAnalyzingMainThread) {
                return this.getMainThreadCDPSession();
            }
            // get web worker thread target
            const cdpSession = yield this.selectCDPSession(target => {
                var _a, _b;
                const t = target;
                const isWorker = ((_a = t._targetInfo) === null || _a === void 0 ? void 0 : _a.type) === 'worker';
                let isTitleMatch = true;
                if (core_1.config.targetWorkerTitle != null) {
                    isTitleMatch = ((_b = t._targetInfo) === null || _b === void 0 ? void 0 : _b.title) === core_1.config.targetWorkerTitle;
                }
                return isWorker && isTitleMatch;
            });
            if (cdpSession == null) {
                throw core_1.utils.haltOrThrow('web worker or main thread heap under analysis not found');
            }
            return cdpSession;
        });
    }
    getMainThreadCDPSession() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mainThreadCdpsession) {
                this.mainThreadCdpsession = yield this.page.target().createCDPSession();
                this.networkManager.setCDPSession(this.mainThreadCdpsession);
            }
            return this.mainThreadCdpsession;
        });
    }
    selectCDPSession(predicate) {
        return __awaiter(this, void 0, void 0, function* () {
            const targets = yield this.browser.targets();
            const target = targets.find(predicate);
            if (!target) {
                return null;
            }
            return yield target.createCDPSession();
        });
    }
    clearCDPSession() {
        this.mainThreadCdpsession = null;
    }
    setEvalFuncAfterInitLoad(func) {
        this.evalFuncAfterInitLoad = func;
    }
    enableLeakOutlineDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.displayLeakOutlines) {
                core_1.info.lowLevel('Enabling leak outlines display...');
                // import the code from memlens
                const leakVisualizationScript = (0, lens_1.getBundleContent)();
                yield this.page.evaluate((script) => {
                    eval(script);
                }, leakVisualizationScript);
            }
        });
    }
    initialLoad(page, url, opArgs = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.verbose) {
                core_1.info.lowLevel(`loading: ${url}`);
            }
            core_1.info.overwrite('Connecting to web server...');
            yield page.goto(url, {
                timeout: core_1.config.initialPageLoadTimeout,
                waitUntil: 'load',
            });
            // wait extra 10s in continuous test env for the initial page load
            if (core_1.config.isContinuousTest) {
                yield InteractionUtils_1.default.waitFor(10000);
            }
            if (this.evalFuncAfterInitLoad) {
                yield page.evaluate(this.evalFuncAfterInitLoad);
            }
            yield InteractionUtils_1.default.waitUntilLoaded(page, opArgs);
            yield this.enableLeakOutlineDisplay();
        });
    }
    beforeInteractions() {
        return __awaiter(this, void 0, void 0, function* () {
            // tracking main thread for network interception
            const session = yield this.getMainThreadCDPSession();
            if (core_1.config.interceptScript) {
                this.networkManager.setCDPSession(session);
                yield this.networkManager.interceptScript();
            }
            if (core_1.config.verbose) {
                const browserVersion = yield this.page.browser().version();
                core_1.info.lowLevel(`Browser version: ${browserVersion}`);
                const nodeVersion = process.version;
                core_1.info.lowLevel(`Node.js version: ${nodeVersion}`);
            }
        });
    }
    visitAndGetSnapshots(options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const visitPlan = options.testPlanner
                ? options.testPlanner.getVisitPlan()
                : TestPlanner_1.default.getVisitPlan();
            const runConfig = (_a = options.config) !== null && _a !== void 0 ? _a : core_1.config;
            // notify the running mode the current visit plan
            runConfig.runningMode.beforeRunning(visitPlan);
            logMetaData(visitPlan);
            yield setPermissions(this.page, TestPlanner_1.default.getOrigin());
            yield this.beforeInteractions();
            const baseURL = core_1.utils.normalizeBaseUrl(visitPlan.baseURL);
            if (visitPlan.pageSetup) {
                yield visitPlan.pageSetup(this.page);
            }
            yield this.startTrackingHeap();
            for (let i = 0; i < visitPlan.tabsOrder.length; i++) {
                core_1.info.beginSection(`step-${i}`);
                if (runConfig.verbose) {
                    core_1.info.lowLevel(new Date().toString());
                }
                const tab = visitPlan.tabsOrder[i];
                const subUrl = tab.url.substring(tab.url.startsWith('/') ? 1 : 0);
                const url = `${baseURL}${subUrl}` + getURLParameter(tab, visitPlan);
                logTabProgress(i, visitPlan);
                yield maybeWaitForConsoleInput(i + 1);
                const opArgs = {
                    isPageLoaded: visitPlan.isPageLoaded,
                    scenario: visitPlan.scenario,
                };
                yield applyAsyncWithRetry(this.getPageStatistics, this, [url, tab, opArgs], {
                    retry: runConfig.interactionFailRetry,
                });
                // dump browser console output in a readable file
                core_1.browserInfo.dump();
                core_1.info.nextLine();
                core_1.info.endSection(`step-${i}`);
            }
            // show progress on console
            core_1.info.topLevel(core_1.serializer.summarizeTabsOrder(visitPlan.tabsOrder, {
                color: true,
                progress: visitPlan.tabsOrder.length,
            }) + '\n');
            // serialize the meta data again (with more runtime and browser info)
            logMetaData(visitPlan, { final: true });
            // dump browser console output in a readable file
            core_1.browserInfo.dump();
        });
    }
    warmupInPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const visitPlan = TestPlanner_1.default.getVisitPlan();
            const baseURL = visitPlan.baseURL;
            const len = visitPlan.tabsOrder.length;
            const visited = Object.create(null);
            // randomize order
            const tabs = core_1.utils.shuffleArray(Array.from(visitPlan.tabsOrder));
            const multipler = core_1.config.warmupRepeat;
            for (let i = 0; i < len * multipler; ++i) {
                const tab = tabs[i % len];
                visited[tab.name] |= 0;
                if (++visited[tab.name] > multipler) {
                    continue;
                }
                // print current progress
                if (core_1.config.isContinuousTest || core_1.config.verbose) {
                    let progress = `[${i + 1}/${len * multipler}]`;
                    progress = `${progress}: warming up web server (${tab.name})...`;
                    core_1.info.lowLevel(progress);
                }
                else {
                    core_1.info.progress(i, len * multipler, { message: 'Warming up web server' });
                }
                // print url
                const urlParams = getURLParameter(tab, visitPlan);
                const url = `${baseURL}${tab.url}${urlParams}`;
                if (core_1.config.verbose) {
                    core_1.info.lowLevel(`url: ${url}`);
                }
                // warm up page
                yield this.visitPage(url, {
                    mute: true,
                    isPageLoaded: visitPlan.isPageLoaded,
                });
                compareURL(this.page, url);
            }
        });
    }
    visitPage(url, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.page.goto(url, {
                    timeout: core_1.config.warmupPageLoadTimeout,
                    waitUntil: 'domcontentloaded',
                });
                yield InteractionUtils_1.default.waitUntilLoaded(this.page, options);
            }
            catch (ex) {
                core_1.info.overwrite(core_1.utils.getError(ex).message);
            }
        });
    }
    getPageStatistics(url, tabInfo, opArgs = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.verbose) {
                core_1.info.lowLevel('url: ' + url);
            }
            // visit the URL of the first step
            if (tabInfo.idx === 1) {
                const beforeInitLoad = (_a = opArgs.scenario) === null || _a === void 0 ? void 0 : _a.beforeInitialPageLoad;
                if (beforeInitLoad) {
                    yield beforeInitLoad(this.page);
                }
                yield applyAsyncWithRetry(this.initialLoad, this, [this.page, url, opArgs], {
                    retry: core_1.config.initialLoadFailRetry,
                    delayBeforeRetry: 3000,
                });
                // only use the interactions for steps other than the first step
            }
            else if (tabInfo.interactions) {
                yield this.interactWithPage(this.page, tabInfo.interactions, opArgs);
            }
            if (tabInfo.type === 'final' || tabInfo.type === 'target') {
                yield waitExtraForTab(tabInfo);
            }
            checkURL(this.page, url);
            // inject marker, which checks if the page is reloaded
            if (tabInfo.idx === 1) {
                // call setup callback if the scenario has one
                const setup = (_b = opArgs.scenario) === null || _b === void 0 ? void 0 : _b.setup;
                if (setup) {
                    yield setup(this.page);
                }
                yield injectPageReloadChecker(this.page);
            }
            else {
                yield checkPageReload(this.page);
            }
            yield this.fullGC(tabInfo);
            // collect metrics
            yield this.collectMetrics(tabInfo);
            // take screenshot
            const screenShotIdx = tabInfo.screenshot ? tabInfo.idx : 0;
            if (core_1.config.runningMode.shouldTakeScreenShot(tabInfo) && screenShotIdx > 0) {
                yield InteractionUtils_1.default.screenshot(this.page, screenShotIdx);
            }
            // take heap snapshot
            const snapshotIdx = tabInfo.snapshot ? tabInfo.idx : 0;
            if (core_1.config.runningMode.shouldTakeHeapSnapshot(tabInfo) && snapshotIdx > 0) {
                const snapshotFile = path_1.default.join(core_1.config.curDataDir, `s${snapshotIdx}.heapsnapshot`);
                yield this.saveHeapSnapshotToFile(snapshotFile);
            }
            if (tabInfo.postInteractions) {
                yield this.interactWithPage(this.page, tabInfo.postInteractions, opArgs);
            }
        });
    }
    interactWithPage(page, operations, opArgs = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = Object.assign(Object.assign({}, opArgs), { pageHistoryLength: this.pageHistoryLength });
            if (typeof operations === 'function') {
                yield operations(page, args);
                yield InteractionUtils_1.default.waitUntilLoaded(page, args);
            }
            else if (Array.isArray(operations)) {
                for (const op of operations) {
                    yield this.interactWithPage(page, op, args);
                }
            }
            else if (operations.kind) {
                yield dispatchOperation(page, operations, args);
            }
            else {
                core_1.utils.throwError(new Error('unknown operation'));
            }
        });
    }
    startTrackingHeap() {
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.verbose) {
                core_1.info.lowLevel('Start tracking JS heap');
            }
            const session = yield this.getMainThreadCDPSession();
            yield session.send('HeapProfiler.enable');
        });
    }
    writeSnapshotFileFromCDPSession(file, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeStream = fs_1.default.createWriteStream(file, { encoding: 'UTF-8' });
            let lastChunk = '';
            const dataHandler = data => {
                writeStream.write(data.chunk);
                lastChunk = data.chunk;
            };
            const progressHandler = data => {
                const percent = ((100 * data.done) / data.total) | 0;
                if (!core_1.config.isContinuousTest) {
                    core_1.info.overwrite(`heap snapshot ${percent}% complete`);
                }
            };
            session.on('HeapProfiler.addHeapSnapshotChunk', dataHandler);
            session.on('HeapProfiler.reportHeapSnapshotProgress', progressHandler);
            // start taking heap snapshot
            yield session.send('HeapProfiler.takeHeapSnapshot', {
                reportProgress: true,
                captureNumericValue: true,
            });
            checkLastSnapshotChunk(lastChunk);
            this.removeListener(session, 'HeapProfiler.addHeapSnapshotChunk', dataHandler);
            this.removeListener(session, 'HeapProfiler.reportHeapSnapshotProgress', progressHandler);
            writeStream.end();
        });
    }
    // this implement may remove all dataHandler of the specified eventType
    removeListener(session, eventType, dataHandler) {
        if (typeof session.removeListener === 'function') {
            session.removeListener(eventType, dataHandler);
            return;
        }
        if (typeof session.removeAllListeners === 'function') {
            session.removeAllListeners(eventType);
            return;
        }
    }
    saveHeapSnapshotToFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            core_1.info.beginSection('heap snapshot');
            const start = Date.now();
            const session = yield this.getChosenCDPSession();
            yield this.writeSnapshotFileFromCDPSession(file, session);
            const spanMs = Date.now() - start;
            if (core_1.config.verbose) {
                core_1.info.lowLevel(`duration: ${core_1.utils.getReadableTime(spanMs)}`);
            }
            core_1.info.overwrite('snapshot saved to disk');
            core_1.info.endSection('heap snapshot');
        });
    }
    fullGC(tabInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!core_1.config.runningMode.shouldGC(tabInfo)) {
                return;
            }
            if (core_1.config.clearConsole) {
                yield clearConsole(this.page);
                core_1.info.overwrite('running a full GC (clear console)...');
            }
            else {
                core_1.info.overwrite('running a full GC...');
            }
            // force GC 6 times to release feedback_cells
            yield this.forceMainThreadGC(6);
        });
    }
    forceMainThreadGC(repeat = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getMainThreadCDPSession();
            for (let i = 0; i < repeat; i++) {
                yield client.send('HeapProfiler.collectGarbage');
                // wait for a while and let GC do the job
                yield InteractionUtils_1.default.waitFor(200);
            }
            yield InteractionUtils_1.default.waitFor(core_1.config.waitAfterGC);
        });
    }
    collectMetrics(tabInfo) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // collect navigation history info
            const historyLength = yield getNavigationHistoryLength(this.page);
            this.pageHistoryLength.push(historyLength);
            if (!core_1.config.runningMode.shouldGetMetrics(tabInfo)) {
                return;
            }
            yield this.forceMainThreadGC();
            // collect heap size
            const builtInMetrics = yield this.page.metrics();
            const size = core_1.utils.getReadableBytes(builtInMetrics.JSHeapUsedSize);
            core_1.info.midLevel(`Heap size: ${size}`);
            tabInfo.JSHeapUsedSize = (_a = builtInMetrics.JSHeapUsedSize) !== null && _a !== void 0 ? _a : 0;
            // collect additional metrics
            const metrics = yield core_1.config.runningMode.getAdditionalMetrics(this.page, tabInfo);
            for (const key of Object.keys(metrics)) {
                if (Object.prototype.hasOwnProperty.call(tabInfo, key)) {
                    core_1.info.warning(`overwriting metrics: ${key}`);
                }
            }
            tabInfo.metrics = metrics;
        });
    }
}
exports.default = E2EInteractionManager;
