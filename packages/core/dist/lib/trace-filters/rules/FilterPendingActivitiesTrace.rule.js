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
exports.FilterPendingActivitiesTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const Utils_1 = __importDefault(require("../../Utils"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterPendingActivitiesTraceRule {
    filter(p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // if the path has pattern: Pending activitiies -> DetachedElement
        if (curConfig.hideBrowserLeak &&
            pendingActivitiesRetainsDetachedElementChain(p)) {
            return BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterPendingActivitiesTraceRule = FilterPendingActivitiesTraceRule;
function pendingActivitiesRetainsDetachedElementChain(path) {
    let p = path;
    // find the Pending activities
    while (p && p.node && !Utils_1.default.isPendingActivityNode(p.node)) {
        p = p.next;
        if (!p) {
            return false;
        }
    }
    p = p.next;
    if (!p || !p.node) {
        return false;
    }
    // Scan the rest of the trace, if the following check is met,
    // the leak trace is considered as not suitable for debugging:
    // If the scanner encounters an object o on the
    // rest of the leak trace, where o is neither a detached DOM node nor a
    // Fiber Node and if the scanner didn't hit a detached DOM node first
    while (p && p.node) {
        if (Utils_1.default.isDetachedDOMNode(p.node)) {
            return true;
        }
        if (!Utils_1.default.isDOMInternalNode(p.node) &&
            !Utils_1.default.isDetachedDOMNode(p.node) &&
            !Utils_1.default.isFiberNode(p.node)) {
            return false;
        }
        p = p.next;
    }
    return true;
}
