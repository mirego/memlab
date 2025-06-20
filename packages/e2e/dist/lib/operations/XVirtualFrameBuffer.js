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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xvfb_1 = __importDefault(require("xvfb"));
const core_1 = require("@memlab/core");
exports.default = {
    startIfEnabled() {
        const failRet = null;
        if (!core_1.config.useXVFB || !core_1.config.machineSupportsXVFB) {
            return failRet;
        }
        if (core_1.config.verbose) {
            core_1.info.lowLevel('starting xvfb...');
        }
        const xvfb = new xvfb_1.default({
            silent: true,
            xvfb_args: ['-screen', '0', '1280x720x24', '-ac'],
            timeout: 10000, // 10 seconds timeout for Xvfb start
        });
        try {
            xvfb.startSync();
        }
        catch (_e) {
            if (core_1.config.verbose) {
                core_1.info.lowLevel('fail to start xvfb...');
            }
            core_1.config.disableXvfb();
            return failRet;
        }
        core_1.config.enableXvfb(xvfb.display());
        return xvfb;
    },
};
