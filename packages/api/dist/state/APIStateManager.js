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
exports.APIState = void 0;
const ConsoleModeManager_1 = __importDefault(require("./ConsoleModeManager"));
const PuppeteerConfigManager_1 = __importDefault(require("./PuppeteerConfigManager"));
class APIState {
}
exports.APIState = APIState;
/**
 * Manage, save, and restore the current state of the API.
 */
class APIStateManager {
    getAndUpdateState(config, options = {}) {
        const state = new APIState();
        state.modes = ConsoleModeManager_1.default.getAndUpdateState(config, options);
        state.puppeteerConfig = PuppeteerConfigManager_1.default.getAndUpdateState(config, options);
        return state;
    }
    restoreState(config, state) {
        if (state.modes) {
            ConsoleModeManager_1.default.restoreState(config, state.modes);
        }
        if (state.puppeteerConfig) {
            PuppeteerConfigManager_1.default.restoreState(config, state.puppeteerConfig);
        }
    }
}
exports.default = new APIStateManager();
