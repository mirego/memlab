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
exports.FilterUnmountedFiberNodeRule = void 0;
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
const Utils_1 = __importDefault(require("../../Utils"));
/**
 * mark React FiberNodes without a React Fiber Root as memory leaks
 */
class FilterUnmountedFiberNodeRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(config, node) {
        if (this.checkDetachedFiberNode(config, node)) {
            return BaseLeakFilter_rule_1.LeakDecision.LEAK;
        }
        return BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
    checkDetachedFiberNode(config, node) {
        if (!config.detectFiberNodeLeak || !Utils_1.default.isFiberNode(node)) {
            return false;
        }
        if (!Utils_1.default.isDetachedFiberNode(node)) {
            return false;
        }
        return !Utils_1.default.isNodeDominatedByDeletionsArray(node);
    }
}
exports.FilterUnmountedFiberNodeRule = FilterUnmountedFiberNodeRule;
