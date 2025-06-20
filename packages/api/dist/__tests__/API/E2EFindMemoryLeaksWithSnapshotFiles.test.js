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
    const result = yield (0, index_1.takeSnapshots)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
    });
    // copy heap snapshots to a different location
    const snapshotFiles = result.getSnapshotFiles();
    const tmpDir = core_1.fileManager.generateTmpHeapDir();
    const newSnapshotFiles = [];
    snapshotFiles.forEach(file => {
        const newFile = path_1.default.join(tmpDir, path_1.default.basename(file));
        newSnapshotFiles.push(newFile);
        fs_extra_1.default.moveSync(file, newFile);
    });
    fs_extra_1.default.removeSync(result.getRootDirectory());
    // find memory leaks with the new snapshot files
    const leaks = yield (0, index_1.findLeaksBySnapshotFilePaths)(newSnapshotFiles[0], newSnapshotFiles[1], newSnapshotFiles[2]);
    // detected all different leak trace cluster
    expect(leaks.length >= 1).toBe(true);
    // expect all traces are found
    expect(leaks.some(leak => JSON.stringify(leak).includes('__injectedValue')));
    expect(leaks.some(leak => JSON.stringify(leak).includes('_path_1')));
    expect(leaks.some(leak => JSON.stringify(leak).includes('_path_2')));
    // finally clean up the temporary directory
    fs_extra_1.default.removeSync(tmpDir);
}), E2ETestSettings_1.testTimeout);
test('takeSnapshot API allows to throw and catch exceptions from scenario', () => __awaiter(void 0, void 0, void 0, function* () {
    const scenarioThatThrows = Object.assign({}, E2ETestSettings_1.scenario);
    const errorMessage = 'throw from scenario.action';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scenarioThatThrows.action = (_page) => __awaiter(void 0, void 0, void 0, function* () {
        throw new Error(errorMessage);
    });
    expect.assertions(1);
    yield expect((0, index_1.takeSnapshots)({
        scenario: scenarioThatThrows,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
    })).rejects.toThrow(errorMessage);
}), E2ETestSettings_1.testTimeout);
test('run API allows to throw and catch exceptions from scenario', () => __awaiter(void 0, void 0, void 0, function* () {
    const scenarioThatThrows = Object.assign({}, E2ETestSettings_1.scenario);
    const errorMessage = 'throw from scenario.action';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scenarioThatThrows.action = (_page) => __awaiter(void 0, void 0, void 0, function* () {
        throw new Error(errorMessage);
    });
    expect.assertions(1);
    yield expect((0, index_1.run)({
        scenario: scenarioThatThrows,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
    })).rejects.toThrow(errorMessage);
}), E2ETestSettings_1.testTimeout);
