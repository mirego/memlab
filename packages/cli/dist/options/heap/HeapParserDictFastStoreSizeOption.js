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
class HeapParserDictFastStoreSizeOption extends core_1.BaseOption {
    getOptionName() {
        return OptionConstant_1.default.optionNames.HEAP_PARSER_DICT_FAST_STORE_SIZE;
    }
    getDescription() {
        return ('the size threshold for swtiching from fast store to slower store in ' +
            'the heap snapshot parser. The default value is 5,000,000. If you get ' +
            'the `FATAL ERROR: invalid table size Allocation failed - JavaScript ' +
            'heap out of memory` error, try to decrease the threshold here');
    }
    getExampleValues() {
        return ['500000', '1000000'];
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getOptionName() in args) {
                const sizeThreshold = parseInt(args[this.getOptionName()], 10);
                if (!isNaN(sizeThreshold)) {
                    if (sizeThreshold <= 0 || sizeThreshold > 10000000) {
                        core_1.utils.haltOrThrow(`Invalid value for ${this.getOptionName()}: ${sizeThreshold}. ` +
                            'Valid range is [1, 10_000_000]');
                    }
                    config.heapParserDictFastStoreSize = sizeThreshold;
                }
            }
        });
    }
}
exports.default = HeapParserDictFastStoreSizeOption;
