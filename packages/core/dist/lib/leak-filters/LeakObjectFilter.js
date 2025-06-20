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
exports.LeakObjectFilter = void 0;
const BaseLeakFilter_rule_1 = require("./BaseLeakFilter.rule");
const LeakFilterRuleList_1 = __importDefault(require("./LeakFilterRuleList"));
/**
 * apply the leak object filter rules chain and decide
 * if an object is a memory leak or not
 */
class LeakObjectFilter {
    beforeFiltering(config, snapshot, leakedNodeIds) {
        for (const rule of LeakFilterRuleList_1.default) {
            rule.beforeFiltering(config, snapshot, leakedNodeIds);
        }
    }
    filter(config, node, snapshot, leakedNodeIds) {
        for (const rule of LeakFilterRuleList_1.default) {
            const decision = rule.filter(config, node, snapshot, leakedNodeIds);
            if (decision === BaseLeakFilter_rule_1.LeakDecision.LEAK) {
                return true;
            }
            if (decision === BaseLeakFilter_rule_1.LeakDecision.NOT_LEAK) {
                return false;
            }
        }
        return false;
    }
}
exports.LeakObjectFilter = LeakObjectFilter;
