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
exports.FilterAttachedDOMToDetachedDOMTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const Utils_1 = __importDefault(require("../../Utils"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterAttachedDOMToDetachedDOMTraceRule {
    filter(p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // if the path consists of only DOM native nodes/elements
        if (curConfig.hideBrowserLeak && isAttachedDOMToDetachedDOMChain(p)) {
            return BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterAttachedDOMToDetachedDOMTraceRule = FilterAttachedDOMToDetachedDOMTraceRule;
// check if the path has pattern:
// [Attached Element] -> [InternalNode | Text]+ -> [Detached Element]
function isAttachedDOMToDetachedDOMChain(path) {
    if (!path) {
        return false;
    }
    let p = path;
    let hasEncounteredAttachedNode = false;
    // skip the rest InternalNode
    while (p != null && p.node) {
        if (Utils_1.default.isDetachedDOMNode(p.node)) {
            return hasEncounteredAttachedNode;
        }
        // else if this is an attached node
        if (Utils_1.default.isDOMNodeIncomplete(p.node)) {
            hasEncounteredAttachedNode = true;
        }
        else {
            // else if this not a DOM element
            hasEncounteredAttachedNode = false;
        }
        p = p.next;
    }
    return false;
}
