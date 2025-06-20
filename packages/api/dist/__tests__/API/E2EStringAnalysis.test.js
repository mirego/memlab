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
/* eslint-disable @typescript-eslint/ban-ts-comment */
const index_1 = require("../../index");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
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
test('String analysis works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, index_1.warmupAndTakeSnapshots)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: inject,
    });
    // test analysis from auto loading
    let analysis = new index_1.StringAnalysis();
    yield analysis.run();
    let dupStrings = analysis.getTopDuplicatedStringsInCount();
    expect(dupStrings[0].n).toBe(10000);
    expect(dupStrings[0].str).toBe('duplicated string value0');
    // test analysis from file
    const snapshotFile = result.getSnapshotFiles().pop();
    analysis = new index_1.StringAnalysis();
    yield analysis.analyzeSnapshotFromFile(snapshotFile);
    dupStrings = analysis.getTopDuplicatedStringsInCount();
    expect(dupStrings[0].n).toBe(10000);
    expect(dupStrings[0].str).toBe('duplicated string value0');
    // expect incorrect use of heap analysis to throw
    const snapshotDir = result.getSnapshotFileDir();
    analysis = new index_1.StringAnalysis();
    expect(() => __awaiter(void 0, void 0, void 0, function* () { return yield analysis.analyzeSnapshotsInDirectory(snapshotDir); })).rejects.toThrowError();
}), E2ETestSettings_1.testTimeout);
test('analyze function works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, index_1.warmupAndTakeSnapshots)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: inject,
    });
    // test analysis from auto loading
    const analysis = new index_1.StringAnalysis();
    yield (0, index_1.analyze)(result, analysis);
    const dupStrings = analysis.getTopDuplicatedStringsInCount();
    expect(dupStrings[0].n).toBe(10000);
    expect(dupStrings[0].str).toBe('duplicated string value0');
}), E2ETestSettings_1.testTimeout);
