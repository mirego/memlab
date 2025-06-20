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
/* eslint-disable @typescript-eslint/ban-ts-comment */
const fs_1 = __importDefault(require("fs"));
const BrowserInteractionResultReader_1 = __importDefault(require("../../result-reader/BrowserInteractionResultReader"));
const index_1 = require("../../index");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
const SnapshotResultReader_1 = __importDefault(require("../../result-reader/SnapshotResultReader"));
beforeEach(E2ETestSettings_1.testSetup);
function inject() {
    // @ts-ignore
    window.injectHookForLink4 = () => {
        const arr = [];
        for (let i = 0; i < 10000; ++i) {
            arr.push('duplicated string value' + (i % 1));
        }
        // @ts-ignore
        window.__injectedValue = arr;
    };
}
function checkResultReader(result) {
    const workDir = result.getRootDirectory();
    expect(fs_1.default.existsSync(workDir)).toBe(true);
    const snapshotDir = result.getSnapshotFileDir();
    expect(fs_1.default.existsSync(snapshotDir)).toBe(true);
    const snapshotFiles = result.getSnapshotFiles();
    expect(snapshotFiles.length > 0).toBe(true);
    const steps = result.getInteractionSteps();
    expect(steps.length > 0).toBe(true);
    expect(steps[0].name).toBe('page-load');
    const runMeta = result.getRunMetaInfo();
    expect(runMeta.app).toBe('test-spa');
    result.cleanup();
    expect(fs_1.default.existsSync(workDir)).toBe(false);
    expect(() => result.getRootDirectory()).toThrowError();
    expect(() => result.getSnapshotFileDir()).toThrowError();
    expect(() => result.getSnapshotFiles()).toThrowError();
}
test('result data/file reader is working as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, index_1.warmupAndTakeSnapshots)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: inject,
    });
    checkResultReader(result);
}), E2ETestSettings_1.testTimeout);
test('ResultReader.from is working as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, index_1.warmupAndTakeSnapshots)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: inject,
    });
    checkResultReader(BrowserInteractionResultReader_1.default.from(result.getRootDirectory()));
}), E2ETestSettings_1.testTimeout);
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
test('SnapshotResultReader is working as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, index_1.warmupAndTakeSnapshots)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: injectDetachedDOMElements,
    });
    const snapshotFiles = result.getSnapshotFiles();
    expect(snapshotFiles.length).toBe(3);
    const reader = SnapshotResultReader_1.default.fromSnapshots(snapshotFiles[0], snapshotFiles[1], snapshotFiles[2]);
    const leaks = yield (0, index_1.findLeaks)(reader);
    // detected all different leak trace cluster
    expect(leaks.length >= 1).toBe(true);
    // expect all traces are found
    expect(leaks.some(leak => JSON.stringify(leak).includes('__injectedValue')));
    expect(leaks.some(leak => JSON.stringify(leak).includes('_path_1')));
    expect(leaks.some(leak => JSON.stringify(leak).includes('_path_2')));
}), E2ETestSettings_1.testTimeout);
