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
const OptionConstant_1 = __importDefault(require("./lib/OptionConstant"));
class MLClusteringMaxDFOption extends core_2.BaseOption {
    getOptionName() {
        return OptionConstant_1.default.optionNames.ML_CLUSTERING_MAX_DF;
    }
    getDescription() {
        return 'set percentage based max document frequency for limiting the terms that appear too often';
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = this.getOptionName();
            const arg = args[name];
            if (arg) {
                const clusteringMaxDFStr = arg;
                const clusteringMaxDF = parseFloat(clusteringMaxDFStr);
                if (!isNaN(clusteringMaxDF) &&
                    clusteringMaxDF >= 0 &&
                    clusteringMaxDF <= 1) {
                    config.mlMaxDF = clusteringMaxDF;
                }
                else {
                    core_1.utils.haltOrThrow(`ml-clustering-max-df is not number between [0, 1]. ml-clustering-max-df=${clusteringMaxDF}`);
                }
            }
        });
    }
}
exports.default = MLClusteringMaxDFOption;
