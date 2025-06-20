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
test('String heap object APIs work', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    class TestObject {
        constructor() {
            this.originalString = 'test';
            this.concatedString = 'prefix_';
            this.complexConcatString = 'prefix_';
        }
    }
    const injected = new TestObject();
    injected.concatedString += 'suffix';
    injected.complexConcatString += 'value_';
    injected.complexConcatString += 123;
    injected.complexConcatString += '_suffix';
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    const testObject = heap.getAnyObjectWithClassName('TestObject');
    expect(testObject).not.toBe(null);
    // test the number of referrers getter
    expect(testObject === null || testObject === void 0 ? void 0 : testObject.numOfReferrers).toBeGreaterThan(0);
    // testObject.originalString === 'test'
    const originalString = testObject === null || testObject === void 0 ? void 0 : testObject.getReferenceNode('originalString');
    expect(originalString === null || originalString === void 0 ? void 0 : originalString.isString).toBe(true);
    expect((_a = originalString === null || originalString === void 0 ? void 0 : originalString.toStringNode()) === null || _a === void 0 ? void 0 : _a.stringValue).toBe('test');
    // testObject.concatedString === 'prefix_suffix';
    const concatString = testObject === null || testObject === void 0 ? void 0 : testObject.getReferenceNode('concatedString');
    expect(concatString === null || concatString === void 0 ? void 0 : concatString.type).toBe('concatenated string');
    expect(concatString === null || concatString === void 0 ? void 0 : concatString.isString).toBe(true);
    expect((_b = concatString === null || concatString === void 0 ? void 0 : concatString.toStringNode()) === null || _b === void 0 ? void 0 : _b.stringValue).toBe('prefix_suffix');
    // testObject.complexConcatString === 'prefix_value_123_suffix';
    const complexConcatString = testObject === null || testObject === void 0 ? void 0 : testObject.getReferenceNode('complexConcatString');
    expect(complexConcatString === null || complexConcatString === void 0 ? void 0 : complexConcatString.type).toBe('concatenated string');
    expect(complexConcatString === null || complexConcatString === void 0 ? void 0 : complexConcatString.isString).toBe(true);
    expect((_c = complexConcatString === null || complexConcatString === void 0 ? void 0 : complexConcatString.toStringNode()) === null || _c === void 0 ? void 0 : _c.stringValue).toBe('prefix_value_123_suffix');
    // test the toJSONString API
    let strRepresentation = (_d = concatString === null || concatString === void 0 ? void 0 : concatString.toJSONString()) !== null && _d !== void 0 ? _d : '{}';
    let rep = JSON.parse(strRepresentation);
    expect(rep.type).toBe('concatenated string');
    expect(rep.stringValue).toBe(void 0);
    strRepresentation = (_f = (_e = concatString === null || concatString === void 0 ? void 0 : concatString.toStringNode()) === null || _e === void 0 ? void 0 : _e.toJSONString()) !== null && _f !== void 0 ? _f : '{}';
    rep = JSON.parse(strRepresentation);
    expect(rep.type).toBe('concatenated string');
    expect(rep.stringValue).toBe('prefix_suffix');
}), timeout);
