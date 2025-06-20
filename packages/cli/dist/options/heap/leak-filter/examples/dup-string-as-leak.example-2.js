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
const core_1 = require("@memlab/core");
const FilterLib_1 = require("./FilterLib");
let map = Object.create(null);
const beforeLeakFilter = (snapshot, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_leakedNodeIds) => {
    map = (0, FilterLib_1.initMap)(snapshot);
};
// duplicated string with size > 1KB as memory leak
const leakFilter = (node) => {
    if (node.type !== 'string' || node.retainedSize < 1000) {
        return false;
    }
    const str = core_1.utils.getStringNodeValue(node);
    return map[str] > 1;
};
exports.default = { beforeLeakFilter, leakFilter };
