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
exports.FilterByExternalFilterRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
/**
 * filter memory leaks defined by external leak filter
 */
class FilterByExternalFilterRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(config, node, snapshot, leakedNodeIds) {
        var _a;
        if (((_a = config.externalLeakFilter) === null || _a === void 0 ? void 0 : _a.leakFilter) == null) {
            return BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
        }
        return config.externalLeakFilter.leakFilter(node, snapshot, leakedNodeIds)
            ? BaseLeakFilter_rule_1.LeakDecision.LEAK
            : BaseLeakFilter_rule_1.LeakDecision.NOT_LEAK;
    }
}
exports.FilterByExternalFilterRule = FilterByExternalFilterRule;
