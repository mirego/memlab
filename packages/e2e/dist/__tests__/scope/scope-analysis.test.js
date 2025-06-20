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
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const code = `
const v0 = 'abc';
function f() {
  const v1 = 'test';
  function f2() {
    let v2 = 123;
    console.log(v0, v1, v2);
  }
}
`;
const closureScope = {
    functionName: null,
    functionType: 'Program',
    nestedClosures: [
        {
            functionName: 'f',
            functionType: 'FunctionDeclaration',
            nestedClosures: [
                {
                    functionName: 'f2',
                    functionType: 'FunctionDeclaration',
                    nestedClosures: [],
                    usedVariablesFromParentScope: ['v1'],
                    variablesDefined: ['v2'],
                },
            ],
            usedVariablesFromParentScope: ['v0'],
            variablesDefined: ['v1', 'f2'],
        },
    ],
    usedVariablesFromParentScope: [],
    variablesDefined: ['v0', 'f'],
};
test('simple scope analysis works as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    (0, lib_1.testScopeAnalysis)(code, closureScope);
}));
