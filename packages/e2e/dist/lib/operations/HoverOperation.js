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
class HoverOperation extends BaseOperation_1.default {
    constructor(selector, args = {}) {
        super();
        this.kind = 'hover';
        this.selector = selector;
        this.delay = args.delay;
        this.optional = !!args.optional;
        this.indexInMatches = args.indexInMatches;
    }
    // hover over element with specified settings
    hoverOverElement(page) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.indexInMatches == null) {
                yield page.hover(this.selector);
                return;
            }
            const elems = yield page.$$(this.selector);
            if (!elems || elems.length === 0) {
                core_1.utils.haltOrThrow(`selector not found: ${this.selector}`);
            }
            let idx = this.indexInMatches;
            if (idx < 0) {
                idx = elems.length + idx;
            }
            if (idx < 0 || idx >= elems.length) {
                core_1.utils.haltOrThrow(`hovering over ${idx + 1}-th element, which doesn't exist`);
            }
            yield elems[idx].hover();
            yield Promise.all(elems.map(e => e.dispose()));
        });
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const present = yield InteractionUtils_1.default.checkIfPresent(page, this.selector);
            if (!present && !this.optional) {
                core_1.utils.haltOrThrow(`Cannot find element ${this.selector}`);
            }
            if (present) {
                this.log(`hovering over ${this.selector}`);
                yield this.hoverOverElement(page);
                const delay = this.delay != null ? this.delay : core_1.config.defaultAfterClickDelay;
                yield InteractionUtils_1.default.waitFor(delay);
            }
        });
    }
}
exports.default = HoverOperation;
