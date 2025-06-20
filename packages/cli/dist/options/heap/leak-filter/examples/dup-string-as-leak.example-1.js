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
exports.leakFilter = exports.beforeLeakFilter = void 0;
const core_1 = require("@memlab/core");
const FilterLib_1 = require("./FilterLib");
let map = Object.create(null);
function beforeLeakFilter(snapshot, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_leakedNodeIds) {
    map = (0, FilterLib_1.initMap)(snapshot);
}
exports.beforeLeakFilter = beforeLeakFilter;
// duplicated string with size > 1KB as memory leak
function leakFilter(node) {
    if (node.type !== 'string' || node.retainedSize < 1000) {
        return false;
    }
    const str = core_1.utils.getStringNodeValue(node);
    return map[str] > 1;
}
exports.leakFilter = leakFilter;
