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
exports.runPageInteractionFromCLI = void 0;
const core_1 = require("@memlab/core");
const api_1 = require("@memlab/api");
function runPageInteractionFromCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        try {
            yield (0, api_1.testInBrowser)();
        }
        catch (e) {
            const error = core_1.utils.getError(e);
            if (error.message.indexOf('cannot open display') < 0) {
                // fail due to other errors
                core_1.utils.haltOrThrow(error);
            }
            if (core_1.config.verbose) {
                core_1.info.lowLevel('failed to start Chrome with display, disabling xvfb...');
            }
            core_1.config.machineSupportsXVFB = false;
            core_1.config.disableXvfb();
            yield (0, api_1.testInBrowser)();
        }
        const end = Date.now();
        core_1.info.topLevel(`total time: ${core_1.utils.getReadableTime(end - start)}`);
    });
}
exports.runPageInteractionFromCLI = runPageInteractionFromCLI;
