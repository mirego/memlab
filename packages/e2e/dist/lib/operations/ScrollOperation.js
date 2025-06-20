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
class ScrollOperation extends BaseOperation_1.default {
    constructor(strideLength, repeat = 1, opt = {}) {
        super();
        this.kind = 'scroll';
        this.strideLength = strideLength;
        this.repeat = repeat;
        // by default scroll down (1 means down, -1 means up)
        this.scrollDirection = opt.scrollUp ? -1 : 1;
        // by default scrollback to the beginning
        this.scrollBack =
            typeof opt.scrollBack === 'boolean' ? opt.scrollBack : true;
    }
    act(page, opArgs = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.disableScroll || !core_1.config.runningMode.shouldScroll()) {
                return;
            }
            let repeat = this.repeat;
            let i = 0;
            let totalScrollDistance = 0;
            const direction = this.scrollDirection > 0 ? 'down' : 'up';
            core_1.info.lowLevel(`scrolling ${direction} ${repeat} times...`);
            const strideLength = this.scrollDirection * this.strideLength;
            while (repeat-- > 0) {
                totalScrollDistance += strideLength;
                yield scroll(page, strideLength, ++i, opArgs);
            }
            if (this.scrollBack && totalScrollDistance > 0) {
                // scroll back to the top
                yield scroll(page, -1 * totalScrollDistance, -1, opArgs);
            }
            return;
        });
    }
}
function scroll(page, dist, idx = 0, opArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        core_1.info.beginSection('scroll');
        yield InteractionUtils_1.default.waitUntilLoaded(page, opArgs);
        if (idx > 1) {
            core_1.info.overwrite(`(${idx}x) scrolling ${dist}px...`);
        }
        else {
            core_1.info.overwrite(`scrolling ${dist}px...`);
        }
        yield page.evaluate(dist => {
            try {
                window.scrollBy({ top: dist });
            }
            catch (_e) {
                // to nothing
            }
        }, dist);
        yield InteractionUtils_1.default.waitUntilLoaded(page, opArgs);
        yield InteractionUtils_1.default.waitFor(core_1.config.waitAfterScrolling);
        core_1.info.endSection('scroll');
    });
}
exports.default = ScrollOperation;
