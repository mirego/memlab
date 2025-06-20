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
class ClickOperation extends BaseOperation_1.default {
    constructor(selector, args = {}) {
        super();
        this.kind = 'click';
        this.selector = selector;
        this.delay = args.delay;
        this.optional = !!args.optional;
        this.waitFor = args.waitFor;
        this.clickCount = args.clickCount;
        this.indexInMatches = args.indexInMatches;
        // Takes a selector (string) to check if the selector is present or takes
        // a function and evaluates that function to conditionally do the click
        // operation
        this.if = args.if;
    }
    _shouldClick(page) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.if == null) {
                return true;
            }
            let shouldClick;
            if (typeof this.if === 'string') {
                const element = yield page.$(this.if);
                shouldClick = !!element;
                if (element != null) {
                    yield element.dispose();
                }
            }
            else if (typeof this.if === 'function') {
                shouldClick = yield this.if(page);
            }
            else {
                throw core_1.utils.haltOrThrow(`ClickOperation: 'if' must be a string or function`);
            }
            return shouldClick;
        });
    }
    useContains() {
        return this.selector.startsWith('contains:');
    }
    // click element with specified settings
    clickElement(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const clickCount = this.clickCount || 1;
            if (!this.useContains() && this.indexInMatches == null) {
                yield page.click(this.selector, { clickCount });
                return;
            }
            let elems;
            // if given a special contains-text selector
            if (this.useContains()) {
                const text = this.selector.slice('contains:'.length);
                elems = yield InteractionUtils_1.default.getElementsContainingText(page, text);
            }
            else {
                elems = yield page.$$(this.selector);
            }
            if (!elems || elems.length === 0) {
                core_1.utils.haltOrThrow(`selector not found: ${this.selector}`);
            }
            let idx = this.indexInMatches != null ? this.indexInMatches : 0;
            if (idx < 0) {
                idx = elems.length + idx;
            }
            if (idx < 0 || idx >= elems.length) {
                core_1.utils.haltOrThrow(`clicking ${idx + 1}-th element, which doesn't exist`);
            }
            yield elems[idx].click({ clickCount });
            yield Promise.all(elems.map(e => e.dispose()));
        });
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const shouldClick = yield this._shouldClick(page);
            if (!shouldClick) {
                return;
            }
            const present = yield InteractionUtils_1.default.checkIfPresent(page, this.selector, this.optional);
            if (!present) {
                if (!this.optional) {
                    core_1.utils.haltOrThrow(`Cannot find element ${this.selector}`);
                }
                return; // if optional element is not found
            }
            this.log(`clicking ${this.selector}`);
            yield this.clickElement(page);
            // extra delay
            const delay = this.delay != null ? this.delay : core_1.config.defaultAfterClickDelay;
            yield InteractionUtils_1.default.waitFor(delay);
            // waiting for elements
            if (this.waitFor != null) {
                if (typeof this.waitFor === 'string') {
                    yield InteractionUtils_1.default.waitForSelector(page, this.waitFor, 'exist', this.optional);
                }
                else if (typeof this.waitFor === 'function') {
                    yield this.waitFor(page);
                }
                else {
                    core_1.info.error(`ClickOperation: 'waitFor' must be a string or function`);
                }
            }
        });
    }
}
exports.default = ClickOperation;
