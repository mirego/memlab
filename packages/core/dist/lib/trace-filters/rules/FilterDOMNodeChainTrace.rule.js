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
exports.FilterDOMNodeChainTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const Utils_1 = __importDefault(require("../../Utils"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterDOMNodeChainTraceRule {
    filter(p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // if the path consists of only DOM native nodes/elements
        if (curConfig.hideBrowserLeak && isDOMNodeChain(p)) {
            return BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterDOMNodeChainTraceRule = FilterDOMNodeChainTraceRule;
function isDOMNodeChain(path) {
    let p = path;
    // all the reference chain consists of DOM elements/nodes
    while (p && p.node) {
        if (!Utils_1.default.isRootNode(p.node) && !Utils_1.default.isDOMNodeIncomplete(p.node)) {
            return false;
        }
        p = p.next;
    }
    return true;
}
