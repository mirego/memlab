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
exports.FilterStackTraceFrameRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
const Utils_1 = __importDefault(require("../../Utils"));
/**
 * stack trace frames as memory leaks
 */
class FilterStackTraceFrameRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(_config, node) {
        return Utils_1.default.isStackTraceFrame(node)
            ? BaseLeakFilter_rule_1.LeakDecision.LEAK
            : BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
}
exports.FilterStackTraceFrameRule = FilterStackTraceFrameRule;
