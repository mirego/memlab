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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@memlab/core");
const core_2 = require("@memlab/core");
class HeapAnalysisOutputOption extends core_2.BaseOption {
    getOptionName() {
        return 'output';
    }
    getDescription() {
        const options = this.getExampleValues()
            .map(v => `'${v}'`)
            .join(', ');
        return ('specify output format of the analysis ' +
            `(available options: ${options}; defaults to 'text')`);
    }
    getExampleValues() {
        return ['text', 'json'];
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = this.getOptionName();
            const format = args[name] == null ? 'text' : `${args[name]}`;
            config.outputFormat = HeapAnalysisOutputOption.parseOutputFormat(format);
            if (config.outputFormat === core_1.OutputFormat.Json) {
                config.isContinuousTest = true;
            }
        });
    }
    static parseOutputFormat(s) {
        switch (s.toLowerCase()) {
            case 'text':
                return core_1.OutputFormat.Text;
            case 'json':
                return core_1.OutputFormat.Json;
            default:
                core_1.utils.haltOrThrow('Invalid output format, valid output: text, json');
                return core_1.OutputFormat.Text;
        }
    }
}
exports.default = HeapAnalysisOutputOption;
