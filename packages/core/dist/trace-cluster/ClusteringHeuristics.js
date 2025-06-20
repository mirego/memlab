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
const InternalValueSetter_1 = require("../lib/InternalValueSetter");
const Constant_1 = __importDefault(require("../lib/Constant"));
exports.default = (0, InternalValueSetter_1.setInternalValue)({
    edgeNameStopWords: new Map(),
    nodeNameStopWords: new Map(),
    similarWordRegExps: new Map(),
    decendentDecayFactors: [],
    startingModuleForTraceMatching: [],
}, __filename, Constant_1.default.internalDir);
