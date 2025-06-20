/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Nullable, Optional, RunMetaInfo } from './Types';
export declare class RunMetaInfoManager {
    getRunMetaFilePath(options?: {
        workDir?: Optional<string>;
        readonly?: Optional<boolean>;
    }): string;
    saveRunMetaInfo(runMetaInfo: RunMetaInfo, options?: {
        workDir?: Optional<string>;
        extraRunInfo?: Map<string, string>;
    }): string;
    private loadRunMetaInfoFromFile;
    loadRunMetaInfo(options?: {
        metaFile?: Optional<string>;
        workDir?: Optional<string>;
    }): RunMetaInfo;
    loadRunMetaInfoSilentFail(options?: {
        metaFile?: Optional<string>;
        workDir?: Optional<string>;
    }): Nullable<RunMetaInfo>;
    loadRunMetaExternalTemplate(): RunMetaInfo;
    setConfigFromRunMeta(options?: {
        workDir?: Optional<string>;
        silentFail?: boolean;
    }): void;
}
declare const runInfoUtils: {
    runMetaInfoManager: RunMetaInfoManager;
};
/** @internal */
export default runInfoUtils;
//# sourceMappingURL=RunInfoUtils.d.ts.map