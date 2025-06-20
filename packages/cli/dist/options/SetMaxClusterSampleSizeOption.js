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
class SetMaxClusterSampleSizeOption extends core_1.BaseOption {
    getOptionName() {
        return OptionConstant_1.default.optionNames.MAX_CLUSTER_SAMPLE_SIZE;
    }
    getDescription() {
        return ('specify the max number of leak traces as input to leak trace ' +
            'clustering algorithm. Big sample size will preserve more complete ' +
            'inforrmation, but may risk out-of-memory crash.');
    }
    getExampleValues() {
        return ['5000', '10000'];
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args[this.getOptionName()]) {
                const sampleSize = parseInt(args[this.getOptionName()], 10);
                if (!isNaN(sampleSize)) {
                    config.maxSamplesForClustering = sampleSize;
                }
            }
        });
    }
}
exports.default = SetMaxClusterSampleSizeOption;
