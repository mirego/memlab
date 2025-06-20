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
const parser_1 = require("@babel/parser");
const generator_1 = __importDefault(require("@babel/generator"));
const TransformLoader_1 = __importDefault(require("./TransformLoader"));
class ScriptRewriteManager {
    rewriteScript(code, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // parse code
            const ast = (0, parser_1.parse)(code, {
                sourceType: 'script',
            });
            // transform ast
            const transforms = TransformLoader_1.default.loadAllTransforms();
            for (const transform of transforms) {
                yield transform.transform(ast, options);
            }
            // generate code
            const generateResult = (0, generator_1.default)(ast);
            return generateResult.code;
        });
    }
}
exports.default = ScriptRewriteManager;
