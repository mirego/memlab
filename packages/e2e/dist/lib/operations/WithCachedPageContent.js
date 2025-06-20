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
/**
 * Supply a factory function that produces an operation, and this operation will
 * supply the memory cache to it. Use this in cases where you want the inner
 * operation to be customizable based on some piece of cached content (eg. the
 * URL of a post permalink created in an earlier step).
 */
class WithCachedPageContent extends BaseOperation_1.default {
    constructor(operationFactory) {
        super();
        this.operationFactory = operationFactory;
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const operationFactory = this.operationFactory;
            if (!operationFactory) {
                core_1.utils.haltOrThrow('WithCachedPageContent: Must provide a function that returns an ' +
                    'operation');
            }
            const operation = operationFactory(core_1.utils.memCache);
            if (!operation || typeof operation.act != 'function') {
                core_1.utils.haltOrThrow('WithCachedPageContent: Value returned from the operation factory ' +
                    'function must be an object with an `act` method.');
            }
            yield operation.act(page);
        });
    }
}
exports.default = WithCachedPageContent;
