/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Nullable } from '@memlab/core';
import type { RewriteScriptOption } from './instrumentation/ScriptRewriteManager';
import type { ClosureScope } from './code-analysis/Script';
export default class ScriptManager {
    private fileId;
    private metaFileWriteTimeout;
    private scriptRewriteManager;
    private urlToScriptMap;
    private scriptInfos;
    constructor();
    private init;
    loadFromFiles(): boolean;
    loadCodeForUrl(url: string): Nullable<string>;
    getClosureScopeTreeForUrl(url: string): Nullable<ClosureScope>;
    rewriteScript(code: string, options?: RewriteScriptOption): Promise<string>;
    resourceTypeToSuffix(resourceType: string): string;
    logScript(url: string, code: string, resourceType: string): Promise<void>;
    private debounce;
}
//# sourceMappingURL=ScriptManager.d.ts.map