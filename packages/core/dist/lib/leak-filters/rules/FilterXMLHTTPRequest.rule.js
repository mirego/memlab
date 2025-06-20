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
exports.FilterXMLHTTPRequestRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
/**
 * mark XMLHTTPRequest with status ok as memory leaks
 */
class FilterXMLHTTPRequestRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(_config, node) {
        return this.checkFinishedXMLHTTPRequest(node)
            ? BaseLeakFilter_rule_1.LeakDecision.LEAK
            : BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
    checkFinishedXMLHTTPRequest(node) {
        if (node.name !== 'XMLHttpRequest' || node.type !== 'native') {
            return false;
        }
        return (node.findAnyReference((edge) => edge.toNode.name === '{"status":"ok"}') != null);
    }
}
exports.FilterXMLHTTPRequestRule = FilterXMLHTTPRequestRule;
