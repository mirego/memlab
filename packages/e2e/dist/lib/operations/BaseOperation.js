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
const InteractionUtils_1 = __importDefault(require("./InteractionUtils"));
let opId = 1; // operation index used in debug mode
class BaseOperation {
    constructor() {
        this.optional = false;
        this.kind = 'abstract';
        this.selector = '';
    }
    log(msg) {
        if (core_1.config.verbose) {
            core_1.info.lowLevel(msg);
        }
        else {
            core_1.info.overwrite(msg);
        }
    }
    do(page, opArgs = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (core_1.config.verbose && core_1.config.runningMode.shouldTakeScreenShot()) {
                yield InteractionUtils_1.default.screenshot(page, `${++opId}-${this.kind}`);
            }
            if (this.selector !== '') {
                yield InteractionUtils_1.default.waitForSelector(page, this.selector, 'exist', this.optional);
            }
            yield this.act(page, opArgs);
            const isPageLoaded = opArgs.isPageLoaded;
            yield InteractionUtils_1.default.waitUntilLoaded(page, {
                isPageLoaded,
                noWaitAfterPageLoad: true,
            });
            yield InteractionUtils_1.default.waitFor(core_1.config.waitAfterOperation);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    act(_page, _opArgs = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const error = new Error('BaseOperation.act can not be called.');
            error.stack;
            throw error;
        });
    }
}
exports.default = BaseOperation;
