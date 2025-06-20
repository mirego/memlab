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
test('self-defined leak detector can find TestObject', () => __awaiter(void 0, void 0, void 0, function* () {
    const selfDefinedScenario = {
        app: () => 'test-spa',
        url: () => '',
        action: (page) => __awaiter(void 0, void 0, void 0, function* () { return yield page.click('[data-testid="link-4"]'); }),
        leakFilter: (node) => {
            return node.name === 'TestObject' && node.type === 'object';
        },
    };
    const workDir = path_1.default.join(os_1.default.tmpdir(), 'memlab-api-test', (0, E2ETestSettings_1.getUniqueID)());
    fs_extra_1.default.mkdirsSync(workDir);
    const result = yield (0, index_1.run)({
        scenario: selfDefinedScenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
        workDir,
    });
    // detected all different leak trace cluster
    expect(result.leaks.length).toBe(1);
    // expect all traces are found
    expect(result.leaks.some(leak => JSON.stringify(leak).includes('_randomObject')));
    const reader = result.runResult;
    expect(path_1.default.resolve(reader.getRootDirectory())).toBe(path_1.default.resolve(workDir));
}), E2ETestSettings_1.testTimeout);
test('self-defined retainer trace filter work as expected (part 1)', () => __awaiter(void 0, void 0, void 0, function* () {
    const selfDefinedScenario = {
        app: () => 'test-spa',
        url: () => '',
        action: (page) => __awaiter(void 0, void 0, void 0, function* () { return yield page.click('[data-testid="link-4"]'); }),
        retainerReferenceFilter: (edge) => {
            return edge.name_or_index !== '_path_1';
        },
    };
    const workDir = path_1.default.join(os_1.default.tmpdir(), 'memlab-api-test', (0, E2ETestSettings_1.getUniqueID)());
    fs_extra_1.default.mkdirsSync(workDir);
    const result = yield (0, index_1.run)({
        scenario: selfDefinedScenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
        workDir,
    });
    // detected all different leak trace cluster
    expect(result.leaks.length).toBe(1);
    // expect the none of the traces to include _path_1
    expect(result.leaks.every(leak => !JSON.stringify(leak).includes('_path_1')));
    // expect some of the traces to include _path_2
    expect(result.leaks.some(leak => JSON.stringify(leak).includes('_path_2')));
    const reader = result.runResult;
    expect(path_1.default.resolve(reader.getRootDirectory())).toBe(path_1.default.resolve(workDir));
}), E2ETestSettings_1.testTimeout);
test('self-defined retainer trace filter work as expected (part 2)', () => __awaiter(void 0, void 0, void 0, function* () {
    const selfDefinedScenario = {
        app: () => 'test-spa',
        url: () => '',
        action: (page) => __awaiter(void 0, void 0, void 0, function* () { return yield page.click('[data-testid="link-4"]'); }),
        retainerReferenceFilter: (edge) => {
            return edge.name_or_index !== '_path_2';
        },
    };
    const workDir = path_1.default.join(os_1.default.tmpdir(), 'memlab-api-test', (0, E2ETestSettings_1.getUniqueID)());
    fs_extra_1.default.mkdirsSync(workDir);
    const result = yield (0, index_1.run)({
        scenario: selfDefinedScenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
        workDir,
    });
    // detected all different leak trace cluster
    expect(result.leaks.length).toBe(1);
    // expect the none of the traces to include _path_2
    expect(result.leaks.every(leak => !JSON.stringify(leak).includes('_path_2')));
    // expect some of the traces to include _path_1
    expect(result.leaks.some(leak => JSON.stringify(leak).includes('_path_1')));
    const reader = result.runResult;
    expect(path_1.default.resolve(reader.getRootDirectory())).toBe(path_1.default.resolve(workDir));
}), E2ETestSettings_1.testTimeout);
