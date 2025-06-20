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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@memlab/core");
const index_1 = require("../index");
beforeEach(() => {
    core_1.config.isTest = true;
});
const timeout = 5 * 60 * 1000;
test('loadHeapSnapshot works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    let called = false;
    class ExampleAnalysis extends index_1.BaseAnalysis {
        getCommandName() {
            return 'example-analysis';
        }
        getDescription() {
            return 'an example analysis for demo';
        }
        process(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const heap = yield (0, index_1.loadHeapSnapshot)(options);
                called = true;
                expect(heap.nodes.length > 0).toBe(true);
            });
        }
    }
    const analysis = new ExampleAnalysis();
    yield analysis.analyzeSnapshotFromFile((0, core_1.dumpNodeHeapSnapshot)());
    expect(called).toBe(true);
}), timeout);
test('analyzeSnapshotFromFile works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    let called = false;
    const heapFile = (0, core_1.dumpNodeHeapSnapshot)();
    class ExampleAnalysis extends index_1.BaseAnalysis {
        getCommandName() {
            return 'example-analysis';
        }
        getDescription() {
            return 'an example analysis for demo';
        }
        process(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const file = (0, index_1.getSnapshotFileForAnalysis)(options);
                called = true;
                expect(file).toBe(heapFile);
            });
        }
    }
    const analysis = new ExampleAnalysis();
    yield analysis.analyzeSnapshotFromFile(heapFile);
    expect(called).toBe(true);
}), timeout);
test('getFullHeapFromFile works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const heapFile = (0, core_1.dumpNodeHeapSnapshot)();
    const heap = yield (0, index_1.getFullHeapFromFile)(heapFile);
    expect(heap.nodes.length > 0).toBe(true);
}), timeout);
test('getDominatorNodes works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    class TestObject {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const t1 = new TestObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const t2 = new TestObject();
    // dump the heap of this running JavaScript program
    const heapFile = (0, core_1.dumpNodeHeapSnapshot)();
    const heap = yield (0, index_1.getFullHeapFromFile)(heapFile);
    // find the heap node for TestObject
    const nodes = [];
    heap.nodes.forEach(node => {
        if (node.name === 'TestObject' && node.type === 'object') {
            nodes.push(node);
        }
    });
    // get the dominator nodes
    const dominatorIds = (0, index_1.getDominatorNodes)(new Set(nodes.map(node => node.id)), heap);
    expect(dominatorIds.size).toBeGreaterThan(0);
}), timeout);
