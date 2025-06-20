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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../../index");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
beforeEach(E2ETestSettings_1.testSetup);
function inject() {
    // @ts-ignore
    window.injectHookForLink4 = () => {
        function LeakObject() {
            // @ts-ignore
            this.value = `value: ${Math.random()}`;
        }
        // @ts-ignore
        const leak = (window.__injectedValue = window.__injectedValue || []);
        for (let i = 0; i < 10000; ++i) {
            // @ts-ignore
            leak.push(new LeakObject());
        }
    };
}
function gatherSnapshots() {
    return __awaiter(this, void 0, void 0, function* () {
        const repeatScenario = Object.assign({ repeat: () => 2 }, E2ETestSettings_1.scenario);
        // test analysis from auto loading
        const result = yield (0, index_1.warmupAndTakeSnapshots)({
            scenario: repeatScenario,
            evalInBrowserAfterInitLoad: inject,
            snapshotForEachStep: true,
        });
        return result;
    });
}
function testAnalysisFromAutoLoading() {
    return __awaiter(this, void 0, void 0, function* () {
        // test analysis from auto loading
        const analysis = new index_1.ShapeUnboundGrowthAnalysis();
        yield analysis.run();
        const shapeSummary = analysis.getShapesWithUnboundGrowth();
        expect(shapeSummary.reduce((acc, summary) => acc || summary.shape.includes('LeakObject'), false)).toBe(true);
    });
}
function testAnalysisFromFileDir(result) {
    return __awaiter(this, void 0, void 0, function* () {
        // test analysis from file
        const snapshotDir = result.getSnapshotFileDir();
        const analysis = new index_1.ShapeUnboundGrowthAnalysis();
        const ret = yield analysis.analyzeSnapshotsInDirectory(snapshotDir);
        // expect the heap analysis output log file to exist and
        // to contain the expected results
        expect(fs_1.default.existsSync(ret.analysisOutputFile)).toBe(true);
        expect(fs_1.default.readFileSync(ret.analysisOutputFile, 'UTF-8').includes('LeakObject')).toBe(true);
        // expect the query API works
        const shapeSummary = analysis.getShapesWithUnboundGrowth();
        expect(shapeSummary.some((summary) => summary.shape.includes('LeakObject'))).toBe(true);
    });
}
function testIncorrectUseage(result) {
    return __awaiter(this, void 0, void 0, function* () {
        // expect incorrect use of heap analysis to throw
        const snapshotFile = result.getSnapshotFiles().pop();
        const analysis = new index_1.ShapeUnboundGrowthAnalysis();
        expect(() => __awaiter(this, void 0, void 0, function* () { return yield analysis.analyzeSnapshotFromFile(snapshotFile); })).rejects.toThrowError();
    });
}
function testAnalysisWithSpecifiedWorkDir(result) {
    return __awaiter(this, void 0, void 0, function* () {
        // test analysis from file
        const snapshotDir = result.getSnapshotFileDir();
        const analysis = new index_1.ShapeUnboundGrowthAnalysis();
        const workDir = `/tmp/memlab-test/${(0, E2ETestSettings_1.getUniqueID)()}`;
        const ret = yield analysis.analyzeSnapshotsInDirectory(snapshotDir, {
            workDir,
        });
        // expect the heap analysis output log file to exist and
        expect(fs_1.default.existsSync(ret.analysisOutputFile)).toBe(true);
        // output file is inside the working directory
        expect(path_1.default.resolve(ret.analysisOutputFile).includes(path_1.default.resolve(workDir))).toBe(true);
        // output file contains the expected result
        expect(fs_1.default.readFileSync(ret.analysisOutputFile, 'UTF-8').includes('LeakObject')).toBe(true);
        // expect the query API works
        const shapeSummary = analysis.getShapesWithUnboundGrowth();
        expect(shapeSummary.some((summary) => summary.shape.includes('LeakObject'))).toBe(true);
    });
}
test('Shape unbound analysis works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gatherSnapshots();
    yield testAnalysisFromAutoLoading();
    yield testAnalysisFromFileDir(result);
    yield testIncorrectUseage(result);
    yield testAnalysisWithSpecifiedWorkDir(result);
}), E2ETestSettings_1.testTimeout);
