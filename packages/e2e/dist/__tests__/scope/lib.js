"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLoc = exports.testScopeAnalysis = void 0;
const Script_1 = __importDefault(require("../../code-analysis/Script"));
function testScopeAnalysis(code, expectedScope) {
    const script = new Script_1.default(code);
    const scope = script.getClosureScopeTree();
    expect(removeLoc(scope)).toEqual(removeLoc(expectedScope));
}
exports.testScopeAnalysis = testScopeAnalysis;
function removeLoc(entity) {
    const visited = new Set();
    function remove(e) {
        if (!e || typeof e !== 'object' || visited.has(e)) {
            return;
        }
        visited.add(e);
        for (const k of Object.keys(e)) {
            if (k === 'loc') {
                delete e.loc;
            }
            else {
                remove(e[k]);
            }
        }
    }
    remove(entity);
    return entity;
}
exports.removeLoc = removeLoc;
