"use strict";
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.injectHookForLink4 = () => {
        const arr = [];
        for (let i = 0; i < 12345; ++i) {
            arr.push({ v: i % 1 });
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.__injectedValue = arr;
    };
}
function gatherSnapshots() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, index_1.warmupAndTakeSnapshots)({
            scenario: E2ETestSettings_1.scenario,
            evalInBrowserAfterInitLoad: inject,
        });
        return result;
    });
}
function testAnalysisFromAutoLoading() {
    return __awaiter(this, void 0, void 0, function* () {
        // test analysis from auto loading
        const analysis = new index_1.ObjectShallowAnalysis();
        yield analysis.run();
        const dupcatedObjectInfo = analysis.getTopDuplicatedObjectInCount();
        expect(dupcatedObjectInfo[0].n).toBe(12345);
    });
}
function testAnalysisFromFileDir(result) {
    return __awaiter(this, void 0, void 0, function* () {
        // test analysis from file
        const snapshotFile = result.getSnapshotFiles().pop();
        const analysis = new index_1.ObjectShallowAnalysis();
        yield analysis.analyzeSnapshotFromFile(snapshotFile);
        const dupcatedObjectInfo = analysis.getTopDuplicatedObjectInCount();
        expect(dupcatedObjectInfo[0].n).toBe(12345);
    });
}
function testAnalysisWithSpecifiedWorkDir(result) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshotFile = result.getSnapshotFiles().pop();
        const analysis = new index_1.ObjectShallowAnalysis();
        const workDir = `/tmp/memlab-test/${(0, E2ETestSettings_1.getUniqueID)()}`;
        const ret = yield analysis.analyzeSnapshotFromFile(snapshotFile, { workDir });
        // expect the heap analysis output log file to exist and
        expect(fs_1.default.existsSync(ret.analysisOutputFile)).toBe(true);
        // output file is inside the working directory
        expect(path_1.default.resolve(ret.analysisOutputFile).includes(path_1.default.resolve(workDir))).toBe(true);
        const dupcatedObjectInfo = analysis.getTopDuplicatedObjectInCount();
        expect(dupcatedObjectInfo[0].n).toBe(12345);
    });
}
test('Duplicate object analysis works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield gatherSnapshots();
    yield testAnalysisFromAutoLoading();
    yield testAnalysisFromFileDir(result);
    yield testAnalysisWithSpecifiedWorkDir(result);
}), E2ETestSettings_1.testTimeout);
