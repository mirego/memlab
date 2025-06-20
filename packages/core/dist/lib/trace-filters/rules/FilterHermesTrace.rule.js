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
exports.FilterHermesTraceRule = void 0;
const Config_1 = __importDefault(require("../../Config"));
const BaseTraceFilter_rule_1 = require("../BaseTraceFilter.rule");
class FilterHermesTraceRule {
    filter(_p, options = {}) {
        var _a;
        const curConfig = (_a = options.config) !== null && _a !== void 0 ? _a : Config_1.default;
        // do not filter out paths when analyzing Hermes snapshots
        if (curConfig.jsEngine === 'hermes') {
            return BaseTraceFilter_rule_1.TraceDecision.INSIGHTFUL;
        }
        return BaseTraceFilter_rule_1.TraceDecision.MAYBE_INSIGHTFUL;
    }
}
exports.FilterHermesTraceRule = FilterHermesTraceRule;
