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
const BackOperation_1 = __importDefault(require("./operations/BackOperation"));
const RevertOperation_1 = __importDefault(require("./operations/RevertOperation"));
const backStep = {
    name: 'back',
    url: '',
    interactions: [new BackOperation_1.default()],
};
const revertStep = {
    name: 'revert',
    url: '',
    interactions: [new RevertOperation_1.default()],
};
exports.default = {
    backStep,
    revertStep,
};
