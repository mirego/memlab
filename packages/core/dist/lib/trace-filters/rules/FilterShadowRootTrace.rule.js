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
exports.FilterShadowRootTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const Utils_1 = __importDefault(require("../../Utils"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterShadowRootTraceRule {
    filter(p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // if the path has pattern: ShadowRoot -> DetachedElement
        if (curConfig.hideBrowserLeak && shadowRootRetainsDetachedElement(p)) {
            return BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterShadowRootTraceRule = FilterShadowRootTraceRule;
// check if the path has pattern: ShadowRoot -> DetachedElement
function shadowRootRetainsDetachedElement(path) {
    let p = path;
    // find the ShadowRoot
    while (p && p.node && p.node.name !== 'ShadowRoot') {
        p = p.next;
        if (!p) {
            return false;
        }
    }
    p = p.next;
    // check if the node is a detached element
    return !!p && Utils_1.default.isDetachedDOMNode(p.node);
}
