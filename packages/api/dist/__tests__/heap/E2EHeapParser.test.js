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
const HeapParserTestUtils_1 = require("./lib/HeapParserTestUtils");
beforeEach(() => {
    core_1.config.isTest = true;
});
const timeout = 5 * 60 * 1000;
test('Capture numeric value from heap in browser', () => __awaiter(void 0, void 0, void 0, function* () {
    const leakInjector = () => {
        class TestObject {
            constructor() {
                this.numProp = 0.1;
            }
        }
        window.injected = new TestObject();
    };
    const checker = (snapshot) => {
        let detected = false;
        snapshot.nodes.forEach((node) => {
            if (node.name !== 'TestObject' || node.type !== 'object') {
                return;
            }
            const refs = node.references;
            for (const ref of refs) {
                if (ref.name_or_index === 'numProp') {
                    const node = ref.toNode;
                    if (node.type === 'number' &&
                        core_1.utils.getNumberNodeValue(node) === 0.1) {
                        detected = true;
                    }
                    break;
                }
            }
        });
        return detected;
    };
    yield (0, HeapParserTestUtils_1.isExpectedSnapshot)(leakInjector, checker);
}), timeout);
