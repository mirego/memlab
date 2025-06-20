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
const HeapUtils_1 = require("./HeapUtils");
const HeapNode_1 = __importDefault(require("./HeapNode"));
class HeapEdge {
    constructor(heapSnapshot, idx) {
        this.heapSnapshot = heapSnapshot;
        this.idx = idx;
    }
    get snapshot() {
        return this.heapSnapshot;
    }
    get edgeIndex() {
        return this.idx;
    }
    get type() {
        const heapSnapshot = this.heapSnapshot;
        const edgeValues = heapSnapshot.snapshot.edges;
        const edgeFieldsCount = heapSnapshot._edgeFieldsCount;
        const edgeTypes = heapSnapshot._edgeTypes;
        const typeIdx = edgeValues[this.idx * edgeFieldsCount + heapSnapshot._edgeTypeOffset];
        return edgeTypes[typeIdx];
    }
    // For element and hidden edges, the value in the slot is
    // a numeric index property of the hosting object, rather
    // than a pointer pointing to a string table.
    get is_index() {
        const type = this.type;
        return type === 'element' || type === 'hidden';
    }
    get name_or_index() {
        const heapSnapshot = this.heapSnapshot;
        const edgeValues = heapSnapshot.snapshot.edges;
        const edgeFieldsCount = heapSnapshot._edgeFieldsCount;
        const idx = edgeValues[this.idx * edgeFieldsCount + heapSnapshot._edgeNameOrIndexOffset];
        if (this.is_index) {
            return idx;
        }
        return this.heapSnapshot.snapshot.strings[idx];
    }
    get to_node() {
        const heapSnapshot = this.heapSnapshot;
        const edgeValues = heapSnapshot.snapshot.edges;
        const edgeFieldsCount = heapSnapshot._edgeFieldsCount;
        const toNodeIdx = edgeValues[this.idx * edgeFieldsCount + heapSnapshot._edgeToNodeOffset];
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        if (toNodeIdx % nodeFieldsCount) {
            (0, HeapUtils_1.throwError)(new Error('invalid idx: ' + this.idx));
        }
        return toNodeIdx / nodeFieldsCount;
    }
    get toNode() {
        return new HeapNode_1.default(this.heapSnapshot, this.to_node);
    }
    get fromNode() {
        const heapSnapshot = this.heapSnapshot;
        const edgeIndex2SrcNodeIndex = heapSnapshot._edgeIndex2SrcNodeIndex;
        const srcNodeIdx = edgeIndex2SrcNodeIndex[this.idx];
        return new HeapNode_1.default(heapSnapshot, srcNodeIdx);
    }
    getJSONifyableObject() {
        return {
            name_or_index: this.name_or_index,
            type: this.type,
            edgeIndex: this.edgeIndex,
            toNode: this.toNode.getJSONifyableObject(),
            fromNode: this.fromNode.getJSONifyableObject(),
        };
    }
    toJSONString(...args) {
        const rep = this.getJSONifyableObject();
        return JSON.stringify(rep, ...args);
    }
}
exports.default = HeapEdge;
