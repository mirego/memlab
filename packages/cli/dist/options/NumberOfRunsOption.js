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
const OptionConstant_1 = __importDefault(require("./lib/OptionConstant"));
const DEFAULT_NUM_RUNS = 10;
class NumberOfRunsOption extends core_1.BaseOption {
    constructor(runNumber = DEFAULT_NUM_RUNS) {
        super();
        this.defaultRunNumber = DEFAULT_NUM_RUNS;
        this.defaultRunNumber = runNumber;
    }
    getOptionName() {
        return OptionConstant_1.default.optionNames.RUN_NUM;
    }
    getDescription() {
        return 'set number of runs';
    }
    getExampleValues() {
        return ['5'];
    }
    static getParsedOption(configFromOptions) {
        const { numOfRuns } = configFromOptions !== null && configFromOptions !== void 0 ? configFromOptions : {};
        const n = parseInt(`${numOfRuns}`, 10);
        return isNaN(n) ? DEFAULT_NUM_RUNS : n;
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = Object.create(null);
            const name = this.getOptionName();
            ret.numOfRuns = args[name] != null ? args[name] | 0 : this.defaultRunNumber;
            return ret;
        });
    }
}
exports.default = NumberOfRunsOption;
