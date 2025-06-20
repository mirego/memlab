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
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
beforeEach(E2ETestSettings_1.testSetup);
function injectDetachedDOMElements() {
    // @ts-ignore
    window.injectHookForLink4 = () => {
        class TestObject {
        }
        const arr = [];
        for (let i = 0; i < 23; ++i) {
            arr.push(document.createElement('div'));
        }
        // @ts-ignore
        window.__injectedValue = arr;
        // @ts-ignore
        window._path_1 = { x: { y: document.createElement('div') } };
        // @ts-ignore
        window._path_2 = new Set([document.createElement('div')]);
        // @ts-ignore
        window._randomObject = [new TestObject()];
    };
}
test('callbacks in test scenarios are called in the right order', () => __awaiter(void 0, void 0, void 0, function* () {
    const actualCalls = [];
    // define a test scenario with all callbacks offered by memlab
    const selfDefinedScenario = {
        app: () => {
            actualCalls.push('app');
            return 'test-spa';
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        beforeInitialPageLoad: (_page) => __awaiter(void 0, void 0, void 0, function* () {
            actualCalls.push('beforeInitialPageLoad');
        }),
        cookies: () => {
            actualCalls.push('cookies');
            return [];
        },
        repeat: () => {
            actualCalls.push('repeat');
            return 0;
        },
        isPageLoaded: (page) => __awaiter(void 0, void 0, void 0, function* () {
            actualCalls.push('isPageLoaded');
            yield page.waitForNavigation({
                // consider navigation to be finished when there are
                // no more than 2 network connections for at least 500 ms.
                waitUntil: 'networkidle2',
                // Maximum navigation time in milliseconds
                timeout: 5000,
            });
            return true;
        }),
        url: () => {
            actualCalls.push('url');
            return '';
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup: (_page) => __awaiter(void 0, void 0, void 0, function* () {
            actualCalls.push('setup');
        }),
        action: (page) => __awaiter(void 0, void 0, void 0, function* () {
            actualCalls.push('action');
            yield page.click('[data-testid="link-4"]');
        }),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        back: (_page) => __awaiter(void 0, void 0, void 0, function* () {
            actualCalls.push('back');
        }),
        beforeLeakFilter: (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _snapshot, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _leakedNodeIds) => {
            actualCalls.push('beforeLeakFilter');
        },
        leakFilter: (node) => {
            actualCalls.push('leakFilter');
            return node.name === 'TestObject' && node.type === 'object';
        },
    };
    // run test scenario
    yield (0, index_1.run)({
        scenario: selfDefinedScenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
        skipWarmup: true,
    });
    // squash all leakFilter call into a single identifier
    let normalizedCalls = squash(actualCalls, ['leakFilter', 'isPageLoaded']);
    normalizedCalls = normalizedCalls.slice(normalizedCalls.lastIndexOf('url'));
    // expect all callbacks are called in the right order
    expect(normalizedCalls).toEqual([
        // the first 4 calls (app, cookies, repeat, url) can be in any order
        'url',
        'repeat',
        'app',
        'cookies',
        // the following calls must be in the exact order listed
        'beforeInitialPageLoad',
        'isPageLoaded',
        'setup',
        'action',
        'isPageLoaded',
        'back',
        'isPageLoaded',
        'beforeLeakFilter',
        'leakFilter',
    ]);
}), E2ETestSettings_1.testTimeout);
// Squashes consecutive occurrences of a specified element in
// an array into a single occurrence of that element
function squash(arr, elementsToSquash) {
    const squashSet = new Set(elementsToSquash);
    return arr.filter((value, index) => !squashSet.has(value) || value !== arr[index - 1]);
}
