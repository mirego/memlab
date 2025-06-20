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
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
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
test('leak detector can find detached DOM elements', () => __awaiter(void 0, void 0, void 0, function* () {
    const { leaks } = yield (0, index_1.run)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
    });
    // detected all different leak trace cluster
    expect(leaks.length >= 1).toBe(true);
    // expect all traces are found
    expect(leaks.some(leak => JSON.stringify(leak).includes('__injectedValue')));
    expect(leaks.some(leak => JSON.stringify(leak).includes('_path_1')));
    expect(leaks.some(leak => JSON.stringify(leak).includes('_path_2')));
}), E2ETestSettings_1.testTimeout);
function injectDetachedDOMElementsWithPrompt() {
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
        // pop up dialogs
        alert('alert test');
        confirm('confirm test');
        prompt('prompt test:', 'default');
    };
}
test('test runner should work with pages having pop up dialog', () => __awaiter(void 0, void 0, void 0, function* () {
    const selfDefinedScenario = {
        app: () => 'test-spa',
        url: () => '',
        action: (page) => __awaiter(void 0, void 0, void 0, function* () {
            yield page.evaluate(() => {
                // pop up dialogs
                alert('alert test');
                confirm('confirm test');
                prompt('prompt test:', 'default');
            });
            yield page.click('[data-testid="link-4"]');
        }),
        leakFilter: (node) => {
            return node.name === 'TestObject' && node.type === 'object';
        },
    };
    const workDir = path_1.default.join(os_1.default.tmpdir(), 'memlab-api-test', (0, E2ETestSettings_1.getUniqueID)());
    fs_extra_1.default.mkdirsSync(workDir);
    const result = yield (0, index_1.run)({
        scenario: selfDefinedScenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElementsWithPrompt,
        workDir,
    });
    // detected all different leak trace cluster
    expect(result.leaks.length).toBe(1);
    // expect all traces are found
    expect(result.leaks.some(leak => JSON.stringify(leak).includes('_randomObject')));
    const reader = result.runResult;
    expect(path_1.default.resolve(reader.getRootDirectory())).toBe(path_1.default.resolve(workDir));
}), E2ETestSettings_1.testTimeout);
