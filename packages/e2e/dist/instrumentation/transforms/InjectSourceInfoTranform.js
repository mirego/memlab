"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const traverse_1 = __importDefault(require("@babel/traverse"));
const template_1 = __importDefault(require("@babel/template"));
const BaseAstTransform_1 = __importDefault(require("../BaseAstTransform"));
class InjectSourceInfoTranform extends BaseAstTransform_1.default {
    transform(ast, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = (_a = options.url) !== null && _a !== void 0 ? _a : '';
            const instrumentFunction = function (path) {
                var _a, _b;
                const statements = [`var __memlab_file_$$ = '${url}';`];
                if (path.node.loc) {
                    const { start, end } = path.node.loc;
                    statements.push(`var __memlab_loc_$$ = '${start.line}:${start.column}:${end.line}:${end.column}';`);
                }
                if ('id' in path.node && ((_a = path.node.id) === null || _a === void 0 ? void 0 : _a.name)) {
                    statements.push(`var __memlab_scope_$$ = '${(_b = path.node.id) === null || _b === void 0 ? void 0 : _b.name}';`);
                }
                const codeToInsert = (0, template_1.default)(statements.join(''), {
                    placeholderPattern: false,
                });
                if (path.node.body.type === 'BlockStatement') {
                    const blockStatementBody = path.node.body.body;
                    if (Array.isArray(codeToInsert)) {
                        blockStatementBody.unshift(...codeToInsert);
                    }
                    else {
                        const newCode = codeToInsert();
                        if (Array.isArray(newCode)) {
                            blockStatementBody.unshift(...newCode);
                        }
                        else {
                            blockStatementBody.unshift(newCode);
                        }
                    }
                }
            };
            (0, traverse_1.default)(ast, {
                FunctionDeclaration: instrumentFunction,
                FunctionExpression: instrumentFunction,
                ObjectMethod: instrumentFunction,
                ClassMethod: instrumentFunction,
                ArrowFunctionExpression: instrumentFunction,
            });
        });
    }
}
exports.default = InjectSourceInfoTranform;
