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
exports.testInBrowser = exports.warmup = exports.analyze = exports.findLeaksBySnapshotFilePaths = exports.findLeaks = exports.takeSnapshots = exports.run = exports.warmupAndTakeSnapshots = void 0;
const core_1 = require("@memlab/core");
const e2e_1 = require("@memlab/e2e");
const APIUtils_1 = __importDefault(require("./lib/APIUtils"));
const BrowserInteractionResultReader_1 = __importDefault(require("./result-reader/BrowserInteractionResultReader"));
const APIStateManager_1 = __importDefault(require("./state/APIStateManager"));
/**
 * This API warms up web server, runs E2E interaction, and takes heap snapshots.
 * This is equivalent to running `memlab warmup-and-snapshot` in CLI.
 * This is also equivalent to warm up and call {@link takeSnapshots}.
 *
 * @param options configure browser interaction run
 * @returns browser interaction results
 * * **Examples**:
 * ```javascript
 * const {warmupAndTakeSnapshots} = require('@memlab/api');
 *
 * (async function () {
 *   const scenario = {
 *     url: () => 'https://www.facebook.com',
 *   };
 *   const result = await warmupAndTakeSnapshots({scenario});
 * })();
 * ```
 */
function warmupAndTakeSnapshots(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = getConfigFromRunOptions(options);
        const state = APIStateManager_1.default.getAndUpdateState(config, options);
        const testPlanner = new e2e_1.TestPlanner({ config });
        const { evalInBrowserAfterInitLoad } = options;
        if (!options.skipWarmup) {
            yield warmup({ testPlanner, config, evalInBrowserAfterInitLoad });
        }
        yield testInBrowser({ testPlanner, config, evalInBrowserAfterInitLoad });
        const ret = BrowserInteractionResultReader_1.default.from(config.workDir);
        APIStateManager_1.default.restoreState(config, state);
        return ret;
    });
}
exports.warmupAndTakeSnapshots = warmupAndTakeSnapshots;
/**
 * This API runs browser interaction and find memory leaks triggered in browser
 * This is equivalent to running `memlab run` in CLI.
 * This is also equivalent to warm up, and call {@link takeSnapshots}
 * and {@link findLeaks}.
 *
 * @param runOptions configure browser interaction run
 * @returns memory leaks detected and a utility reading browser
 * interaction results from disk
 * * **Examples**:
 * ```javascript
 * const {run} = require('@memlab/api');
 *
 * (async function () {
 *   const scenario = {
 *     url: () => 'https://www.facebook.com',
 *   };
 *   const {leaks} = await run({scenario});
 * })();
 * ```
 */
function run(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = getConfigFromRunOptions(options);
        const state = APIStateManager_1.default.getAndUpdateState(config, options);
        const testPlanner = new e2e_1.TestPlanner({ config });
        const { evalInBrowserAfterInitLoad } = options;
        if (!options.skipWarmup) {
            yield warmup({ testPlanner, config, evalInBrowserAfterInitLoad });
        }
        yield testInBrowser({ testPlanner, config, evalInBrowserAfterInitLoad });
        const runResult = BrowserInteractionResultReader_1.default.from(config.workDir);
        const leaks = yield findLeaks(runResult);
        APIStateManager_1.default.restoreState(config, state);
        return { leaks, runResult };
    });
}
exports.run = run;
/**
 * This API runs E2E interaction and takes heap snapshots.
 * This is equivalent to running `memlab snapshot` in CLI.
 *
 * @param options configure browser interaction run
 * @returns a utility reading browser interaction results from disk
 * * **Examples**:
 * ```javascript
 * const {takeSnapshots} = require('@memlab/api');
 *
 * (async function () {
 *   const scenario = {
 *     url: () => 'https://www.facebook.com',
 *   };
 *   const result = await takeSnapshots({scenario});
 * })();
 * ```
 */
function takeSnapshots(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = getConfigFromRunOptions(options);
        const state = APIStateManager_1.default.getAndUpdateState(config, options);
        const testPlanner = new e2e_1.TestPlanner();
        const { evalInBrowserAfterInitLoad } = options;
        yield testInBrowser({ testPlanner, config, evalInBrowserAfterInitLoad });
        const ret = BrowserInteractionResultReader_1.default.from(config.workDir);
        APIStateManager_1.default.restoreState(config, state);
        return ret;
    });
}
exports.takeSnapshots = takeSnapshots;
/**
 * This API finds memory leaks by analyzing heap snapshot(s).
 * This is equivalent to `memlab find-leaks` in CLI.
 *
 * @param runResult return value of a browser interaction run
 * @param options configure memory leak detection run
 * @param options.consoleMode specify the terminal output
 * mode (see {@link ConsoleMode})
 * @returns leak traces detected and clustered from the browser interaction
 * * **Examples**:
 * ```javascript
 * const {findLeaks, takeSnapshots} = require('@memlab/api');
 *
 * (async function () {
 *   const scenario = {
 *     url: () => 'https://www.facebook.com',
 *   };
 *   const result = await takeSnapshots({scenario, consoleMode: 'SILENT'});
 *   const leaks = findLeaks(result, {consoleMode: 'CONTINUOUS_TEST'});
 * })();
 * ```
 */
function findLeaks(runResult, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const state = APIStateManager_1.default.getAndUpdateState(core_1.config, options);
        const workDir = runResult.getRootDirectory();
        core_1.fileManager.initDirs(core_1.config, { workDir });
        core_1.config.chaseWeakMapEdge = false;
        const ret = yield core_1.analysis.checkLeak();
        APIStateManager_1.default.restoreState(core_1.config, state);
        return ret;
    });
}
exports.findLeaks = findLeaks;
/**
 * This API finds memory leaks by analyzing specified heap snapshots.
 * This is equivalent to `memlab find-leaks` with
 * the `--baseline`, `--target`, and `--final` flags in CLI.
 *
 * @param baselineSnapshot the file path of the baseline heap snapshot
 * @param targetSnapshot the file path of the target heap snapshot
 * @param finalSnapshot the file path of the final heap snapshot
 * @param options optionally, you can specify a mode for heap analysis
 * @param options.workDir specify a working directory (other than
 * the default one)
 * @param options.consoleMode specify the terminal output
 * mode (see {@link ConsoleMode})
 * @returns leak traces detected and clustered from the browser interaction
 */
function findLeaksBySnapshotFilePaths(baselineSnapshot, targetSnapshot, finalSnapshot, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const state = APIStateManager_1.default.getAndUpdateState(core_1.config, options);
        core_1.config.useExternalSnapshot = true;
        core_1.config.externalSnapshotFilePaths = [
            baselineSnapshot,
            targetSnapshot,
            finalSnapshot,
        ];
        core_1.fileManager.initDirs(core_1.config, { workDir: options.workDir });
        core_1.config.chaseWeakMapEdge = false;
        const ret = yield core_1.analysis.checkLeak();
        APIStateManager_1.default.restoreState(core_1.config, state);
        return ret;
    });
}
exports.findLeaksBySnapshotFilePaths = findLeaksBySnapshotFilePaths;
/**
 * This API analyzes heap snapshot(s) with a specified heap analysis.
 * This is equivalent to `memlab analyze` in CLI.
 *
 * @param runResult return value of a browser interaction run
 * @param heapAnalyzer instance of a heap analysis
 * @param args other CLI arguments that needs to be passed to the heap analysis
 * @returns each analysis may have a different return type, please check out
 * the type definition or the documentation for the `process` method of the
 * analysis class you are using for `heapAnalyzer`.
 * * **Examples**:
 * ```javascript
 * const {analyze, takeSnapshots, StringAnalysis} = require('@memlab/api');
 *
 * (async function () {
 *   const scenario = {
 *     url: () => 'https://www.facebook.com',
 *   };
 *   const result = await takeSnapshots({scenario});
 *   const analysis = new StringAnalysis();
 *   await analyze(result, analysis);
 * })();
 * ```
 */
function analyze(runResult, heapAnalyzer, args = { _: [] }) {
    return __awaiter(this, void 0, void 0, function* () {
        const workDir = runResult.getRootDirectory();
        core_1.fileManager.initDirs(core_1.config, { workDir });
        return yield heapAnalyzer.run({ args });
    });
}
exports.analyze = analyze;
/**
 * This warms up web server by sending web requests to the web sever.
 * This is equivalent to running `memlab warmup` in CLI.
 * @internal
 *
 * @param options configure browser interaction run
 */
function warmup(options = {}) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const config = (_a = options.config) !== null && _a !== void 0 ? _a : core_1.config;
        if (config.verbose) {
            core_1.info.lowLevel(`Xvfb: ${config.useXVFB}`);
        }
        const testPlanner = (_b = options.testPlanner) !== null && _b !== void 0 ? _b : e2e_1.defaultTestPlanner;
        try {
            if (config.skipWarmup) {
                return;
            }
            const browser = yield APIUtils_1.default.getBrowser({ warmup: true });
            const visitPlan = testPlanner.getVisitPlan();
            config.setDevice(visitPlan.device);
            const numOfWarmup = visitPlan.numOfWarmup || 3;
            const promises = [];
            for (let i = 0; i < numOfWarmup; ++i) {
                promises.push(browser.newPage());
            }
            const pages = yield Promise.all(promises);
            core_1.info.beginSection('warmup');
            yield Promise.all(pages.map((page) => __awaiter(this, void 0, void 0, function* () {
                yield setupPage(page, { cache: false });
                const interactionManager = new e2e_1.E2EInteractionManager(page, browser);
                yield interactionManager.warmupInPage();
            }))).catch(err => {
                core_1.info.error(err.message);
            });
            core_1.info.endSection('warmup');
            yield core_1.utils.closePuppeteer(browser, pages, { warmup: true });
        }
        catch (ex) {
            const error = core_1.utils.getError(ex);
            core_1.utils.checkUninstalledLibrary(error);
            throw ex;
        }
    });
}
exports.warmup = warmup;
function getConfigFromRunOptions(options) {
    let config = core_1.MemLabConfig.getInstance();
    if (options.workDir) {
        core_1.fileManager.initDirs(config, { workDir: options.workDir });
    }
    else {
        config = core_1.MemLabConfig.resetConfigWithTransientDir();
    }
    if ('webWorker' in options) {
        config.isAnalyzingMainThread = false;
        const value = options.webWorker;
        if (typeof value === 'string') {
            config.targetWorkerTitle = value;
        }
    }
    else {
        config.isAnalyzingMainThread = true;
    }
    config.isFullRun = !!options.snapshotForEachStep;
    return config;
}
function setupPage(page, options = {}) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const config = (_a = options.config) !== null && _a !== void 0 ? _a : core_1.config;
        const testPlanner = (_b = options.testPlanner) !== null && _b !== void 0 ? _b : e2e_1.defaultTestPlanner;
        if (config.emulateDevice) {
            yield page.emulate(config.emulateDevice);
        }
        if (config.defaultUserAgent && config.defaultUserAgent !== 'default') {
            yield page.setUserAgent(config.defaultUserAgent);
        }
        // set login session
        yield page.setCookie(...testPlanner.getCookies());
        const cache = (_c = options.cache) !== null && _c !== void 0 ? _c : true;
        yield page.setCacheEnabled(cache);
        // automatically accept dialog
        page.on('dialog', (dialog) => __awaiter(this, void 0, void 0, function* () {
            if (config.verbose) {
                core_1.info.lowLevel(`Browser dialog: ${dialog.message()}`);
            }
            yield dialog.accept();
        }));
    });
}
function initBrowserInfoInConfig(browser, options = {}) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const config = (_a = options.config) !== null && _a !== void 0 ? _a : core_1.config;
        core_1.browserInfo.recordPuppeteerConfig(config.puppeteerConfig);
        const version = yield browser.version();
        core_1.browserInfo.recordBrowserVersion(version);
        if (config.verbose) {
            core_1.info.lowLevel(JSON.stringify(core_1.browserInfo, null, 2));
        }
    });
}
/**
 * Browser interaction API used by MemLab API and MemLab CLI
 * @internal
 */
function testInBrowser(options = {}) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const config = (_a = options.config) !== null && _a !== void 0 ? _a : core_1.config;
        if (config.verbose) {
            core_1.info.lowLevel(`Xvfb: ${config.useXVFB}`);
        }
        const testPlanner = (_b = options.testPlanner) !== null && _b !== void 0 ? _b : e2e_1.defaultTestPlanner;
        let interactionManager = null;
        let xvfb = null;
        let browser = null;
        let page = null;
        let maybeError = null;
        try {
            xvfb = e2e_1.Xvfb.startIfEnabled();
            browser = yield APIUtils_1.default.getBrowser();
            const pages = yield browser.pages();
            page = pages.length > 0 ? pages[0] : yield browser.newPage();
            // create and configure web page interaction manager
            interactionManager = new e2e_1.E2EInteractionManager(page, browser);
            if (options.evalInBrowserAfterInitLoad) {
                interactionManager.setEvalFuncAfterInitLoad(options.evalInBrowserAfterInitLoad);
            }
            const visitPlan = testPlanner.getVisitPlan();
            // setup page configuration
            config.setDevice(visitPlan.device);
            yield initBrowserInfoInConfig(browser);
            core_1.browserInfo.monitorWebConsole(page);
            yield setupPage(page, options);
            // interact with the web page and take heap snapshots
            yield interactionManager.visitAndGetSnapshots(options);
        }
        catch (ex) {
            maybeError = core_1.utils.getError(ex);
            core_1.utils.checkUninstalledLibrary(maybeError);
        }
        finally {
            if (browser && page) {
                yield core_1.utils.closePuppeteer(browser, [page]);
            }
            if (interactionManager) {
                interactionManager.clearCDPSession();
            }
            if (xvfb) {
                xvfb.stop((err) => {
                    if (err) {
                        core_1.utils.haltOrThrow(err);
                    }
                });
            }
            if (maybeError != null) {
                core_1.utils.haltOrThrow(maybeError);
            }
        }
    });
}
exports.testInBrowser = testInBrowser;
