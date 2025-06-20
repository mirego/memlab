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
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const BaseOperation_1 = __importDefault(require("./BaseOperation"));
const InteractionUtils_1 = __importDefault(require("./InteractionUtils"));
class UploadOperation extends BaseOperation_1.default {
    constructor(selector, args) {
        var _a;
        super();
        this.kind = 'upload';
        this.selector = selector;
        this.delay = (_a = args.delay) !== null && _a !== void 0 ? _a : 0;
        this.file = path_1.default.join(core_1.config.inputDataDir, args.file);
    }
    act(page) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`uploading file ${this.file}...`);
            const uploadHandle = (yield page.$(this.selector));
            if (!uploadHandle) {
                throw core_1.utils.haltOrThrow(`upload failed, selector not found: ${this.selector}`);
            }
            yield uploadHandle.uploadFile(this.file);
            yield page.evaluate(upload => {
                upload.dispatchEvent(new Event('change', { bubbles: true }));
            }, uploadHandle);
            yield InteractionUtils_1.default.waitFor(2000);
            yield uploadHandle.dispose();
            if (this.delay > 0) {
                yield InteractionUtils_1.default.waitFor(this.delay);
            }
        });
    }
}
exports.default = UploadOperation;
