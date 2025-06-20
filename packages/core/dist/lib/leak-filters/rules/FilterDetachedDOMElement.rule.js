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
exports.FilterDetachedDOMElementRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
const Utils_1 = __importDefault(require("../../Utils"));
/**
 * mark detached DOM elements as memory leaks
 */
class FilterDetachedDOMElementRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(_config, node) {
        const isDetached = Utils_1.default.isDetachedDOMNode(node, {
            ignoreInternalNode: true,
        });
        if (isDetached &&
            !isDominatedByEdgeName(node, 'stateNode') &&
            !isDetachedDOMNodeDominatedByDehydratedMemoizedState(node)) {
            return BaseLeakFilter_rule_1.LeakDecision.LEAK;
        }
        return BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
}
exports.FilterDetachedDOMElementRule = FilterDetachedDOMElementRule;
function isDominatedByEdgeName(node, edgeNameOrIndex) {
    var _a;
    const referrerNode = node.getAnyReferrerNode(edgeNameOrIndex);
    if (referrerNode == null) {
        return false;
    }
    return referrerNode.id === ((_a = node.dominatorNode) === null || _a === void 0 ? void 0 : _a.id);
}
// check if the input is a detached DOM node dominated by a 'dehydrated'
// edge from a memoizedState. In this case, the node is not a memory leak
function isDetachedDOMNodeDominatedByDehydratedMemoizedState(node) {
    var _a;
    const referrerNode = node.getAnyReferrerNode('dehydrated', 'property');
    if (referrerNode == null) {
        return false;
    }
    return (referrerNode.id === ((_a = node.dominatorNode) === null || _a === void 0 ? void 0 : _a.id) &&
        isDominatedByEdgeName(referrerNode, 'memoizedState'));
}
