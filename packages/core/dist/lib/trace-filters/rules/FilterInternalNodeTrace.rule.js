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
exports.FilterInternalNodeTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const Utils_1 = __importDefault(require("../../Utils"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterInternalNodeTraceRule {
    filter(p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // if the path has pattern: Window -> [InternalNode]+ -> DetachedElement
        if (curConfig.hideBrowserLeak && internalNodeRetainsDetachedElement(p)) {
            return BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterInternalNodeTraceRule = FilterInternalNodeTraceRule;
// check if the path has pattern:
// Window -> [InternalNode | Text]+ -> DetachedElement
function internalNodeRetainsDetachedElement(path) {
    var _a, _b;
    if (!path) {
        return false;
    }
    let p = path;
    // GC root is not Window
    if (!p.node || !p.node.name.startsWith('Window')) {
        return false;
    }
    p = p.next;
    // Window is not poining to InternalNode
    if (!p || !p.node || p.node.name !== 'InternalNode') {
        return false;
    }
    // skip the rest InternalNode
    while (((_a = p.node) === null || _a === void 0 ? void 0 : _a.name) === 'InternalNode' || ((_b = p.node) === null || _b === void 0 ? void 0 : _b.name) === 'Text') {
        p = p.next;
        if (!p) {
            return false;
        }
    }
    // check if the node is a detached element
    return p && Utils_1.default.isDetachedDOMNode(p.node);
}
