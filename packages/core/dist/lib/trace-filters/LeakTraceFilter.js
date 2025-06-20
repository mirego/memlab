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
exports.LeakTraceFilter = void 0;
const BaseTraceFilter_rule_1 = require("./BaseTraceFilter.rule");
const TraceFilterRuleList_1 = __importDefault(require("./TraceFilterRuleList"));
/**
 * apply the leak trace filter rules chain and decide
 * if a leak trace is useful for memory debugging,
 * by default all leak traces are considered useful
 */
class LeakTraceFilter {
    filter(p, options) {
        for (const rule of TraceFilterRuleList_1.default) {
            const decision = rule.filter(p, options);
            if (decision === BaseTraceFilter_rule_1.TraceDecision.INSIGHTFUL) {
                return true;
            }
            if (decision === BaseTraceFilter_rule_1.TraceDecision.NOT_INSIGHTFUL) {
                return false;
            }
        }
        return true;
    }
}
exports.LeakTraceFilter = LeakTraceFilter;
