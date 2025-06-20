/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @lightSyntaxTransform
 * @oncall memory_lab
 */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HeapNode_1 = __importDefault(require("./HeapNode"));
const HeapUtils_1 = require("./HeapUtils");
class HeapStringNode extends HeapNode_1.default {
    constructor(heapSnapshot, idx) {
        super(heapSnapshot, idx);
    }
    get stringValue() {
        var _a, _b, _c;
        const stack = [this];
        let ret = '';
        while (stack.length > 0) {
            const node = stack.pop();
            const type = node.type;
            if (type === 'concatenated string') {
                const firstNode = (_a = node.getReferenceNode('first')) === null || _a === void 0 ? void 0 : _a.toStringNode();
                const secondNode = (_b = node.getReferenceNode('second')) === null || _b === void 0 ? void 0 : _b.toStringNode();
                if (firstNode == null || secondNode == null) {
                    throw (0, HeapUtils_1.throwError)(new Error('broken concatenated string'));
                }
                stack.push(secondNode);
                stack.push(firstNode);
                continue;
            }
            if (type === 'sliced string') {
                const parentNode = (_c = node.getReferenceNode('parent')) === null || _c === void 0 ? void 0 : _c.toStringNode();
                if (parentNode == null) {
                    throw (0, HeapUtils_1.throwError)(new Error('broken sliced string'));
                }
                // sliced string in heap snapshot doesn't include
                // the start index and the end index, so this may be inaccurate
                ret += `<sliced string of @${parentNode.id}>`;
                continue;
            }
            ret += node.name;
        }
        return ret;
    }
    getJSONifyableObject() {
        const rep = super.getJSONifyableObject();
        rep.stringValue = this.stringValue;
        return rep;
    }
}
exports.default = HeapStringNode;
