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
const ClickOperation_1 = __importDefault(require("./ClickOperation"));
const InteractionUtils_1 = __importDefault(require("./InteractionUtils"));
class TypeOperation extends BaseOperation_1.default {
    constructor(selector, inputText, args = {}) {
        var _a;
        super();
        this.kind = 'type';
        this.selector = selector;
        this.inputText = inputText;
        this.clear = !!args.clear;
        this.randomSuffix = !!args.randomSuffix;
        this.delay = (_a = args.delay) !== null && _a !== void 0 ? _a : 0;
    }
    clearInput(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const click = new ClickOperation_1.default(this.selector, { clickCount: 3 });
            yield click.act(page);
            yield page.keyboard.press('Backspace');
            yield InteractionUtils_1.default.waitFor(100);
        });
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.clear) {
                yield this.clearInput(page);
                yield InteractionUtils_1.default.waitFor(2000);
            }
            const suffix = this.randomSuffix ? `${Math.random()}` : '';
            const textToType = this.inputText + suffix;
            this.log(`Typing "${textToType}"`);
            yield page.type(this.selector, textToType, { delay: 100 });
            yield InteractionUtils_1.default.waitFor(core_1.config.waitAfterTyping);
            if (this.delay > 0) {
                yield InteractionUtils_1.default.waitFor(this.delay);
            }
        });
    }
}
exports.default = TypeOperation;
