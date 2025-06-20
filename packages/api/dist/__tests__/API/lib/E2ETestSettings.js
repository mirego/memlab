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
exports.getUniqueID = exports.testSetup = exports.scenario = exports.defaultAnalysisArgs = exports.testTimeout = void 0;
const core_1 = require("@memlab/core");
exports.testTimeout = 5 * 60 * 1000;
exports.defaultAnalysisArgs = { args: { _: [] } };
exports.scenario = {
    app: () => 'test-spa',
    url: () => '',
    action: (page) => __awaiter(void 0, void 0, void 0, function* () { return yield page.click('[data-testid="link-4"]'); }),
};
const testSetup = () => {
    core_1.config.isTest = true;
    core_1.config.useXVFB = false;
    core_1.config.skipExtraOps = true;
    core_1.config.errorHandling = core_1.ErrorHandling.Throw;
};
exports.testSetup = testSetup;
let uindex = 1;
function getUniqueID() {
    return `${process.pid}-${Date.now()}-${uindex++}`;
}
exports.getUniqueID = getUniqueID;
