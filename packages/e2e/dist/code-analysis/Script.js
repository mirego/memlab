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
const traverse_1 = __importDefault(require("@babel/traverse"));
const parser_1 = require("@babel/parser");
const core_1 = require("@memlab/core");
function isFunctionType(type) {
    return (type === 'FunctionDeclaration' ||
        type === 'FunctionExpression' ||
        type === 'ObjectMethod' ||
        type === 'ClassMethod' ||
        type === 'ArrowFunctionExpression');
}
class Script {
    constructor(code) {
        this.code = code;
        this.ast = (0, parser_1.parse)(code, {
            sourceType: 'script',
        });
        this.closureScopeTree = this.buildClosureScopeTree(this.ast);
    }
    getClosureScopeTree() {
        return this.closureScopeTree;
    }
    locToStr(loc) {
        if (loc == null) {
            throw core_1.utils.haltOrThrow(`location in ast is ${loc}`);
        }
        return JSON.stringify(loc);
    }
    findParentFunctionPath(path) {
        let curPath = path.parentPath;
        while (curPath) {
            if (isFunctionType(curPath.node.type) ||
                curPath.node.type === 'Program') {
                return curPath;
            }
            if (curPath.parentPath == null) {
                break;
            }
            curPath = curPath.parentPath;
        }
        return null;
    }
    findParentFunctionClosureScope(locToClosureScopeMap, path) {
        const parentPath = this.findParentFunctionPath(path);
        if (!parentPath) {
            throw core_1.utils.haltOrThrow('cannot find parent scope');
        }
        const parentClosureScope = locToClosureScopeMap.get(this.locToStr(parentPath.node.loc));
        if (!parentClosureScope) {
            throw core_1.utils.haltOrThrow('cannot find parent scope');
        }
        return parentClosureScope;
    }
    findGrandparentFunctionClosureScope(locToClosureScopeMap, path) {
        const parentPath = this.findParentFunctionPath(path);
        if (!parentPath) {
            throw core_1.utils.haltOrThrow('cannot find parent scope');
        }
        const grandparentPath = this.findParentFunctionPath(parentPath);
        if (!grandparentPath) {
            return null;
        }
        const grandparentClosureScope = locToClosureScopeMap.get(this.locToStr(grandparentPath.node.loc));
        if (!grandparentClosureScope) {
            throw core_1.utils.haltOrThrow('cannot find parent scope');
        }
        return grandparentClosureScope;
    }
    buildClosureScopeTree(ast) {
        const root = {
            functionName: null,
            functionType: ast.program.type,
            variablesDefined: [],
            usedVariablesFromParentScope: [],
            nestedClosures: [],
            loc: ast.program.loc,
        };
        const locToClosureScopeMap = new Map();
        locToClosureScopeMap.set(this.locToStr(ast.program.loc), root);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        // build closure scope hierarchy
        const buildClosureScopeFromFunction = function (path) {
            var _a, _b;
            const closureScope = {
                functionName: 'id' in path.node ? (_b = (_a = path.node) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.name : null,
                functionType: path.node.type,
                variablesDefined: Object.keys(path.scope.bindings),
                usedVariablesFromParentScope: [],
                nestedClosures: [],
                loc: path.node.loc,
            };
            locToClosureScopeMap.set(self.locToStr(path.node.loc), closureScope);
            // find and connect to parent closure scope
            const parentClosureScope = self.findParentFunctionClosureScope(locToClosureScopeMap, path);
            parentClosureScope.nestedClosures.push(closureScope);
        };
        // Traverse the parent scope of the containing scope
        // to find out if both of the conditions are true:
        // 1. This is a var use in the containing scope
        // 2. This is a var defined in the direct parent scope
        //    of the containing scope
        // If true, add the identifer name to the usedVariablesFromParentScope
        // of the containing scope
        const fillInVarInfo = function (path) {
            // if the identifier is a function name of a function definition
            if (isFunctionType(path.parentPath.node.type)) {
                return;
            }
            const name = path.node.name;
            let parentPath = self.findParentFunctionPath(path);
            let parentClosureScope = parentPath
                ? locToClosureScopeMap.get(self.locToStr(parentPath.node.loc))
                : null;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (!parentPath || !parentClosureScope) {
                    break;
                }
                const grandparentPath = self.findParentFunctionPath(parentPath);
                if (!grandparentPath) {
                    break;
                }
                const grandparentClosureScope = locToClosureScopeMap.get(self.locToStr(grandparentPath.node.loc));
                if (!grandparentClosureScope) {
                    break;
                }
                if (grandparentClosureScope.variablesDefined.includes(name) &&
                    !parentClosureScope.usedVariablesFromParentScope.includes(name)) {
                    parentClosureScope.usedVariablesFromParentScope.push(name);
                    break;
                }
                parentPath = grandparentPath;
                parentClosureScope = grandparentClosureScope;
            }
        };
        (0, traverse_1.default)(ast, {
            FunctionDeclaration: buildClosureScopeFromFunction,
            FunctionExpression: buildClosureScopeFromFunction,
            ObjectMethod: buildClosureScopeFromFunction,
            ClassMethod: buildClosureScopeFromFunction,
            ArrowFunctionExpression: buildClosureScopeFromFunction,
            Identifier: fillInVarInfo,
            Program: (path) => {
                root.variablesDefined = Object.keys(path.scope.bindings);
            },
        });
        return root;
    }
}
exports.default = Script;
