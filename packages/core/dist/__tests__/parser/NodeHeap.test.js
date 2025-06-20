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
const Config_1 = __importDefault(require("../../lib/Config"));
const NodeHeap_1 = require("../../lib/NodeHeap");
beforeEach(() => {
    Config_1.default.isTest = true;
});
const timeout = 5 * 60 * 1000;
test('Capture current node heap snapshot', () => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const object = { 'memlab-test-heap-property': 'memlab-test-heap-value' };
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    expect(heap.hasObjectWithPropertyName('memlab-test-heap-property')).toBe(true);
}), timeout);
test('Nullified Object should not exist in heap', () => __awaiter(void 0, void 0, void 0, function* () {
    let object = {
        'memlab-test-heap-property': 'memlab-test-heap-value',
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    object = null;
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    expect(heap.hasObjectWithPropertyName('memlab-test-heap-property')).toBe(false);
}), timeout);
test('Strongly referenced object should exist in heap', () => __awaiter(void 0, void 0, void 0, function* () {
    class TestClass2 {
        constructor() {
            this.p1 = 'memlab-property-value-3';
        }
    }
    class TestClass1 {
        constructor(o) {
            this.set = new Set();
            this.set.add(o);
        }
    }
    function buildTest() {
        return new TestClass1(new TestClass2());
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const object = buildTest();
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    expect(heap.hasObjectWithClassName('TestClass1')).toBe(true);
    expect(heap.hasObjectWithClassName('TestClass2')).toBe(true);
}), timeout);
test('Weakly referenced object should not exist in heap', () => __awaiter(void 0, void 0, void 0, function* () {
    class TestClass4 {
        constructor() {
            this.p1 = 'memlab-property-value-3';
        }
    }
    class TestClass3 {
        constructor(o) {
            this.set = new WeakSet();
            this.set.add(o);
        }
    }
    function buildTest() {
        return new TestClass3(new TestClass4());
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const object = buildTest();
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    expect(heap.hasObjectWithClassName('TestClass3')).toBe(true);
    expect(heap.hasObjectWithClassName('TestClass4')).toBe(false);
}), timeout);
test('Check annotated objects', () => __awaiter(void 0, void 0, void 0, function* () {
    const o1 = {};
    let o2 = {};
    (0, NodeHeap_1.tagObject)(o1, 'memlab-mark-1');
    (0, NodeHeap_1.tagObject)(o2, 'memlab-mark-2');
    o2 = null;
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    expect(heap.hasObjectWithTag('memlab-mark-1')).toBe(true);
    expect(heap.hasObjectWithTag('memlab-mark-2')).toBe(false);
}), timeout);
