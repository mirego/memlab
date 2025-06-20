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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandLoader_1 = __importDefault(require("../../../CommandLoader"));
const HelperCommand_1 = __importDefault(require("../../helper/HelperCommand"));
const GetRetainerTraceCommand_1 = __importDefault(require("../GetRetainerTraceCommand"));
const HeapAnalysisCommand_1 = __importDefault(require("../HeapAnalysisCommand"));
const commandToInclude = new Set([
    HeapAnalysisCommand_1.default,
    GetRetainerTraceCommand_1.default,
    HelperCommand_1.default,
]);
class InteractiveCommandLoader extends CommandLoader_1.default {
    shouldRegisterCommand(command) {
        const constructor = command.constructor;
        return commandToInclude.has(constructor);
    }
    postRegistration() {
        // do nothing
    }
}
exports.default = InteractiveCommandLoader;
