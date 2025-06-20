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
const Config_1 = __importDefault(require("../Config"));
const Console_1 = __importDefault(require("../Console"));
const HeapNode_1 = __importDefault(require("./HeapNode"));
const HeapEdge_1 = __importDefault(require("./HeapEdge"));
const HeapUtils_1 = require("./HeapUtils");
const MemLabTagStore_1 = __importDefault(require("./MemLabTagStore"));
const NumericDictionary_1 = __importDefault(require("./utils/NumericDictionary"));
const EMPTY_UINT8_ARRAY = new Uint8Array(0);
const EMPTY_UINT32_ARRAY = new Uint32Array(0);
const EMPTY_BIG_UINT64_ARRAY = new BigUint64Array(0);
const EMPTY_NUMERIC_DICTIONARY = new NumericDictionary_1.default(0);
class HeapSnapshot {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(snapshot, _options = {}) {
        this.isProcessed = false;
        this._nodeCount = -1;
        this._edgeCount = -1;
        this._nodeId2NodeIdx = EMPTY_NUMERIC_DICTIONARY;
        this._nodeIdxHasPathEdge = EMPTY_UINT8_ARRAY;
        this._nodeIdx2PathEdgeIdx = EMPTY_UINT32_ARRAY;
        this._nodeIdx2DominatorNodeIdx = EMPTY_UINT32_ARRAY;
        this._nodeIdxHasDominatorNode = EMPTY_UINT8_ARRAY;
        this._nodeIdx2RetainedSize = EMPTY_BIG_UINT64_ARRAY;
        this._additionalAttributes = EMPTY_UINT8_ARRAY;
        this._nodeDetachednessOffset = -1;
        this._externalDetachedness = EMPTY_UINT8_ARRAY;
        this._nodeIdx2LocationIdx = EMPTY_UINT32_ARRAY;
        this._locationFieldsCount = -1;
        this._locationCount = -1;
        this._locationObjectIndexOffset = -1;
        this._nodeFieldsCount = -1;
        this._nodeIdOffset = -1;
        this.forwardEdges = [];
        this._nodeTypeOffset = -1;
        this._nodeNameOffset = -1;
        this._nodeSelfSizeOffset = -1;
        this._nodeEdgeCountOffset = -1;
        this._nodeTraceNodeIdOffset = -1;
        this._nodeTypes = [];
        this._nodeArrayType = -1;
        this._nodeHiddenType = -1;
        this._nodeObjectType = -1;
        this._nodeNativeType = -1;
        this._nodeConsStringType = -1;
        this._nodeSlicedStringType = -1;
        this._nodeCodeType = -1;
        this._nodeSyntheticType = -1;
        this._edgeFieldsCount = -1;
        this._edgeTypeOffset = -1;
        this._edgeNameOrIndexOffset = -1;
        this._edgeToNodeOffset = -1;
        this._edgeTypes = [];
        this._edgeElementType = -1;
        this._edgeHiddenType = -1;
        this._edgeInternalType = -1;
        this._edgeShortcutType = -1;
        this._edgeWeakType = -1;
        this._edgeInvisibleType = -1;
        this._locationScriptIdOffset = -1;
        this._locationLineOffset = -1;
        this._locationColumnOffset = -1;
        this._firstEdgePointers = EMPTY_UINT32_ARRAY;
        this._retainingEdgeIndex2EdgeIndex = EMPTY_UINT32_ARRAY;
        this._firstRetainerIndex = EMPTY_UINT32_ARRAY;
        this._edgeIndex2SrcNodeIndex = EMPTY_UINT32_ARRAY;
        this.snapshot = snapshot;
        this._metaNode = snapshot.snapshot.meta;
        this._buildMetaData();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        // virtual nodes
        this.nodes = {
            length: self._nodeCount,
            get(idx) {
                if (idx < 0 || idx >= self._nodeCount) {
                    return null;
                }
                return new HeapNode_1.default(self, idx);
            },
            forEach(cb) {
                for (let i = 0; i < this.length; i++) {
                    const ret = cb(this.get(i), i);
                    if (ret === false) {
                        break;
                    }
                }
            },
            forEachTraceable(cb) {
                for (let i = 0; i < this.length; i++) {
                    const node = this.get(i);
                    if (!node.hasPathEdge) {
                        continue;
                    }
                    const ret = cb(node, i);
                    if (ret === false) {
                        break;
                    }
                }
            },
        };
        // virtual edges
        this.edges = {
            length: self._edgeCount,
            get(idx) {
                if (idx < 0 || idx >= self._edgeCount) {
                    return null;
                }
                return new HeapEdge_1.default(self, idx);
            },
            forEach(cb) {
                for (let i = 0; i < this.length; i++) {
                    const ret = cb(this.get(i), i);
                    if (ret === false) {
                        break;
                    }
                }
            },
        };
    }
    getJSONifyableObject() {
        return Object.assign({}, this.snapshot.snapshot);
    }
    toJSONString(...args) {
        const rep = this.getJSONifyableObject();
        return JSON.stringify(rep, ...args);
    }
    hasObjectWithClassName(className) {
        let detected = false;
        this.nodes.forEach((node) => {
            if (node.name === className && node.type === 'object') {
                detected = true;
                return false;
            }
        });
        return detected;
    }
    getAnyObjectWithClassName(className) {
        let ret = null;
        this.nodes.forEach((node) => {
            if (node.name === className && node.type === 'object') {
                ret = node;
                return false;
            }
        });
        return ret;
    }
    hasObjectWithPropertyName(nameOrIndex) {
        let detected = false;
        this.edges.forEach((edge) => {
            if (edge.name_or_index === nameOrIndex && edge.type === 'property') {
                detected = true;
                return false;
            }
        });
        return detected;
    }
    hasObjectWithTag(tag) {
        return MemLabTagStore_1.default.hasObjectWithTag(this, tag);
    }
    getNodeById(id) {
        const idx = this._nodeId2NodeIdx.get(id);
        return idx == null ? null : new HeapNode_1.default(this, idx);
    }
    getNodesByIds(ids) {
        const ret = [];
        ids.forEach(id => {
            const idx = this._nodeId2NodeIdx.get(id);
            ret.push(idx == null ? null : new HeapNode_1.default(this, idx));
        });
        return ret;
    }
    getNodesByIdSet(ids) {
        const ret = new Set();
        ids.forEach(id => {
            const idx = this._nodeId2NodeIdx.get(id);
            if (idx != null) {
                ret.add(new HeapNode_1.default(this, idx));
            }
        });
        return ret;
    }
    clearShortestPathInfo() {
        this._nodeIdxHasPathEdge = new Uint8Array(this._nodeCount);
    }
    _buildMetaData() {
        this._calculateBasicInfo();
        this._buildReferencesIndex();
        this._buildReferrersIndex();
        this._propagateDetachednessState();
        this._buildNodeIdx();
        this._buildLocationIdx();
        this._buildExtraMetaData();
    }
    _buildExtraMetaData() {
        Console_1.default.overwrite('building extra meta info...');
        // maps node index to the edge index (from edge) of its shortest path to GC root
        this._nodeIdx2PathEdgeIdx = new Uint32Array(this._nodeCount);
        this._nodeIdxHasPathEdge = new Uint8Array(this._nodeCount);
        // dominator node info
        this._nodeIdx2DominatorNodeIdx = new Uint32Array(this._nodeCount);
        this._nodeIdxHasDominatorNode = new Uint8Array(this._nodeCount);
        // retained size info
        this._nodeIdx2RetainedSize = new BigUint64Array(this._nodeCount);
        // additional attributes
        this._additionalAttributes = new Uint8Array(this._nodeCount);
        // additional detachedness info
        if (this._nodeDetachednessOffset < 0) {
            this._externalDetachedness = new Uint8Array(this._nodeCount);
        }
    }
    _buildLocationIdx() {
        Console_1.default.overwrite('building location index...');
        this._nodeIdx2LocationIdx = new Uint32Array(this._nodeCount);
        // use the total location count as a guard value for no mapping
        this._nodeIdx2LocationIdx.fill(this._locationCount);
        // iterate over locations
        const locations = this.snapshot.locations;
        const locationFieldsCount = this._locationFieldsCount;
        let locationIdx = 0;
        while (locationIdx < this._locationCount) {
            const nodeIndex = locations[locationIdx * locationFieldsCount + this._locationObjectIndexOffset];
            this._nodeIdx2LocationIdx[nodeIndex] = locationIdx;
            ++locationIdx;
        }
    }
    _buildNodeIdx() {
        Console_1.default.overwrite('building node index...');
        this._nodeId2NodeIdx = new NumericDictionary_1.default(this._nodeCount, {
            fastStoreSize: Config_1.default.heapParserDictFastStoreSize,
        });
        // iterate over each node
        const nodeValues = this.snapshot.nodes;
        const nodeFieldsCount = this._nodeFieldsCount;
        let nodeIdx = 0;
        while (nodeIdx < this._nodeCount) {
            const id = nodeValues[nodeIdx * nodeFieldsCount + this._nodeIdOffset];
            this._nodeId2NodeIdx.set(id, nodeIdx);
            ++nodeIdx;
        }
    }
    _calculateBasicInfo() {
        Console_1.default.overwrite('calculating basic meta info...');
        this.forwardEdges = this.snapshot.edges;
        const meta = this._metaNode;
        const nodeFields = meta.node_fields;
        this._nodeTypeOffset = nodeFields.indexOf('type');
        this._nodeNameOffset = nodeFields.indexOf('name');
        this._nodeIdOffset = nodeFields.indexOf('id');
        this._nodeSelfSizeOffset = nodeFields.indexOf('self_size');
        this._nodeEdgeCountOffset = nodeFields.indexOf('edge_count');
        this._nodeTraceNodeIdOffset = nodeFields.indexOf('trace_node_id');
        this._nodeDetachednessOffset = nodeFields.indexOf('detachedness');
        Config_1.default.snapshotHasDetachedness = this._nodeDetachednessOffset >= 0;
        this._nodeFieldsCount = nodeFields.length;
        const nodeTypes = meta.node_types[this._nodeTypeOffset];
        this._nodeTypes = nodeTypes;
        this._nodeArrayType = nodeTypes.indexOf('array');
        this._nodeHiddenType = nodeTypes.indexOf('hidden');
        this._nodeObjectType = nodeTypes.indexOf('object');
        this._nodeNativeType = nodeTypes.indexOf('native');
        this._nodeConsStringType = nodeTypes.indexOf('concatenated string');
        this._nodeSlicedStringType = nodeTypes.indexOf('sliced string');
        this._nodeCodeType = nodeTypes.indexOf('code');
        this._nodeSyntheticType = nodeTypes.indexOf('synthetic');
        const edgeFields = meta.edge_fields;
        this._edgeFieldsCount = edgeFields.length;
        this._edgeTypeOffset = edgeFields.indexOf('type');
        this._edgeNameOrIndexOffset = edgeFields.indexOf('name_or_index');
        this._edgeToNodeOffset = edgeFields.indexOf('to_node');
        const edgeTypes = meta.edge_types[this._edgeTypeOffset];
        edgeFields.push('invisible');
        this._edgeTypes = edgeTypes;
        this._edgeElementType = edgeFields.indexOf('element');
        this._edgeHiddenType = edgeFields.indexOf('hidden');
        this._edgeInternalType = edgeFields.indexOf('internal');
        this._edgeShortcutType = edgeFields.indexOf('shortcut');
        this._edgeWeakType = edgeFields.indexOf('weak');
        this._edgeInvisibleType = edgeFields.indexOf('invisible');
        const locationFields = meta.location_fields || [];
        this._locationObjectIndexOffset = locationFields.indexOf('object_index');
        this._locationScriptIdOffset = locationFields.indexOf('script_id');
        this._locationLineOffset = locationFields.indexOf('line');
        this._locationColumnOffset = locationFields.indexOf('column');
        this._locationFieldsCount = locationFields.length;
        const snapshot = this.snapshot;
        this._nodeCount = snapshot.nodes.length / this._nodeFieldsCount;
        this._edgeCount = this.forwardEdges.length / this._edgeFieldsCount;
        this._locationCount = snapshot.locations.length / this._locationFieldsCount;
    }
    // create array that maps node index in node list to
    // the node's first edge index in forward edge list
    _buildReferencesIndex() {
        Console_1.default.overwrite('building reference index...');
        this._firstEdgePointers = new Uint32Array(this._nodeCount + 1);
        const nodes = this.snapshot.nodes;
        const nodeCount = this._nodeCount;
        const firstEdgePointers = this._firstEdgePointers;
        const nodeFieldsCount = this._nodeFieldsCount;
        const edgeFieldsCount = this._edgeFieldsCount;
        const nodeEdgeCountOffset = this._nodeEdgeCountOffset;
        firstEdgePointers[nodeCount] = this.forwardEdges.length;
        let edgePointer = 0;
        for (let nodeIndex = 0; nodeIndex < nodeCount; ++nodeIndex) {
            firstEdgePointers[nodeIndex] = edgePointer;
            const nodeEdgeCountPointer = nodeIndex * nodeFieldsCount + nodeEdgeCountOffset;
            edgePointer += nodes[nodeEdgeCountPointer] * edgeFieldsCount;
        }
    }
    // build indexes for each node's retaining edge and retaining node
    _buildReferrersIndex() {
        Console_1.default.overwrite('building referrers index...');
        // init data
        const retainingEdgeCount = new Uint32Array(this._edgeCount);
        this._retainingEdgeIndex2EdgeIndex = new Uint32Array(this._edgeCount);
        // index of the first retainer edge in _retainingEdgeIndex2EdgeIndex
        this._firstRetainerIndex = new Uint32Array(this._nodeCount + 1);
        // map edge index to source node index
        this._edgeIndex2SrcNodeIndex = new Uint32Array(this._edgeCount);
        // calculate retainers
        const edgeIndex2SrcNodeIndex = this._edgeIndex2SrcNodeIndex;
        const retainingEdgeIndex2EdgeIndex = this._retainingEdgeIndex2EdgeIndex;
        const firstRetainerIndex = this._firstRetainerIndex;
        const forwardEdges = this.forwardEdges;
        const edgeFieldsCount = this._edgeFieldsCount;
        const nodeFieldsCount = this._nodeFieldsCount;
        const edgeToNodeOffset = this._edgeToNodeOffset;
        const firstEdgePointers = this._firstEdgePointers;
        const nodeCount = this._nodeCount;
        // calculate the number of retainer nodes for each node
        // temporarily store the information in firstRetainerIndex
        for (let toNodeFieldIndex = edgeToNodeOffset; toNodeFieldIndex < forwardEdges.length; toNodeFieldIndex += edgeFieldsCount) {
            const toNodeIndex = forwardEdges[toNodeFieldIndex];
            if (toNodeIndex % nodeFieldsCount) {
                (0, HeapUtils_1.throwError)(new Error('Invalid toNodeIndex ' + toNodeIndex));
            }
            ++firstRetainerIndex[toNodeIndex / nodeFieldsCount];
        }
        // calculate the actual first retainer node index info
        // temporarily store the number of retainers in retainingNodes (sparsely)
        for (let i = 0, firstUnusedRetainerSlot = 0; i < nodeCount; i++) {
            const retainersCount = firstRetainerIndex[i];
            firstRetainerIndex[i] = firstUnusedRetainerSlot;
            retainingEdgeCount[firstUnusedRetainerSlot] = retainersCount;
            firstUnusedRetainerSlot += retainersCount;
        }
        firstRetainerIndex[nodeCount] = retainingEdgeCount.length;
        // calculate a compact array containing retainer node and retainer edge
        let nextNodeFirstEdgePointer = firstEdgePointers[0];
        for (let srcNodeIndex = 0; srcNodeIndex < nodeCount; ++srcNodeIndex) {
            const firstEdgePointer = nextNodeFirstEdgePointer;
            nextNodeFirstEdgePointer = firstEdgePointers[srcNodeIndex + 1];
            for (let edgePointer = firstEdgePointer; edgePointer < nextNodeFirstEdgePointer; edgePointer += edgeFieldsCount) {
                const toNodePointer = forwardEdges[edgePointer + edgeToNodeOffset];
                if (toNodePointer % nodeFieldsCount) {
                    (0, HeapUtils_1.throwError)(Error('Invalid toNodeIndex ' + toNodePointer));
                }
                const toNodeIndex = toNodePointer / nodeFieldsCount;
                const firstRetainerSlotIndex = firstRetainerIndex[toNodeIndex];
                const nextUnusedRetainerSlotIndex = firstRetainerSlotIndex + --retainingEdgeCount[firstRetainerSlotIndex];
                const edgeIndex = edgePointer / edgeFieldsCount;
                retainingEdgeIndex2EdgeIndex[nextUnusedRetainerSlotIndex] = edgeIndex;
                edgeIndex2SrcNodeIndex[edgeIndex] = srcNodeIndex;
            }
        }
    }
    // a helper function that iterates the direct children of a given node
    _iterateDirectChildren(nodeIndex, edgeFilterCallback, childCallback) {
        const beginEdgePointer = this._firstEdgePointers[nodeIndex];
        const endEdgePointer = this._firstEdgePointers[nodeIndex + 1];
        for (let edgePointer = beginEdgePointer; edgePointer < endEdgePointer; edgePointer += this._edgeFieldsCount) {
            const childNodePointer = this.forwardEdges[edgePointer + this._edgeToNodeOffset];
            const childNodeIndex = childNodePointer / this._nodeFieldsCount;
            const type = this.forwardEdges[edgePointer + this._edgeTypeOffset];
            if (!edgeFilterCallback(type)) {
                continue;
            }
            childCallback(childNodeIndex);
        }
    }
    // initial detachedness state is available at entry point to native node
    // this helper function propagate the detachedness state to connected
    // native node (mainly DOM elements)
    _propagateDetachednessState() {
        if (this._nodeDetachednessOffset === -1) {
            return;
        }
        Console_1.default.overwrite('propagating detachedness state...');
        const visited = new Uint8Array(this._nodeCount);
        const attached = [];
        const detached = [];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const setNodeDetachState = function (snapshot, nodeIndex, detachedness) {
            if (visited[nodeIndex] === 1) {
                return;
            }
            const nodePointer = nodeIndex * self._nodeFieldsCount;
            // Do not propagate the state (and name change) through JavaScript.
            // From V8: Every entry point into embedder code is a node that knows
            // its own state. All embedder nodes have their node type set to native.
            if (snapshot.nodes[nodePointer + self._nodeTypeOffset] !==
                self._nodeNativeType) {
                visited[nodeIndex] = 1;
                return;
            }
            snapshot.nodes[nodePointer + self._nodeDetachednessOffset] = detachedness;
            if (detachedness === HeapUtils_1.NodeDetachState.Attached) {
                attached.push(nodeIndex);
            }
            else if (detachedness === HeapUtils_1.NodeDetachState.Detached) {
                detached.push(nodeIndex);
            }
            visited[nodeIndex] = 1;
        };
        const hiddenEdgeTypes = [
            self._edgeHiddenType,
            self._edgeInvisibleType,
            self._edgeWeakType,
        ];
        const filterEdge = function (edgeType) {
            return hiddenEdgeTypes.indexOf(edgeType) < 0;
        };
        const propagate = function (snapshot, nodeIndex, detachedness) {
            self._iterateDirectChildren(nodeIndex, filterEdge, childNodeIndex => setNodeDetachState(snapshot, childNodeIndex, detachedness));
        };
        // add attached and detached nodes to queue
        for (let nodeIndex = 0; nodeIndex < this._nodeCount; ++nodeIndex) {
            const state = this.snapshot.nodes[nodeIndex * this._nodeFieldsCount + this._nodeDetachednessOffset];
            if (state === HeapUtils_1.NodeDetachState.Unknown) {
                continue;
            }
            setNodeDetachState(this.snapshot, nodeIndex, state);
        }
        // if the parent is attached, then the child is also attached
        while (attached.length > 0) {
            const nodeIndex = attached.pop();
            if (nodeIndex != null) {
                propagate(this.snapshot, nodeIndex, HeapUtils_1.NodeDetachState.Attached);
            }
        }
        // if the parent is not attached, then the child inherits the parent's state
        while (detached.length > 0) {
            const nodeIndex = detached.pop();
            if (nodeIndex == null) {
                continue; // make TS code strict mode happy
            }
            const detachedness = this.snapshot.nodes[nodeIndex * this._nodeFieldsCount + this._nodeDetachednessOffset];
            if (detachedness === HeapUtils_1.NodeDetachState.Attached) {
                continue;
            }
            propagate(this.snapshot, nodeIndex, HeapUtils_1.NodeDetachState.Detached);
        }
    }
}
exports.default = HeapSnapshot;
