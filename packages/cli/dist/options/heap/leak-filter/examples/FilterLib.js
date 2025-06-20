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
exports.initMap = void 0;
const core_1 = require("@memlab/core");
function initMap(snapshot) {
    const map = Object.create(null);
    snapshot.nodes.forEach(node => {
        if (node.type !== 'string') {
            return;
        }
        const str = core_1.utils.getStringNodeValue(node);
        if (str in map) {
            ++map[str];
        }
        else {
            map[str] = 1;
        }
    });
    return map;
}
exports.initMap = initMap;
