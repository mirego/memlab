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
const BaseOperation_1 = __importDefault(require("./BaseOperation"));
// Takes a pageFunction and variable name,
// calls the pageFunction with the argument 'page',
// and saves the result to the utils.memCache object with varName as the key
class CachePageContent extends BaseOperation_1.default {
    constructor(pageFunction, varName) {
        super();
        this.kind = 'cache-page-content';
        this.pageFunction = pageFunction;
        this.varName = varName;
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const varValue = yield this.pageFunction(page);
            if (varValue == null) {
                core_1.utils.haltOrThrow(`CachePageContent: Provided pageFunction returned ${varValue}`);
            }
            core_1.utils.memCache[this.varName] = varValue;
        });
    }
}
exports.default = CachePageContent;
