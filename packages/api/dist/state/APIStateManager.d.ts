/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { MemLabConfig, Optional, PuppeteerConfig } from '@memlab/core';
import type { ConsoleMode } from './ConsoleModeManager';
import type { RunOptions } from '../API';
export declare class APIState {
    modes: Optional<Set<ConsoleMode>>;
    puppeteerConfig: Optional<PuppeteerConfig>;
}
/**
 * Manage, save, and restore the current state of the API.
 */
declare class APIStateManager {
    getAndUpdateState(config: MemLabConfig, options?: RunOptions): APIState;
    restoreState(config: MemLabConfig, state: APIState): void;
}
declare const _default: APIStateManager;
export default _default;
//# sourceMappingURL=APIStateManager.d.ts.map