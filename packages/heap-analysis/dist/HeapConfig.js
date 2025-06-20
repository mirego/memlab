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
class HeapConfig {
    constructor() {
        this.isCliInteractiveMode = false;
        this.currentHeap = null;
        this.currentHeapFile = null;
    }
    static getInstance() {
        if (!HeapConfig.instance) {
            HeapConfig.instance = new HeapConfig();
        }
        return HeapConfig.instance;
    }
}
HeapConfig.instance = null;
const heapConfig = HeapConfig.getInstance();
core_1.config.heapConfig = heapConfig;
exports.default = heapConfig;
