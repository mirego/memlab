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
const core_2 = require("@memlab/core");
const OptionConstant_1 = __importDefault(require("../lib/OptionConstant"));
const OversizeThresholdOption_1 = __importDefault(require("./OversizeThresholdOption"));
const optionMapping = new Map([
    ['selected-js-objects', core_2.TraceObjectMode.SelectedJSObjects],
    ['default', core_2.TraceObjectMode.Default],
]);
class TraceAllObjectsOption extends core_2.BaseOption {
    getOptionName() {
        return OptionConstant_1.default.optionNames.TRACE_ALL_OBJECTS;
    }
    getDescription() {
        return ('dump retainer trace for all allocated objects (ignore the leak filter), ' +
            `available option modes: ${this.getAvailableOptions().join(', ')}`);
    }
    getAvailableOptions() {
        return Array.from(optionMapping.keys()).map(mode => `--${this.getOptionName()}=${mode}`);
    }
    getMode(optionValue) {
        // if the user specified an option value (--flag=value instead of --flag)
        if (typeof optionValue === 'boolean') {
            return optionMapping.get('default');
        }
        if (!optionMapping.has(optionValue)) {
            throw core_1.utils.haltOrThrow(`Unknown option value ${optionValue}. ` +
                `Available options: ${this.getAvailableOptions().join(', ')}`);
        }
        return optionMapping.get(optionValue);
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const optionValue = args[this.getOptionName()];
            if (optionValue == null) {
                return;
            }
            config.oversizeObjectAsLeak = true;
            const overSizeOptionName = new OversizeThresholdOption_1.default().getOptionName();
            // oversize option will set the oversize threshold
            if (!args[overSizeOptionName]) {
                config.oversizeThreshold = 0;
            }
            config.traceAllObjectsMode = this.getMode(optionValue);
        });
    }
}
exports.default = TraceAllObjectsOption;
