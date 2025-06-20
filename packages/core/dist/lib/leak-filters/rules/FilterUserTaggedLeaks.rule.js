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
exports.FilterUserTaggedLeaksRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
/**
 * leaked objects that are tagged by user code
 */
class FilterUserTaggedLeaksRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    constructor() {
        super(...arguments);
        this._taggedNodeIds = new Set();
    }
    beforeFiltering(_config, snapshot) {
        var _a, _b;
        let memlabTrackerNode = null;
        this._taggedNodeIds.clear();
        // find the memlab tracker object
        snapshot.nodes.forEach((node) => {
            const nodeHasIdentifierProp = null !=
                node.findAnyReference((edge) => {
                    return (edge.name_or_index === 'memlabIdentifier' &&
                        edge.toNode.name === 'MemLabObjectTracker');
                });
            if (nodeHasIdentifierProp) {
                memlabTrackerNode = node;
            }
            // if this is false, forEach finishes iteration
            return !nodeHasIdentifierProp;
        });
        // traverse the memlab tracker in heap to get all tagged nodes
        (_b = (_a = memlabTrackerNode === null || memlabTrackerNode === void 0 ? void 0 : memlabTrackerNode.getReferenceNode('tagToTrackedObjectsMap')) === null || _a === void 0 ? void 0 : _a.getReferenceNode('table', 'internal')) === null || _b === void 0 ? void 0 : _b.forEachReference((edge) => {
            var _a;
            // heap: trackedItem.taggedObjects.table
            const node = (_a = edge.toNode
                .getReferenceNode('taggedObjects')) === null || _a === void 0 ? void 0 : _a.getReferenceNode('table', 'internal');
            // traverse all weak edges in
            // trackedItem.taggedObjects.table
            node === null || node === void 0 ? void 0 : node.forEachReference((edge) => {
                if (edge.type === 'weak') {
                    this._taggedNodeIds.add(edge.toNode.id);
                }
            });
        });
    }
    filter(config, node) {
        return this.isReferencedByTaggedWeakRef(node) ||
            this.isReferencedByMemLabObjectTracker(node)
            ? BaseLeakFilter_rule_1.LeakDecision.LEAK
            : BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
    isReferencedByTaggedWeakRef(node) {
        return (node.findAnyReferrer((edge) => {
            if (edge.type !== 'weak') {
                return false;
            }
            const fromNode = edge.fromNode;
            if (fromNode == null || fromNode.name !== 'WeakRef') {
                return false;
            }
            return fromNode.getReference('refShouldRelease') != null;
        }) != null);
    }
    isReferencedByMemLabObjectTracker(node) {
        return this._taggedNodeIds.has(node.id);
    }
}
exports.FilterUserTaggedLeaksRule = FilterUserTaggedLeaksRule;
