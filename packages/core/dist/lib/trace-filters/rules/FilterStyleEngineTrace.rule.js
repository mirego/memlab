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
exports.FilterStyleEngineTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const Utils_1 = __importDefault(require("../../Utils"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterStyleEngineTraceRule {
    filter(p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // if the path has pattern: StyleEngine -> InternalNode -> DetachedElement
        if (curConfig.hideBrowserLeak && styleEngineRetainsDetachedElement(p)) {
            return BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterStyleEngineTraceRule = FilterStyleEngineTraceRule;
// check if the path has pattern: StyleEngine -> InternalNode -> DetachedElement
function styleEngineRetainsDetachedElement(path) {
    let p = path;
    // find the StyleEngine
    while (p && p.node && p.node.name !== 'StyleEngine') {
        p = p.next;
        if (!p) {
            return false;
        }
    }
    p = p.next;
    // StyleEngine is not poining to InternalNode
    if (!p || !p.node || p.node.name !== 'InternalNode') {
        return false;
    }
    p = p.next;
    // check if the InternalNode is pointing to a detached element
    return !!p && Utils_1.default.isDetachedDOMNode(p.node);
}
