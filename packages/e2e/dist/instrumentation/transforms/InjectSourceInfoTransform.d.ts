import type { ParseResult } from '@babel/core';
import type { RewriteScriptOption } from '../ScriptRewriteManager';
import BaseAstTransform from '../BaseAstTransform';
export default class InjectSourceInfoTransform extends BaseAstTransform {
    transform(ast: ParseResult, options?: RewriteScriptOption): Promise<void>;
}
//# sourceMappingURL=InjectSourceInfoTransform.d.ts.map