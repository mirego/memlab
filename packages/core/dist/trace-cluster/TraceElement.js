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
exports.EdgeRecord = exports.NodeRecord = void 0;
const Utils_1 = __importDefault(require("../lib/Utils"));
class NodeRecord {
    markAsDetached() {
        throw new Error('NodeRecord.markAsDetached not callable.');
    }
    get isString() {
        return Utils_1.default.isStringNode(this);
    }
    set isString(b) {
        throw new Error('NodeRecord.string cannot be assigned');
    }
    set snapshot(s) {
        throw new Error('NodeRecord.snapshot cannot be assigned.');
    }
    get snapshot() {
        throw new Error('NodeRecord.snapshot cannot be read.');
    }
    set references(r) {
        throw new Error('NodeRecord.references cannot be assigned');
    }
    get references() {
        throw new Error('NodeRecord.references cannot be read');
    }
    forEachReference(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _callback) {
        throw new Error('NodeRecord.forEachReference is not implemented');
    }
    set referrers(r) {
        throw new Error('NodeRecord.referrers cannot be assigned');
    }
    get referrers() {
        throw new Error('NodeRecord.referrers cannot be read');
    }
    get numOfReferrers() {
        throw new Error('NodeRecord.numOfReferrers cannot be read');
    }
    toStringNode() {
        throw new Error('NodeRecord.toStringNode is not implemented');
    }
    forEachReferrer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _callback) {
        throw new Error('NodeRecord.forEachReferrer is not implemented');
    }
    findAnyReference() {
        throw new Error('NodeRecord.findAnyReference is not implemented');
    }
    findAnyReferrer() {
        throw new Error('NodeRecord.findAnyReferrer is not implemented');
    }
    findAnyReferrerNode() {
        throw new Error('NodeRecord.findAnyReferrerNode is not implemented');
    }
    findReferrers() {
        throw new Error('NodeRecord.findReferrers is not implemented');
    }
    findReferrerNodes() {
        throw new Error('NodeRecord.findReferrerNodes is not implemented');
    }
    set hasPathEdge(f) {
        throw new Error('NodeRecord.hasPathEdge cannot be assigned');
    }
    get hasPathEdge() {
        throw new Error('NodeRecord.hasPathEdge cannot be read');
    }
    set pathEdge(r) {
        throw new Error('NodeRecord.pathEdge cannot be assigned');
    }
    get pathEdge() {
        throw new Error('NodeRecord.pathEdge cannot be read');
    }
    set dominatorNode(r) {
        throw new Error('NodeRecord.pathEdge cannot be assigned');
    }
    get dominatorNode() {
        throw new Error('NodeRecord.pathEdge cannot be read');
    }
    set location(r) {
        throw new Error('NodeRecord.location cannot be assigned');
    }
    get location() {
        throw new Error('NodeRecord.location cannot be read');
    }
    getReference(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeType) {
        throw new Error('NodeRecord.getReference is not implemented');
    }
    getReferenceNode(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeType) {
        throw new Error('NodeRecord.getReferenceNode is not implemented');
    }
    getAnyReferrer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeType) {
        throw new Error('NodeRecord.getReferrer is not implemented');
    }
    getAnyReferrerNode(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeType) {
        throw new Error('NodeRecord.getReferrerNode is not implemented');
    }
    getReferrers(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeType) {
        throw new Error('NodeRecord.getReferrers is not implemented');
    }
    getReferrerNodes(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeName, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _edgeType) {
        throw new Error('NodeRecord.getReferrerNodes is not implemented');
    }
    getJSONifyableObject() {
        return {
            id: this.id,
            kind: this.kind,
            name: this.name,
            type: this.type,
            self_size: this.self_size,
            trace_node_id: this.trace_node_id,
            nodeIndex: this.nodeIndex,
            incomingEdgeCount: this.numOfReferrers,
            contructorName: this.constructor.name,
        };
    }
    toJSONString(...args) {
        return JSON.stringify(this.getJSONifyableObject(), ...args);
    }
    constructor(node) {
        this.kind = 'node';
        this.name = this.extraceNodeName(node);
        this.type = node.type;
        this.id = node.id;
        this.is_detached = node.is_detached;
        this.detachState = node.detachState;
        this.attributes = node.attributes;
        this.self_size = node.self_size;
        this.edge_count = node.edge_count;
        this.trace_node_id = node.trace_node_id;
        this.nodeIndex = node.nodeIndex;
        this.retainedSize = node.retainedSize;
        this.highlight = node.highlight;
    }
    extraceNodeName(node) {
        // deserialized node may not have snapshot info
        if (!node.snapshot || !Utils_1.default.isFiberNode(node)) {
            return node.name;
        }
        return Utils_1.default.extractFiberNodeInfo(node);
    }
}
exports.NodeRecord = NodeRecord;
class EdgeRecord {
    constructor(edge) {
        this.kind = 'edge';
        this.name_or_index = edge.name_or_index;
        this.type = edge.type;
        this.edgeIndex = edge.edgeIndex;
        this.is_index = edge.is_index;
        this.to_node = edge.to_node;
    }
    getJSONifyableObject() {
        return {
            kind: this.kind,
            name_or_index: this.name_or_index,
            type: this.type,
            edgeIndex: this.edgeIndex,
            to_node: this.to_node,
        };
    }
    toJSONString(...args) {
        return JSON.stringify(this.getJSONifyableObject(), ...args);
    }
    set snapshot(s) {
        throw new Error('EdgeRecord.snapshot cannot be assigned.');
    }
    get snapshot() {
        throw new Error('EdgeRecord.snapshot cannot be read.');
    }
    set toNode(s) {
        throw new Error('EdgeRecord.toNode cannot be assigned.');
    }
    get toNode() {
        throw new Error('EdgeRecord.toNode cannot be read.');
    }
    set fromNode(s) {
        throw new Error('EdgeRecord.fromNode cannot be assigned.');
    }
    get fromNode() {
        throw new Error('EdgeRecord.fromNode cannot be read.');
    }
}
exports.EdgeRecord = EdgeRecord;
