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
const core_1 = require("@memlab/core");
class TestObject {
    constructor() {
        this.arr1 = [1, 2, 3];
        this.arr2 = ['1', '2', '3'];
    }
}
test('memory test', () => __awaiter(void 0, void 0, void 0, function* () {
    core_1.config.muteConsole = true;
    let obj = new TestObject();
    // get a heap snapshot of the current program state
    let heap = yield (0, core_1.takeNodeMinimalHeap)();
    // call some function that may add references to obj
    // rabbitHole()
    expect(heap.hasObjectWithClassName('TestObject')).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    obj = null;
    heap = yield (0, core_1.takeNodeMinimalHeap)();
    // if rabbitHole does not add new references, the obj can be GCed
    expect(heap.hasObjectWithClassName('TestObject')).toBe(false);
}), 60000);
