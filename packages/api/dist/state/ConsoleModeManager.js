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
exports.ConsoleMode = void 0;
const core_1 = require("@memlab/core");
/**
 * enum of all console mode options
 */
var ConsoleMode;
(function (ConsoleMode) {
    /**
     * mute all terminal output, equivalent to using `--silent`
     */
    ConsoleMode["SILENT"] = "SILENT";
    /**
     * continuous test mode, no terminal output overwrite or animation,
     * equivalent to using `--sc`
     */
    ConsoleMode["CONTINUOUS_TEST"] = "CONTINUOUS_TEST";
    /**
     * the default mode, there could be terminal output overwrite and animation,
     */
    ConsoleMode["DEFAULT"] = "DEFAULT";
    /**
     * verbose mode, there could be terminal output overwrite and animation
     */
    ConsoleMode["VERBOSE"] = "VERBOSE";
})(ConsoleMode = exports.ConsoleMode || (exports.ConsoleMode = {}));
/**
 * Manage, save, and restore the current state of the Console modes.
 * @internal
 */
class ConsoleModeManager {
    getAndUpdateState(config, options = {}) {
        return this.setConsoleMode(config, options.consoleMode, true);
    }
    restoreState(config, modes) {
        if (modes == null) {
            return;
        }
        this.resetConsoleMode(config);
        for (const mode of modes) {
            this.setConsoleMode(config, mode, false);
        }
    }
    resetConsoleMode(config) {
        config.muteConsole = false;
        config.isContinuousTest = false;
        config.verbose = false;
    }
    setConsoleMode(config, mode, reset) {
        let existingModes = this.getExistingConsoleModes(config);
        switch (mode) {
            case ConsoleMode.SILENT:
                reset && this.resetConsoleMode(config);
                config.muteConsole = true;
                break;
            case ConsoleMode.CONTINUOUS_TEST:
                reset && this.resetConsoleMode(config);
                config.isContinuousTest = true;
                break;
            case ConsoleMode.DEFAULT:
                reset && this.resetConsoleMode(config);
                config.muteConsole = false;
                config.isContinuousTest = false;
                break;
            case ConsoleMode.VERBOSE:
                reset && this.resetConsoleMode(config);
                config.verbose = true;
                break;
            default:
                if (mode == null) {
                    existingModes = null;
                }
                else {
                    throw core_1.utils.haltOrThrow(`Unknown console mode: ${mode}`);
                }
        }
        return existingModes;
    }
    getExistingConsoleModes(config) {
        const modes = new Set([ConsoleMode.DEFAULT]);
        if (config.muteConsole) {
            modes.add(ConsoleMode.SILENT);
            modes.delete(ConsoleMode.DEFAULT);
        }
        if (config.isContinuousTest) {
            modes.add(ConsoleMode.CONTINUOUS_TEST);
            modes.delete(ConsoleMode.DEFAULT);
        }
        if (config.verbose) {
            modes.add(ConsoleMode.VERBOSE);
        }
        return modes;
    }
}
/** @internal */
exports.default = new ConsoleModeManager();
