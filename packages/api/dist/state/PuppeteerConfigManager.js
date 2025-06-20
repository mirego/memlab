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
/**
 * Manage, save, and restore the current state of the PuppeteerConfig.
 */
class PuppeteerStateManager {
    getAndUpdateState(config, options = {}) {
        const existing = config.puppeteerConfig;
        config.puppeteerConfig = Object.assign({}, config.puppeteerConfig);
        config.externalCookiesFile = options.cookiesFile;
        config.scenario = options.scenario;
        if (options.chromiumBinary != null) {
            core_1.utils.setChromiumBinary(config, options.chromiumBinary);
        }
        return existing;
    }
    restoreState(config, puppeteerConfig) {
        config.puppeteerConfig = puppeteerConfig;
    }
}
exports.default = new PuppeteerStateManager();
