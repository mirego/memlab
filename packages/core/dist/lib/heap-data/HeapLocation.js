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
Object.defineProperty(exports, "__esModule", { value: true });
class HeapLocation {
    constructor(heapSnapshot, idx) {
        this.heapSnapshot = heapSnapshot;
        this.idx = idx;
    }
    get snapshot() {
        return this.heapSnapshot;
    }
    get node() {
        const heapSnapshot = this.heapSnapshot;
        const locations = heapSnapshot.snapshot.locations;
        const locationFieldsCount = heapSnapshot._locationFieldsCount;
        const objectIndex = locations[this.idx * locationFieldsCount + heapSnapshot._locationObjectIndexOffset];
        return heapSnapshot.nodes.get(objectIndex);
    }
    get script_id() {
        const heapSnapshot = this.heapSnapshot;
        const locations = heapSnapshot.snapshot.locations;
        const locationFieldsCount = heapSnapshot._locationFieldsCount;
        return locations[this.idx * locationFieldsCount + heapSnapshot._locationScriptIdOffset];
    }
    get line() {
        const heapSnapshot = this.heapSnapshot;
        const locations = heapSnapshot.snapshot.locations;
        const locationFieldsCount = heapSnapshot._locationFieldsCount;
        return locations[this.idx * locationFieldsCount + heapSnapshot._locationLineOffset];
    }
    get column() {
        const heapSnapshot = this.heapSnapshot;
        const locations = heapSnapshot.snapshot.locations;
        const locationFieldsCount = heapSnapshot._locationFieldsCount;
        return locations[this.idx * locationFieldsCount + heapSnapshot._locationColumnOffset];
    }
    getJSONifyableObject() {
        const node = this.node;
        const jsonNode = node == null ? null : node.getJSONifyableObject();
        return {
            node: jsonNode,
            script_id: this.script_id,
            line: this.line,
            column: this.column,
        };
    }
    toJSONString(...args) {
        const rep = this.getJSONifyableObject();
        return JSON.stringify(rep, ...args);
    }
}
exports.default = HeapLocation;
