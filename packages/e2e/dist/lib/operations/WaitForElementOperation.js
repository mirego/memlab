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
/**
 * This operation waits for an element matching the given selector. It only
 * fails if the given selector does not come to exist within the timeout
 * specified in `checkIfPresent`. If you want to invert this behavior and wait
 * for it to disappear, pass the option `{waitForElementTo: 'disappear'}`.
 * Furthermore, if you want to ensure that the element not only comes to exist
 * but is visible (ie. neither `display:none` nor `visibility:hidden`) then pass
 * the option `{waitForElementTo: 'appear'}`.
 */
class WaitForElementOperation extends BaseOperation_1.default {
    constructor(selector, options = {}) {
        super();
        this.kind = 'wait-for-element';
        this.selector = selector;
        this.waitForElementTo = options.waitForElementTo || 'exist';
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Waiting for \`${this.selector}\` to ${this.waitForElementTo}`);
            const waitForElementTo = this.waitForElementTo;
            switch (waitForElementTo) {
                case 'appear':
                    if (!(yield InteractionUtils_1.default.checkIfVisible(page, this.selector))) {
                        core_1.utils.haltOrThrow(`Element \`${this.selector}\` did not become visible`);
                    }
                    break;
                case 'exist':
                    if (!(yield InteractionUtils_1.default.checkIfPresent(page, this.selector))) {
                        core_1.utils.haltOrThrow(`Cannot find element \`${this.selector}\``);
                    }
                    break;
                case 'disappear':
                    if (!(yield InteractionUtils_1.default.waitForDisappearance(page, this.selector))) {
                        core_1.utils.haltOrThrow(`Element \`${this.selector}\` did not disappear`);
                    }
                    break;
            }
        });
    }
}
exports.default = WaitForElementOperation;
