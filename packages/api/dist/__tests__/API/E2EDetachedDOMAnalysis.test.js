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
const index_1 = require("../../index");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
beforeEach(E2ETestSettings_1.testSetup);
function inject() {
    // @ts-ignore
    window.injectHookForLink4 = () => {
        // @ts-ignore
        window.__injectedValue = document.createElement('table');
    };
}
test('Detached DOM analysis works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, index_1.warmupAndTakeSnapshots)({
        scenario: E2ETestSettings_1.scenario,
        evalInBrowserAfterInitLoad: inject,
    });
    // test analysis from auto loading
    let analysis = new index_1.DetachedDOMElementAnalysis();
    yield analysis.run();
    let domElems = analysis.getDetachedElements();
    expect(domElems.some(node => node.name === 'Detached HTMLTableElement')).toBe(true);
    // test analysis from file
    const snapshotFile = result.getSnapshotFiles().pop();
    analysis = new index_1.DetachedDOMElementAnalysis();
    const ret = yield analysis.analyzeSnapshotFromFile(snapshotFile);
    // expect the heap analysis output log file to exist and
    // to contain the expected results
    expect(fs_1.default.existsSync(ret.analysisOutputFile)).toBe(true);
    expect(fs_1.default
        .readFileSync(ret.analysisOutputFile, 'UTF-8')
        .includes('Detached HTMLTableElement')).toBe(true);
    // check if the query result API works as expected
    domElems = analysis.getDetachedElements();
    expect(domElems.some(node => node.name === 'Detached HTMLTableElement')).toBe(true);
}), E2ETestSettings_1.testTimeout);
