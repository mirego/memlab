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
exports.FilterTrivialNodeRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
const Utils_1 = __importDefault(require("../../Utils"));
/**
 * trivial nodes are not reported as memory leaks
 */
class FilterTrivialNodeRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(config, node) {
        return this.isTrivialNode(node)
            ? BaseLeakFilter_rule_1.LeakDecision.NOT_LEAK
            : BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
    isTrivialNode(node) {
        return (node.type === 'number' ||
            Utils_1.default.isStringNode(node) ||
            node.type === 'hidden');
    }
}
exports.FilterTrivialNodeRule = FilterTrivialNodeRule;
