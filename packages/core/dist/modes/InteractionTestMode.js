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
const BaseMode_1 = __importDefault(require("./BaseMode"));
// mode for running quick interaction test
class InteractionTestMode extends BaseMode_1.default {
    shouldGC() {
        return false;
    }
    shouldScroll() {
        return false;
    }
    shouldGetMetrics() {
        return false;
    }
    shouldUseConciseConsole() {
        return true;
    }
    shouldTakeScreenShot() {
        return false;
    }
    shouldTakeHeapSnapshot() {
        return false;
    }
    shouldExtraWaitForTarget() {
        return false;
    }
    shouldExtraWaitForFinal() {
        return false;
    }
    shouldRunExtraTargetOperations() {
        return false;
    }
}
exports.default = InteractionTestMode;
