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
const index_1 = require("../../index");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
beforeEach(E2ETestSettings_1.testSetup);
// clear the page reload check in setup
// to check that the page reload check should
// be injected after the setup callback
const setup = (page) => __awaiter(void 0, void 0, void 0, function* () {
    yield page.evaluate(() => {
        // @ts-ignore
        delete window.__memlab_check_reload;
    });
});
test('reload in setup is fine', () => __awaiter(void 0, void 0, void 0, function* () {
    const { leaks } = yield (0, index_1.run)({
        scenario: Object.assign(Object.assign({}, E2ETestSettings_1.scenario), { setup }),
    });
    // no memory leaks are detected
    expect(leaks.length).toBe(0);
}), E2ETestSettings_1.testTimeout);
