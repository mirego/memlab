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
exports.FilterHermesNodeRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
const Utils_1 = __importDefault(require("../../Utils"));
class FilterHermesNodeRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(config, node) {
        // when analyzing hermes heap snapshots, filter Hermes internal objects
        if (config.jsEngine === 'hermes' && Utils_1.default.isHermesInternalObject(node)) {
            return BaseLeakFilter_rule_1.LeakDecision.NOT_LEAK;
        }
        return BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
}
exports.FilterHermesNodeRule = FilterHermesNodeRule;
