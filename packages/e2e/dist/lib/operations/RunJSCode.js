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
const InteractionUtils_1 = __importDefault(require("./InteractionUtils"));
// Run a JS callback in web console
class RunJSCode extends BaseOperation_1.default {
    constructor(callback, opt = {}) {
        super();
        this.kind = 'run-js-code';
        this.callback = callback;
        this.repeat = opt.repeat != null && opt.repeat > 0 ? opt.repeat : 1;
        this.args = opt.args || [];
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let n = this.repeat;
                while (n-- > 0) {
                    yield page.evaluate(this.callback, ...this.args);
                    yield InteractionUtils_1.default.waitFor(1000);
                }
            }
            catch (e) {
                core_1.info.warning(core_1.utils.getError(e).message);
            }
        });
    }
}
exports.default = RunJSCode;
