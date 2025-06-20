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
exports.isHeapStringType = void 0;
const HeapUtils_1 = require("./HeapUtils");
const HeapEdge_1 = __importDefault(require("./HeapEdge"));
const HeapLocation_1 = __importDefault(require("./HeapLocation"));
function isHeapStringType(type) {
    return ['string', 'sliced string', 'concatenated string'].includes(type);
}
exports.isHeapStringType = isHeapStringType;
class HeapNode {
    constructor(heapSnapshot, idx) {
        this.heapSnapshot = heapSnapshot;
        this.idx = idx;
    }
    get snapshot() {
        return this.heapSnapshot;
    }
    get type() {
        const heapSnapshot = this.heapSnapshot;
        const nodeValues = heapSnapshot.snapshot.nodes;
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        const nodeTypes = heapSnapshot._nodeTypes;
        const typeIdx = nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeTypeOffset];
        return nodeTypes[typeIdx];
    }
    get name() {
        const heapSnapshot = this.heapSnapshot;
        const nodeValues = heapSnapshot.snapshot.nodes;
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        const strIdx = nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeNameOffset];
        const prefix = this.is_detached ? 'Detached ' : '';
        return prefix + heapSnapshot.snapshot.strings[strIdx];
    }
    get is_detached() {
        const heapSnapshot = this.heapSnapshot;
        if (heapSnapshot._nodeDetachednessOffset < 0) {
            return (heapSnapshot._externalDetachedness[this.idx] ===
                HeapUtils_1.NodeDetachState.Detached);
        }
        const nodeValues = heapSnapshot.snapshot.nodes;
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        const detachState = nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeDetachednessOffset];
        return detachState === HeapUtils_1.NodeDetachState.Detached;
    }
    set detachState(detachState) {
        const heapSnapshot = this.heapSnapshot;
        if (heapSnapshot._nodeDetachednessOffset >= 0) {
            const nodeValues = heapSnapshot.snapshot.nodes;
            const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
            nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeDetachednessOffset] = detachState;
        }
        else {
            heapSnapshot._externalDetachedness[this.idx] = detachState;
        }
    }
    markAsDetached() {
        this.detachState = HeapUtils_1.NodeDetachState.Detached;
    }
    get attributes() {
        const heapSnapshot = this.heapSnapshot;
        const nodeAttributes = heapSnapshot._additionalAttributes;
        return nodeAttributes[this.idx];
    }
    set attributes(attr) {
        const heapSnapshot = this.heapSnapshot;
        const nodeAttributes = heapSnapshot._additionalAttributes;
        nodeAttributes[this.idx] = attr;
    }
    get id() {
        const heapSnapshot = this.heapSnapshot;
        const nodeValues = heapSnapshot.snapshot.nodes;
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        const id = nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeIdOffset];
        return id;
    }
    get self_size() {
        const heapSnapshot = this.heapSnapshot;
        const nodeValues = heapSnapshot.snapshot.nodes;
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        return nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeSelfSizeOffset];
    }
    get edge_count() {
        const heapSnapshot = this.heapSnapshot;
        const nodeValues = heapSnapshot.snapshot.nodes;
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        return nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeEdgeCountOffset];
    }
    get trace_node_id() {
        const heapSnapshot = this.heapSnapshot;
        const nodeValues = heapSnapshot.snapshot.nodes;
        const nodeFieldsCount = heapSnapshot._nodeFieldsCount;
        return nodeValues[this.idx * nodeFieldsCount + heapSnapshot._nodeTraceNodeIdOffset];
    }
    get references() {
        const ret = [];
        const heapSnapshot = this.heapSnapshot;
        const edgeFieldsCount = heapSnapshot._edgeFieldsCount;
        const firstEdgePointers = heapSnapshot._firstEdgePointers;
        const beginEdgeIdx = firstEdgePointers[this.idx];
        const endEdgeIdx = firstEdgePointers[this.idx + 1];
        for (let edgeIdx = beginEdgeIdx; edgeIdx < endEdgeIdx; edgeIdx += edgeFieldsCount) {
            ret.push(new HeapEdge_1.default(heapSnapshot, edgeIdx / edgeFieldsCount));
        }
        return ret;
    }
    forEachReference(callback) {
        const heapSnapshot = this.heapSnapshot;
        const edgeFieldsCount = heapSnapshot._edgeFieldsCount;
        const firstEdgePointers = heapSnapshot._firstEdgePointers;
        const beginEdgeIdx = firstEdgePointers[this.idx];
        const endEdgeIdx = firstEdgePointers[this.idx + 1];
        for (let edgeIdx = beginEdgeIdx; edgeIdx < endEdgeIdx; edgeIdx += edgeFieldsCount) {
            const edge = new HeapEdge_1.default(heapSnapshot, edgeIdx / edgeFieldsCount);
            const ret = callback(edge);
            if (ret && ret.stop) {
                break;
            }
        }
    }
    findAnyReference(predicate) {
        let found = null;
        this.forEachReference((edge) => {
            if (predicate(edge)) {
                found = edge;
                return { stop: true };
            }
        });
        return found;
    }
    findAnyReferrer(predicate) {
        let found = null;
        this.forEachReferrer((edge) => {
            if (predicate(edge)) {
                found = edge;
                return { stop: true };
            }
        });
        return found;
    }
    findAnyReferrerNode(predicate) {
        let found = null;
        this.forEachReferrer((edge) => {
            const node = edge.fromNode;
            if (predicate(node)) {
                found = node;
                return { stop: true };
            }
        });
        return found;
    }
    findReferrers(predicate) {
        const ret = [];
        this.forEachReferrer((edge) => {
            if (predicate(edge)) {
                ret.push(edge);
            }
            return null;
        });
        return ret;
    }
    findReferrerNodes(predicate) {
        const ret = [];
        this.forEachReferrer((edge) => {
            const node = edge.fromNode;
            if (predicate(node)) {
                ret.push(node);
            }
            return null;
        });
        return ret;
    }
    get referrers() {
        const heapSnapshot = this.heapSnapshot;
        const retainingEdgeIndex2EdgeIndex = heapSnapshot._retainingEdgeIndex2EdgeIndex;
        const firstRetainerIndex = heapSnapshot._firstRetainerIndex;
        const ret = [];
        const beginIdx = firstRetainerIndex[this.idx];
        const endIdx = firstRetainerIndex[this.idx + 1];
        for (let idx = beginIdx; idx < endIdx; idx++) {
            const retainingEdgeIdx = retainingEdgeIndex2EdgeIndex[idx];
            ret.push(new HeapEdge_1.default(heapSnapshot, retainingEdgeIdx));
        }
        return ret;
    }
    get numOfReferrers() {
        const heapSnapshot = this.heapSnapshot;
        const firstRetainerIndex = heapSnapshot._firstRetainerIndex;
        const beginIdx = firstRetainerIndex[this.idx];
        const endIdx = firstRetainerIndex[this.idx + 1];
        return endIdx - beginIdx;
    }
    forEachReferrer(callback) {
        const heapSnapshot = this.heapSnapshot;
        const retainingEdgeIndex2EdgeIndex = heapSnapshot._retainingEdgeIndex2EdgeIndex;
        const firstRetainerIndex = heapSnapshot._firstRetainerIndex;
        const beginIdx = firstRetainerIndex[this.idx];
        const endIdx = firstRetainerIndex[this.idx + 1];
        for (let idx = beginIdx; idx < endIdx; idx++) {
            const retainingEdgeIdx = retainingEdgeIndex2EdgeIndex[idx];
            const edge = new HeapEdge_1.default(heapSnapshot, retainingEdgeIdx);
            const ret = callback(edge);
            if (ret && ret.stop) {
                break;
            }
        }
    }
    get hasPathEdge() {
        const heapSnapshot = this.heapSnapshot;
        return heapSnapshot._nodeIdxHasPathEdge[this.idx] !== 0;
    }
    get pathEdge() {
        const heapSnapshot = this.heapSnapshot;
        if (heapSnapshot._nodeIdxHasPathEdge[this.idx] === 0) {
            return null;
        }
        if (this.idx >= heapSnapshot._nodeIdx2PathEdgeIdx.length) {
            (0, HeapUtils_1.throwError)(new Error('invalid idx: ' + this.idx));
        }
        const edgeIdx = heapSnapshot._nodeIdx2PathEdgeIdx[this.idx];
        return new HeapEdge_1.default(heapSnapshot, edgeIdx);
    }
    set pathEdge(edge) {
        const heapSnapshot = this.heapSnapshot;
        if (!edge) {
            heapSnapshot._nodeIdxHasPathEdge[this.idx] = 0;
            return;
        }
        const edgeIdx = edge.edgeIndex;
        if (this.idx >= heapSnapshot._nodeIdx2PathEdgeIdx.length) {
            (0, HeapUtils_1.throwError)(new Error('invalid idx: ' + this.idx));
        }
        heapSnapshot._nodeIdx2PathEdgeIdx[this.idx] = edgeIdx;
        heapSnapshot._nodeIdxHasPathEdge[this.idx] = 1;
    }
    get nodeIndex() {
        return this.idx;
    }
    get retainedSize() {
        const bigUintSize = this.heapSnapshot._nodeIdx2RetainedSize[this.idx];
        return Number(bigUintSize);
    }
    set retainedSize(size) {
        const heapSnapshot = this.heapSnapshot;
        const bigUintSize = BigInt(Math.floor(size));
        heapSnapshot._nodeIdx2RetainedSize[this.idx] = bigUintSize;
    }
    get dominatorNode() {
        const heapSnapshot = this.heapSnapshot;
        const nodeIdx2DominatorNodeIdx = heapSnapshot._nodeIdx2DominatorNodeIdx;
        if (this.idx >= nodeIdx2DominatorNodeIdx.length) {
            (0, HeapUtils_1.throwError)(new Error('invalid idx: ' + this.idx));
        }
        if (heapSnapshot._nodeIdxHasDominatorNode[this.idx] === 0) {
            return null;
        }
        const dominatorNodeIdx = nodeIdx2DominatorNodeIdx[this.idx];
        return new HeapNode(heapSnapshot, dominatorNodeIdx);
    }
    set dominatorNode(node) {
        const heapSnapshot = this.heapSnapshot;
        if (!node) {
            heapSnapshot._nodeIdxHasDominatorNode[this.idx] = 0;
            return;
        }
        const nodeIdx2DominatorNodeIdx = heapSnapshot._nodeIdx2DominatorNodeIdx;
        const dominatorNodeIdx = node.nodeIndex;
        if (this.idx >= nodeIdx2DominatorNodeIdx.length ||
            dominatorNodeIdx >= nodeIdx2DominatorNodeIdx.length) {
            (0, HeapUtils_1.throwError)(new Error('invalid idx: ' + this.idx));
        }
        nodeIdx2DominatorNodeIdx[this.idx] = dominatorNodeIdx;
        heapSnapshot._nodeIdxHasDominatorNode[this.idx] = 1;
    }
    get location() {
        const heapSnapshot = this.heapSnapshot;
        const locationIdx = heapSnapshot._nodeIdx2LocationIdx[this.idx];
        return locationIdx == heapSnapshot._locationCount // no location mapping
            ? null
            : new HeapLocation_1.default(heapSnapshot, locationIdx);
    }
    // search reference by edge name and edge type
    getReference(edgeName, edgeType) {
        let ret = null;
        this.forEachReference((edge) => {
            if (edge.name_or_index !== edgeName) {
                return;
            }
            if (edgeType != null && edge.type !== edgeType) {
                return;
            }
            ret = edge;
            return { stop: true };
        });
        return ret;
    }
    // search referenced node by edge name and edge type
    getReferenceNode(edgeName, edgeType) {
        const edge = this.getReference(edgeName, edgeType);
        return edge && edge.toNode;
    }
    // search any referrer edge by edge name and edge type
    getAnyReferrer(edgeName, edgeType) {
        let ret = null;
        this.forEachReferrer((edge) => {
            if (edge.name_or_index !== edgeName) {
                return;
            }
            if (edgeType != null && edge.type !== edgeType) {
                return;
            }
            ret = edge;
            return { stop: true };
        });
        return ret;
    }
    // search all referrer edges by edge name and edge type
    getReferrers(edgeName, edgeType) {
        return this.findReferrers((edge) => {
            if (edge.name_or_index !== edgeName) {
                return false;
            }
            if (edgeType != null && edge.type !== edgeType) {
                return false;
            }
            return true;
        });
    }
    // search any referrer node by edge name and edge type
    getAnyReferrerNode(edgeName, edgeType) {
        const edge = this.getAnyReferrer(edgeName, edgeType);
        return edge && edge.fromNode;
    }
    // search all referrer nodes by edge name and edge type
    getReferrerNodes(edgeName, edgeType) {
        const ret = [];
        const idSet = new Set();
        this.forEachReferrer((edge) => {
            if (edge.name_or_index !== edgeName) {
                return;
            }
            if (edgeType != null && edge.type !== edgeType) {
                return;
            }
            const fromNode = edge.fromNode;
            if (idSet.has(fromNode.id)) {
                return;
            }
            idSet.add(fromNode.id);
            ret.push(fromNode);
            return null;
        });
        return ret;
    }
    get isString() {
        return isHeapStringType(this.type);
    }
    toStringNode() {
        return this.isString
            ? new HeapStringNode_1.default(this.heapSnapshot, this.idx)
            : null;
    }
    getJSONifyableObject() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            self_size: this.self_size,
            trace_node_id: this.trace_node_id,
            nodeIndex: this.nodeIndex,
            outGoingEdgeCount: this.edge_count,
            incomingEdgeCount: this.numOfReferrers,
            contructorName: this.constructor.name,
        };
    }
    toJSONString(...args) {
        const rep = this.getJSONifyableObject();
        return JSON.stringify(rep, ...args);
    }
}
exports.default = HeapNode;
// HeapStringNode has to be imported after exporting HeapNode
// since HeapStringNode imports and extends HeapNode
const HeapStringNode_1 = __importDefault(require("./HeapStringNode"));
