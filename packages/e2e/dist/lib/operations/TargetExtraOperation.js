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
const core_1 = require("@memlab/core");
const CompoundOperation_1 = __importDefault(require("./CompoundOperation"));
const ScrollOperation_1 = __importDefault(require("./ScrollOperation"));
class TargetExtraOperation extends CompoundOperation_1.default {
    constructor(operations = []) {
        super(operations);
        this.kind = 'target-extra';
        if (core_1.config.runningMode.shouldRunExtraTargetOperations()) {
            // scroll the window by certain amount of pixels
            this.operations.push(new ScrollOperation_1.default(core_1.config.windowHeight, core_1.config.scrollRepeat));
        }
    }
}
exports.default = TargetExtraOperation;
