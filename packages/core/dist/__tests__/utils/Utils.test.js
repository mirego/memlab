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
const Utils_1 = __importDefault(require("../../lib/Utils"));
beforeEach(() => {
    Config_1.default.isTest = true;
});
const strackTraceFrameNodeMock = {
    type: 'hidden',
    name: 'system / StackTraceFrame',
};
const oddBallNodeMock = { name: 'system / Oddball' };
const detachedFiberNodeMock = {
    type: 'object',
    name: 'Detached FiberNode',
};
const fiberNodeMock = { type: 'object', name: 'FiberNode' };
const weakMapEdgeMock = {
    type: 'internal',
    name_or_index: '4 / part of key Object @474899 -> value Object @474901 pair in WeakMap table @654951',
};
const edgeMock = {
    type: 'property',
    name_or_index: 'intersectionObserver',
};
test('Check getReadableBytes', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(Utils_1.default.getReadableBytes(0)).toBe('0 byte');
    expect(Utils_1.default.getReadableBytes(1)).toBe('1 byte');
    expect(Utils_1.default.getReadableBytes(2)).toBe('2 bytes');
    expect(Utils_1.default.getReadableBytes(10)).toBe('10 bytes');
    expect(Utils_1.default.getReadableBytes(1000)).toBe('1KB');
    expect(Utils_1.default.getReadableBytes(1010)).toBe('1KB');
    expect(Utils_1.default.getReadableBytes(1130)).toBe('1.1KB');
    expect(Utils_1.default.getReadableBytes(1200000)).toBe('1.2MB');
    expect(Utils_1.default.getReadableBytes(980000000)).toBe('980MB');
    expect(Utils_1.default.getReadableBytes(2212312313)).toBe('2.2GB');
    expect(Utils_1.default.getReadableBytes(5432212312313)).toBe('5.4TB');
}));
test('Check isStackTraceFrame', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(Utils_1.default.isStackTraceFrame(strackTraceFrameNodeMock)).toBe(true);
    expect(Utils_1.default.isStackTraceFrame(oddBallNodeMock)).toBe(false);
    expect(Utils_1.default.isStackTraceFrame(detachedFiberNodeMock)).toBe(false);
    expect(Utils_1.default.isStackTraceFrame(fiberNodeMock)).toBe(false);
}));
test('Check isDetachedFiberNode', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(Utils_1.default.isDetachedFiberNode(detachedFiberNodeMock)).toBe(true);
    expect(Utils_1.default.isDetachedFiberNode(fiberNodeMock)).toBe(false);
    expect(Utils_1.default.isDetachedFiberNode(strackTraceFrameNodeMock)).toBe(false);
    expect(Utils_1.default.isDetachedFiberNode(oddBallNodeMock)).toBe(false);
}));
test('Check isFiberNode', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(Utils_1.default.isFiberNode(detachedFiberNodeMock)).toBe(true);
    expect(Utils_1.default.isFiberNode(fiberNodeMock)).toBe(true);
    expect(Utils_1.default.isFiberNode(strackTraceFrameNodeMock)).toBe(false);
    expect(Utils_1.default.isFiberNode(oddBallNodeMock)).toBe(false);
}));
test('Check isWeakMapEdge', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(Utils_1.default.isWeakMapEdge(weakMapEdgeMock)).toBe(true);
    expect(Utils_1.default.isWeakMapEdge(edgeMock)).toBe(false);
}));
