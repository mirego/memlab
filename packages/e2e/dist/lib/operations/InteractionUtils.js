/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
'use strict';
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
const path_1 = __importDefault(require("path"));
function waitFor(delay) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}
function WaitUntilCallbackReturnsTrue(page, isPageLoaded, options = {}) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (options.showProgress) {
            core_1.info.overwrite('waiting for page load...');
        }
        let isSuccessful = false;
        const failedURLs = (_a = options.failedURLs) !== null && _a !== void 0 ? _a : Object.create(null);
        const url = new URL(page.url());
        if (failedURLs[url.pathname]) {
            return yield waitFor(core_1.config.delayWhenNoPageLoadCheck);
        }
        // retry check for at most 10 minutes
        for (let i = 0; i < 10 * 60 * 50; ++i) {
            // now check
            let doneOrError;
            try {
                doneOrError = yield isPageLoaded(page);
            }
            catch (_b) {
                break;
            }
            // if Check succeed
            if (doneOrError === true) {
                isSuccessful = true;
                break;
            }
            else if (typeof doneOrError === 'string') {
                // if error during page load check
                return core_1.info.warning(`Checking page load got: ${doneOrError}`);
            }
            // Check page load is not successful yet, check again
            yield waitFor(200);
        }
        if (!isSuccessful) {
            if (!options.mute) {
                core_1.info.overwrite(`Check timeout '${url.pathname}' set wait: ${core_1.config.delayWhenNoPageLoadCheck}ms`);
            }
            failedURLs[url.pathname] = true;
        }
        if (!options.noWaitAfterPageLoad) {
            yield waitFor(core_1.config.waitAfterPageLoad);
        }
    });
}
function waitUntilLoaded(page, options = {}) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // manual delay supercedes page load checker
        let delay = (_a = options.delay) !== null && _a !== void 0 ? _a : 0;
        if (delay > 0) {
            if (!options.mute && delay > 2000) {
                core_1.info.overwrite(`wait for ${delay / 1000}s`);
            }
            yield waitFor(delay);
            return;
        }
        // check page load with specified checker
        const isPageLoaded = options.isPageLoaded;
        if (isPageLoaded) {
            yield WaitUntilCallbackReturnsTrue(page, isPageLoaded, options);
            return;
        }
        // if nothing is specified, use default delay
        delay = core_1.config.delayWhenNoPageLoadCheck;
        if (!options.mute && delay > 2000) {
            core_1.info.overwrite(`wait for ${delay / 1000}s`);
        }
        yield waitFor(delay);
    });
}
function screenshot(page, name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (core_1.config.isContinuousTest) {
            return;
        }
        const screenshotFile = path_1.default.join(core_1.config.curDataDir, `screenshot-${name}.png`);
        core_1.info.overwrite('taking screenshot...');
        yield page.screenshot({ path: screenshotFile });
    });
}
function getWaitTimeout(optional) {
    if (optional) {
        return 3000;
    }
    return core_1.config.presenceCheckTimeout || 60000;
}
function waitForSelector(page, selector, whatToWaitForSelectorToDo = 'exist', optional = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeout = getWaitTimeout(optional);
        let waitConfig = null;
        switch (whatToWaitForSelectorToDo) {
            case 'appear':
                waitConfig = {
                    visible: true, // ie. not `display:none` or `visibility:hidden`
                };
                break;
            case 'disappear':
                waitConfig = {
                    hidden: true, // ie. `display:none`, `visibility:hidden`, or removed
                };
                break;
            case 'exist': // ie. existent, whether visible or not; default config.
                break;
        }
        core_1.info.overwrite(`wait for ${selector} to ${whatToWaitForSelectorToDo}`);
        if (selector.startsWith('contains:')) {
            return yield keepTryingUntil(() => __awaiter(this, void 0, void 0, function* () {
                const text = selector.slice('contains:'.length);
                const elems = yield getElementsContainingText(page, text);
                if (!elems || elems.length === 0) {
                    return false;
                }
                yield Promise.all(elems.map(e => e.dispose()));
                return true;
            }), timeout);
        }
        try {
            const elem = yield page.waitForSelector(selector, Object.assign(Object.assign({}, waitConfig), { timeout }));
            if (elem) {
                yield elem.dispose();
            }
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function keepTryingUntil(checkCallback, timeout = 2000) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTimestamp = Date.now();
        let currentTimestamp = Date.now();
        while (currentTimestamp - startTimestamp < timeout) {
            const flag = yield checkCallback();
            if (flag) {
                return true;
            }
            yield waitFor(200);
            currentTimestamp = Date.now();
        }
        return false;
    });
}
function checkIfPresent(page, selector, optional = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return waitForSelector(page, selector, 'exist', optional);
    });
}
function checkIfVisible(page, selector, optional = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return waitForSelector(page, selector, 'appear', optional);
    });
}
function waitForDisappearance(page, selector, optional = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return waitForSelector(page, selector, 'disappear', optional);
    });
}
function getElementsContainingText(page, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const xpath = `//*[not(self::script)][contains(text(), '${text}')]`;
        return findBySelector(page, xpath);
    });
}
function findBySelector(page, xpath) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const _page = page;
        if (typeof _page.$x === 'function') {
            return ((_a = (yield _page.$x(xpath))) !== null && _a !== void 0 ? _a : []);
        }
        // evaluate in browser and return the result as a JSHandle
        // to an array of elements in the browser's context
        const elements = yield page.evaluateHandle(xpath => {
            const xpathResult = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            const nodes = [];
            let node = xpathResult.iterateNext();
            while (node) {
                nodes.push(node);
                node = xpathResult.iterateNext();
            }
            return nodes;
        }, xpath);
        // Convert the elements to ElementHandle<Element>[]
        const elementHandles = yield elements.getProperties();
        const ret = [];
        for (const elementHandle of elementHandles.values()) {
            const element = elementHandle.asElement();
            if (element != null) {
                ret.push(element);
            }
        }
        return ret;
    });
}
exports.default = {
    checkIfPresent,
    checkIfVisible,
    getElementsContainingText,
    screenshot,
    waitFor,
    waitForDisappearance,
    waitForSelector,
    WaitUntilCallbackReturnsTrue,
    waitUntilLoaded,
};
