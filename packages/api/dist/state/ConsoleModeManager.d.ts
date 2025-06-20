/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { MemLabConfig, Nullable } from '@memlab/core';
import type { RunOptions } from '../API';
/**
 * enum of all console mode options
 */
export declare enum ConsoleMode {
    /**
     * mute all terminal output, equivalent to using `--silent`
     */
    SILENT = "SILENT",
    /**
     * continuous test mode, no terminal output overwrite or animation,
     * equivalent to using `--sc`
     */
    CONTINUOUS_TEST = "CONTINUOUS_TEST",
    /**
     * the default mode, there could be terminal output overwrite and animation,
     */
    DEFAULT = "DEFAULT",
    /**
     * verbose mode, there could be terminal output overwrite and animation
     */
    VERBOSE = "VERBOSE"
}
/**
 * Manage, save, and restore the current state of the Console modes.
 * @internal
 */
declare class ConsoleModeManager {
    getAndUpdateState(config: MemLabConfig, options?: RunOptions): Nullable<Set<ConsoleMode>>;
    restoreState(config: MemLabConfig, modes: Nullable<Set<ConsoleMode>>): void;
    private resetConsoleMode;
    private setConsoleMode;
    private getExistingConsoleModes;
}
/** @internal */
declare const _default: ConsoleModeManager;
export default _default;
//# sourceMappingURL=ConsoleModeManager.d.ts.map