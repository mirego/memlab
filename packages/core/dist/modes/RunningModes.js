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
const Utils_1 = __importDefault(require("../lib/Utils"));
const BaseMode_1 = __importDefault(require("./BaseMode"));
const InteractionTestMode_1 = __importDefault(require("./InteractionTestMode"));
const MeasureMode_1 = __importDefault(require("./MeasureMode"));
exports.default = {
    get(name, config) {
        let ret;
        switch (name) {
            case 'regular':
                ret = new BaseMode_1.default();
                break;
            case 'interaction-test':
                ret = new InteractionTestMode_1.default();
                break;
            case 'measure':
                ret = new MeasureMode_1.default();
                break;
            default:
                throw Utils_1.default.haltOrThrow(`unknown running mode: ${name}`);
        }
        if (config) {
            ret.setConfig(config);
        }
        return ret;
    },
};
