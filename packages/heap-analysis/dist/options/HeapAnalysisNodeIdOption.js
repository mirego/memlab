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
class HeapAnalysisNodeIdOption extends core_1.BaseOption {
    getOptionName() {
        return 'node-id';
    }
    getDescription() {
        return 'set heap node ID';
    }
    getExampleValues() {
        return ['94435', '@94435'];
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const optionName = this.getOptionName();
            const optionValue = args[optionName];
            if (optionValue) {
                if (typeof optionValue === 'string' && optionValue.startsWith('@')) {
                    args[optionName] = optionValue.slice(1);
                }
                config.focusFiberNodeId = Number(args[optionName]);
            }
        });
    }
}
exports.default = HeapAnalysisNodeIdOption;
