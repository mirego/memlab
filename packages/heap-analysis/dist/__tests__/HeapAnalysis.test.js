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
const __1 = require("..");
const HeapAnalysisLoader_1 = __importDefault(require("../HeapAnalysisLoader"));
beforeEach(() => {
    core_1.config.isTest = true;
});
const timeout = 5 * 60 * 1000;
test('Heap analysis modules can be loaded', () => __awaiter(void 0, void 0, void 0, function* () {
    const heapAnalysisMap = HeapAnalysisLoader_1.default.loadAllAnalysis();
    expect(heapAnalysisMap.size).toBeGreaterThan(0);
}), timeout);
test('takeNodeFullHeap works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    class TestClass {
        constructor() {
            this.name = 'test';
            this.age = 183;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _v = new TestClass();
    const heap = yield (0, __1.takeNodeFullHeap)();
    const node = heap.getAnyObjectWithClassName('TestClass');
    expect((node === null || node === void 0 ? void 0 : node.dominatorNode) != null).toBe(true);
    const size = (_a = node === null || node === void 0 ? void 0 : node.retainedSize) !== null && _a !== void 0 ? _a : 0;
    expect(size > 0).toBe(true);
}), timeout);
