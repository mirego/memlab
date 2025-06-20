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
const heap_analysis_1 = require("@memlab/heap-analysis");
const index_1 = require("../../index");
const E2ETestSettings_1 = require("../API/lib/E2ETestSettings");
const API_1 = require("../../API");
beforeEach(E2ETestSettings_1.testSetup);
function injectTestObject() {
    class TestObject {
    }
    // @ts-ignore
    window.injectHookForLink4 = () => {
        // @ts-ignore
        const arr = (window.__injectedValue = window.__injectedValue || []);
        arr.push(new TestObject());
    };
}
const selfDefinedScenario = {
    app: () => 'test-spa',
    url: () => '',
    action: (page) => __awaiter(void 0, void 0, void 0, function* () { return yield page.click('[data-testid="link-4"]'); }),
    repeat: () => 3,
};
class ExampleAnalysis extends heap_analysis_1.BaseAnalysis {
    constructor() {
        super(...arguments);
        this.isMonotonicIncreasing = false;
    }
    getCommandName() {
        return 'example-analysis';
    }
    getDescription() {
        return 'an example analysis for demo';
    }
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if the number of TestObject keeps growing overtime
            this.isMonotonicIncreasing = yield (0, heap_analysis_1.snapshotMapReduce)(heap => {
                let cnt = 0;
                heap.nodes.forEach(node => {
                    if (node.name === 'TestObject' && node.type === 'object') {
                        ++cnt;
                    }
                });
                return cnt;
            }, nodeCounts => nodeCounts[0] === 0 &&
                nodeCounts[nodeCounts.length - 1] === 4 &&
                nodeCounts.every((count, i) => i === 0 || count >= nodeCounts[i - 1]), options);
        });
    }
}
test('snapshotMapReduce works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield (0, API_1.takeSnapshots)({
        scenario: selfDefinedScenario,
        evalInBrowserAfterInitLoad: injectTestObject,
        snapshotForEachStep: true,
    });
    let analysis = new ExampleAnalysis();
    yield (0, index_1.analyze)(results, analysis);
    expect(analysis.isMonotonicIncreasing).toBe(true);
    analysis = new ExampleAnalysis();
    yield analysis.analyzeSnapshotsInDirectory(results.getSnapshotFileDir());
    expect(analysis.isMonotonicIncreasing).toBe(true);
}), E2ETestSettings_1.testTimeout);
