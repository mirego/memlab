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
const core_1 = require("@memlab/core");
const fs_1 = __importDefault(require("fs"));
const core_2 = require("@memlab/core");
const BaseOperation_1 = __importDefault(require("./operations/BaseOperation"));
const InteractionUtils_1 = __importDefault(require("./operations/InteractionUtils"));
const core_3 = require("@memlab/core");
function checkLastSnapshotChunk(chunk) {
    const regex = /\}\s*$/;
    if (!regex.test(chunk)) {
        core_2.utils.throwError(new Error('resolved `HeapProfiler.takeHeapSnapshot` before writing the last chunk'));
    }
}
// get URL parameter for a specific step
function getURLParameter(tab, visitPlan) {
    var _a, _b;
    const params = visitPlan.URLParameters;
    const stepParams = (_b = (_a = tab.urlParams) === null || _a === void 0 ? void 0 : _a.map(({ name, value }) => [name, value].map(encodeURIComponent).join('=')).join('&')) !== null && _b !== void 0 ? _b : '';
    let ret = params +
        (params.length > 0 && stepParams.length > 0 ? '&' : '') +
        stepParams;
    if (ret.length > 0 && !ret.startsWith('?')) {
        ret = '?' + ret;
    }
    return ret;
}
function compareURL(page, url) {
    if (!core_2.config.verbose) {
        return;
    }
    const actual = unescape(page.url());
    url = unescape(url);
    if (!core_2.utils.isURLEqual(url, actual)) {
        core_2.info.warning('URL changed:');
        core_2.info.lowLevel(` Expected: ${url}`);
        core_2.info.lowLevel('----');
        core_2.info.lowLevel(` Actual:   ${actual}`);
        core_2.info.lowLevel('');
    }
}
function logTabProgress(i, visitPlan) {
    const len = visitPlan.tabsOrder.length;
    const tab = visitPlan.tabsOrder[i];
    const progress = `[${i + 1}/${len}]`;
    const tabType = tab.type ? `(${tab.type})` : '';
    const msg = `${progress} visiting ${tab.name} ${tabType}`;
    if (core_2.config.verbose) {
        core_2.info.topLevel(msg);
    }
    core_2.info.topLevel(core_2.serializer.summarizeTabsOrder(visitPlan.tabsOrder, {
        color: true,
        progress: i,
    }));
    core_2.browserInfo.addMarker(`[memlab]: ${msg}`);
}
function serializeVisitPlan(visitPlan) {
    fs_1.default.writeFileSync(core_2.config.snapshotSequenceFile, JSON.stringify(visitPlan.tabsOrder, null, 2), 'UTF-8');
}
function logMetaData(visitPlan, opt = {}) {
    // save the visiting info to disk
    serializeVisitPlan(visitPlan);
    // save the run meta info to disk
    const runMeta = {
        app: core_2.config.targetApp,
        type: visitPlan.type,
        interaction: core_2.config.targetTab,
        browserInfo: core_2.browserInfo,
    };
    core_1.runInfoUtils.runMetaInfoManager.saveRunMetaInfo(runMeta);
    // additional post processing of collected data
    if (opt.final) {
        core_2.config.runningMode.postProcessData(visitPlan);
    }
}
function setPermissions(page, origin) {
    return __awaiter(this, void 0, void 0, function* () {
        if (origin === '' || origin == null) {
            return;
        }
        const browser = page.browser();
        const context = browser.defaultBrowserContext();
        yield context.overridePermissions(origin, core_2.config.grantedPermissions);
    });
}
// check if the URL is correct
function checkURL(page, intendedURL) {
    compareURL(page, intendedURL);
}
function injectPageReloadChecker(page) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.evaluate(() => {
            // @ts-expect-error TODO: add Window shim type
            window.__memlab_check_reload = 1;
        });
    });
}
function checkPageReload(page) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-expect-error TODO: add Window shim type
        const flag = yield page.evaluate(() => window.__memlab_check_reload);
        if (flag !== 1) {
            core_2.utils.haltOrThrow('The page is reloaded. MemLab cannot analyze heap across page reloads. ' +
                'Please remove window.reload() calls, page.goto() calls, ' +
                'or any reload logic.');
        }
    });
}
function maybeWaitForConsoleInput(stepId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (core_2.config.isManualDebug) {
            yield core_2.info.waitForConsole(`Press Enter (or Return) to continue step-${stepId}:`);
        }
    });
}
function applyAsyncWithGuard(f, self, args, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exceptionHandler = (_ex) => {
    /*noop*/
}) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret;
        try {
            ret = yield f.apply(self, args);
        }
        catch (ex) {
            yield exceptionHandler(core_2.utils.getError(ex));
        }
        return ret;
    });
}
function applyAsyncWithRetry(f, self, args, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        options.retry = options.retry || 0;
        const retry = options.retry;
        const exceptionHandler = (ex) => __awaiter(this, void 0, void 0, function* () {
            if (retry <= 0 || core_2.config.verbose) {
                // if the browser UI is enabled, MemLab should wait for a while
                // so we can have a chance to manually inspect the page
                if (core_2.config.openDevtoolsConsole) {
                    yield InteractionUtils_1.default.waitFor(core_2.config.delayBeforeExitUponException);
                }
                core_2.utils.haltOrThrow(core_2.utils.getError(ex), {
                    printCallback: () => {
                        core_2.info.warning('interaction fail');
                    },
                });
            }
            core_2.info.warning(`interaction fail, making ${retry} more attempt(s)...`);
            if (!!options.delayBeforeRetry && options.delayBeforeRetry > 0) {
                yield InteractionUtils_1.default.waitFor(options.delayBeforeRetry);
            }
            if (options.retry) {
                options.retry--;
            }
            yield applyAsyncWithRetry(f, self, args, options);
        });
        yield applyAsyncWithGuard(f, self, args, exceptionHandler);
    });
}
function clearConsole(page) {
    return __awaiter(this, void 0, void 0, function* () {
        if (core_2.config.clearConsole) {
            yield page.evaluate(() => {
                try {
                    console.clear();
                }
                catch (_a) {
                    // do nothing
                }
            });
        }
    });
}
function dispatchOperation(page, operation, opArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(operation instanceof BaseOperation_1.default)) {
            throw core_2.utils.haltOrThrow(`unknown operation: ${operation}`);
        }
        yield operation.do(page, opArgs);
    });
}
function waitExtraForTab(tabInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let delay = 0;
        const mode = core_2.config.runningMode;
        if (tabInfo.type === 'target') {
            if (!mode.shouldExtraWaitForTarget(tabInfo)) {
                return;
            }
            delay += core_2.config.extraWaitingForTarget;
        }
        else if (tabInfo.type === 'final') {
            if (!mode.shouldExtraWaitForFinal(tabInfo)) {
                return;
            }
            delay += core_2.config.extraWaitingForFinal;
        }
        // wait for extra time
        if (delay > 0) {
            core_2.info.overwrite(`wait extra ${delay / 1000}s for ${tabInfo.type} page...`);
            yield InteractionUtils_1.default.waitFor(delay);
        }
    });
}
function getNavigationHistoryLength(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(() => {
            let ret = -1;
            try {
                ret = history.length;
            }
            catch (e) {
                // do nothing
            }
            return ret;
        });
    });
}
// const allocFile = path.join(config.curDataDir, 'Heap-alloc.json');
// await startTrackingHeapAllocation(page, allocFile);
function startTrackingHeapAllocation(page, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const heap = '';
        fs_1.default.writeFileSync(file, heap, 'UTF-8');
        core_2.info.lowLevel('tracking heap allocation...');
        const cdpSession = yield page.target().createCDPSession();
        cdpSession.on('HeapProfiler.addHeapSnapshotChunk', data => {
            fs_1.default.appendFileSync(file, data.chunk, 'UTF-8');
        });
        yield cdpSession.send('HeapProfiler.startTrackingHeapObjects', {
            trackAllocations: true,
        });
        yield InteractionUtils_1.default.waitFor(30000);
        return cdpSession;
    });
}
function getScenarioAppName(scenario = null) {
    if (!scenario || !scenario.app) {
        return getScenarioDefaultAppName();
    }
    return scenario.app();
}
function getScenarioDefaultAppName() {
    return 'default-app-for-scenario';
}
exports.default = (0, core_3.setInternalValue)({
    applyAsyncWithGuard,
    applyAsyncWithRetry,
    checkLastSnapshotChunk,
    checkPageReload,
    checkURL,
    clearConsole,
    compareURL,
    dispatchOperation,
    getNavigationHistoryLength,
    getScenarioAppName,
    getURLParameter,
    injectPageReloadChecker,
    logMetaData,
    logTabProgress,
    maybeWaitForConsoleInput,
    serializeVisitPlan,
    setPermissions,
    startTrackingHeapAllocation,
    waitExtraForTab,
}, __filename, core_3.constant.internalDir);
