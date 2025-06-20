/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @lightSyntaxTransform
 * @oncall memory_lab
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwError = exports.NodeDetachState = void 0;
exports.NodeDetachState = {
    Unknown: 0,
    Attached: 1,
    Detached: 2,
};
function throwError(error) {
    if (error) {
        error.stack;
    }
    throw error;
}
exports.throwError = throwError;
