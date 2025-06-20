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
const BaseOperation_1 = __importDefault(require("./BaseOperation"));
const EscOperation_1 = __importDefault(require("./EscOperation"));
const BackOperation_1 = __importDefault(require("./BackOperation"));
const InteractionUtils_1 = __importDefault(require("./InteractionUtils"));
class RevertOperation extends BaseOperation_1.default {
    constructor() {
        super();
        this.kind = 'revert';
    }
    act(page, opArgs = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let historyLen = opArgs.pageHistoryLength;
            if (Array.isArray(historyLen) && historyLen.length > 1) {
                historyLen = historyLen;
                const len = historyLen.length;
                const count = historyLen[len - 1];
                const prevCount = historyLen[len - 2];
                let navCountFromPreviousOp = (count | 0) - (prevCount | 0);
                if (navCountFromPreviousOp > 0) {
                    while (navCountFromPreviousOp > 0) {
                        yield new BackOperation_1.default().act(page);
                        yield InteractionUtils_1.default.waitFor(2000);
                        --navCountFromPreviousOp;
                    }
                    return;
                }
            }
            yield new EscOperation_1.default().act(page);
        });
    }
}
exports.default = RevertOperation;
