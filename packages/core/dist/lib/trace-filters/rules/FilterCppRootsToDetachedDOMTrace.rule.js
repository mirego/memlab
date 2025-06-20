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
exports.FilterCppRootsToDetachedDOMTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const Utils_1 = __importDefault(require("../../Utils"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterCppRootsToDetachedDOMTraceRule {
    filter(p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // if the path contains edges from [C++ roots] to detached DOM elements
        if (curConfig.hideBrowserLeak && hasCppRootsToDetachedDOMNode(p)) {
            return BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterCppRootsToDetachedDOMTraceRule = FilterCppRootsToDetachedDOMTraceRule;
function hasCppRootsToDetachedDOMNode(path) {
    let p = path;
    // all the reference chain consists of DOM elements/nodes
    while (p && p.node) {
        if (Utils_1.default.isCppRootsNode(p.node) &&
            p.next &&
            p.next.node &&
            Utils_1.default.isDOMNodeIncomplete(p.next.node)) {
            return true;
        }
        p = p.next;
    }
    return false;
}
