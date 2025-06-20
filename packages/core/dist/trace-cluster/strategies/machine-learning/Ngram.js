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
Object.defineProperty(exports, "__esModule", { value: true });
exports.nGram = void 0;
function nGram(n, terms) {
    const nGrams = [];
    let index = 0;
    while (index <= terms.length - n) {
        nGrams[index] = terms.slice(index, index + n).join(' ');
        ++index;
    }
    return nGrams;
}
exports.nGram = nGram;
