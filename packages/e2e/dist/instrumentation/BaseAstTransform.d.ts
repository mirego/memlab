/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { ParseResult } from '@babel/core';
import type { RewriteScriptOption } from './ScriptRewriteManager';
export default abstract class BaseAstTransform {
    transform(ast: ParseResult, options?: RewriteScriptOption): Promise<void>;
}
//# sourceMappingURL=BaseAstTransform.d.ts.map