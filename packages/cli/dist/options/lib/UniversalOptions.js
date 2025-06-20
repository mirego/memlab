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
const DebugOption_1 = __importDefault(require("../DebugOption"));
const HelperOption_1 = __importDefault(require("../HelperOption"));
const SetContinuousTestOption_1 = __importDefault(require("../SetContinuousTestOption"));
const SilentOption_1 = __importDefault(require("../SilentOption"));
const VerboseOption_1 = __importDefault(require("../VerboseOption"));
const universalOptions = [
    new HelperOption_1.default(),
    new VerboseOption_1.default(),
    new SetContinuousTestOption_1.default(),
    new DebugOption_1.default(),
    new SilentOption_1.default(),
];
exports.default = universalOptions;
