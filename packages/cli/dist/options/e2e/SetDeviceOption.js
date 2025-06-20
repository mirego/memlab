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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@memlab/core");
const OptionConstant_1 = __importDefault(require("../lib/OptionConstant"));
const devices = core_1.constant.isFRL
    ? {}
    : core_1.constant.isFB
        ? require('puppeteer-core/DeviceDescriptors')
        : // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('puppeteer').KnownDevices;
class SetDeviceOption extends core_1.BaseOption {
    getOptionName() {
        return OptionConstant_1.default.optionNames.DEVICE;
    }
    getDescription() {
        return 'set the device type to emulate';
    }
    getExampleValues() {
        return Object.keys(devices);
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = this.getOptionName();
            const arg = args[name];
            if (arg) {
                config.setDevice(arg, { manualOverride: true });
            }
        });
    }
}
exports.default = SetDeviceOption;
