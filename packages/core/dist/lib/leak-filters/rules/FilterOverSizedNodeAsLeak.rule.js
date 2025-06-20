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
exports.FilterOverSizedNodeAsLeakRule = void 0;
const Utils_1 = __importDefault(require("../../Utils"));
const Config_1 = require("../../Config");
const BaseLeakFilter_rule_1 = require("../BaseLeakFilter.rule");
/**
 * trivial nodes are not reported as memory leaks
 */
class FilterOverSizedNodeAsLeakRule extends BaseLeakFilter_rule_1.LeakObjectFilterRuleBase {
    filter(config, node) {
        if (config.oversizeObjectAsLeak) {
            // TODO: add support to skip this check
            if (!isHeapNodeUsefulForLeakTraceDiffing(config, node)) {
                return BaseLeakFilter_rule_1.LeakDecision.NOT_LEAK;
            }
            return node.retainedSize > config.oversizeThreshold
                ? BaseLeakFilter_rule_1.LeakDecision.LEAK
                : BaseLeakFilter_rule_1.LeakDecision.NOT_LEAK;
        }
        return BaseLeakFilter_rule_1.LeakDecision.MAYBE_LEAK;
    }
}
exports.FilterOverSizedNodeAsLeakRule = FilterOverSizedNodeAsLeakRule;
function isHeapNodeUsefulForLeakTraceDiffing(config, node) {
    if (config.traceAllObjectsMode === Config_1.TraceObjectMode.Default) {
        return true;
    }
    const name = node.name;
    if (node.type !== 'object') {
        return false;
    }
    if (name.startsWith('system / ')) {
        return false;
    }
    if (Utils_1.default.isFiberNode(node) && !Utils_1.default.isDetachedFiberNode(node)) {
        return false;
    }
    if (Utils_1.default.isDOMNodeIncomplete(node) && !Utils_1.default.isDetachedDOMNode(node)) {
        return false;
    }
    if (node.getAnyReferrer('__proto__') != null) {
        return false;
    }
    if (node.getAnyReferrer('prototype') != null) {
        return false;
    }
    // react internal objects
    if (node.getAnyReferrer('dependencies') != null) {
        return false;
    }
    if (node.getAnyReferrer('memoizedState') != null) {
        return false;
    }
    if (node.getAnyReferrer('next') != null) {
        return false;
    }
    if (node.getAnyReferrer('deps') != null) {
        return false;
    }
    if (node.getReference('baseQueue') != null) {
        return false;
    }
    return true;
}
