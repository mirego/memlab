/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
export type RewriteScriptOption = {
    url?: string;
    resourceType?: string;
};
export default class ScriptRewriteManager {
    rewriteScript(code: string, options?: RewriteScriptOption): Promise<string>;
}
//# sourceMappingURL=ScriptRewriteManager.d.ts.map