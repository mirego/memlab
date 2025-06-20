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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
let uindex = 1;
function getUniqueID() {
    const randId = `${Math.random()}`;
    return `${process.pid}-${Date.now()}-${randId}-${uindex++}`;
}
/** @internal */
class MemLabTaggedStore {
    constructor() {
        this.id = getUniqueID();
        this.taggedObjects = Object.create(null);
    }
    // make sure it's a singleton
    static getInstance() {
        if (!MemLabTaggedStore.instance) {
            MemLabTaggedStore.instance = new MemLabTaggedStore();
        }
        return MemLabTaggedStore.instance;
    }
    // tag an object with a mark
    static tagObject(o, tag) {
        const store = MemLabTaggedStore.getInstance();
        if (!store.taggedObjects[tag]) {
            store.taggedObjects[tag] = new WeakSet();
        }
        store.taggedObjects[tag].add(o);
    }
    // check if any object in the heap snapshot has the mark
    // tagged by this MemLabTaggedStore in this execution context
    static hasObjectWithTag(heap, tag) {
        const curContextTagStoreID = MemLabTaggedStore.getInstance().id;
        let tagStore = null;
        // get all MemLabTaggedStore instances in the heap snapshot
        const stores = [];
        heap.nodes.forEach((node) => {
            if (node.name === 'MemLabTaggedStore' && node.type === 'object') {
                stores.push(node);
            }
        });
        // if no tag store found
        if (stores.length === 0) {
            return false;
            // if there is only one store found
        }
        else if (stores.length === 1) {
            tagStore = stores[0];
            // if there are multiple MemLabTagStore instances
            // found in the heap snapshot
        }
        else if (stores.length > 1) {
            stores.forEach((node) => {
                // in case multiple instances of MemLabTaggedStore exists
                // in the heap snapshot, we need to make sure that the
                // tag store is the one matching the current execution context
                let storeID = '';
                // match tag store id
                node.forEachReference(edge => {
                    var _a, _b;
                    if (edge.name_or_index === 'id' && edge.toNode.isString) {
                        storeID = (_b = (_a = edge.toNode.toStringNode()) === null || _a === void 0 ? void 0 : _a.stringValue) !== null && _b !== void 0 ? _b : '';
                        return { stop: true };
                    }
                });
                if (curContextTagStoreID === storeID) {
                    tagStore = node;
                }
            });
            if (tagStore == null) {
                throw __1.utils.haltOrThrow('Multiple MemLabTagStore instances found in heap snapshot ' +
                    'when checking object tags, please make sure only one memlab ' +
                    'instance is running at a time and double check that memlab is ' +
                    'not running in Jest concurrent mode.');
            }
        }
        if (tagStore == null) {
            return false;
        }
        const store = tagStore;
        // get tagStore.taggedObjects
        const taggedObjects = store.getReferenceNode('taggedObjects', 'property');
        if (taggedObjects == null) {
            return false;
        }
        // get taggedObjects[tag]
        const weakSet = taggedObjects.getReferenceNode(tag, 'property');
        if (weakSet == null) {
            return false;
        }
        // get weakSet.table
        const table = weakSet.getReferenceNode('table');
        if (table == null) {
            return false;
        }
        // check if the table has any weak reference to any object
        const ref = table.findAnyReference((edge) => edge.type === 'weak' && edge.toNode.name !== 'system / Oddball');
        return ref != null;
    }
}
exports.default = MemLabTaggedStore;
