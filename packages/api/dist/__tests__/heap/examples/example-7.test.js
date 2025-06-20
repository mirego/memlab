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
test('memory test', () => __awaiter(void 0, void 0, void 0, function* () {
    core_1.config.muteConsole = true;
    const o1 = {};
    let o2 = {};
    // tag o1 with marker: "memlab-mark-1"
    (0, core_1.tagObject)(o1, 'memlab-mark-1');
    // tag o2 with marker: "memlab-mark-2"
    (0, core_1.tagObject)(o2, 'memlab-mark-2');
    o2 = null;
    const heap = yield (0, core_1.takeNodeMinimalHeap)();
    // expect object with marker "memlab-mark-1" exists
    expect(heap.hasObjectWithTag('memlab-mark-1')).toBe(true);
    // expect object with marker "memlab-mark-2" can be GCed
    expect(heap.hasObjectWithTag('memlab-mark-2')).toBe(false);
}), 60000);
