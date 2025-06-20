/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Optional } from '@memlab/core';
import type { SourceLocation } from '@babel/types';
export type ClosureScope = {
    functionName: Optional<string>;
    functionType: string;
    variablesDefined: string[];
    usedVariablesFromParentScope: string[];
    nestedClosures: ClosureScope[];
    loc: Optional<SourceLocation>;
};
export default class Script {
    private code;
    private ast;
    private closureScopeTree;
    constructor(code: string);
    getClosureScopeTree(): ClosureScope;
    private locToStr;
    private findParentFunctionPath;
    private findParentFunctionClosureScope;
    private findGrandparentFunctionClosureScope;
    private buildClosureScopeTree;
}
//# sourceMappingURL=Script.d.ts.map