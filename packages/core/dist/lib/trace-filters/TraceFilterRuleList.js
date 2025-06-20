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
const Constant_1 = __importDefault(require("../Constant"));
const InternalValueSetter_1 = require("../InternalValueSetter");
const FilterAttachedDOMToDetachedDOMTrace_rule_1 = require("./rules/FilterAttachedDOMToDetachedDOMTrace.rule");
const FilterCppRootsToDetachedDOMTrace_rule_1 = require("./rules/FilterCppRootsToDetachedDOMTrace.rule");
const FilterDOMNodeChainTrace_rule_1 = require("./rules/FilterDOMNodeChainTrace.rule");
const FilterHermesTrace_rule_1 = require("./rules/FilterHermesTrace.rule");
const FilterInternalNodeTrace_rule_1 = require("./rules/FilterInternalNodeTrace.rule");
const FilterPendingActivitiesTrace_rule_1 = require("./rules/FilterPendingActivitiesTrace.rule");
const FilterShadowRootTrace_rule_1 = require("./rules/FilterShadowRootTrace.rule");
const FilterStyleEngineTrace_rule_1 = require("./rules/FilterStyleEngineTrace.rule");
const list = [
    new FilterHermesTrace_rule_1.FilterHermesTraceRule(),
    new FilterInternalNodeTrace_rule_1.FilterInternalNodeTraceRule(),
    new FilterShadowRootTrace_rule_1.FilterShadowRootTraceRule(),
    new FilterStyleEngineTrace_rule_1.FilterStyleEngineTraceRule(),
    new FilterPendingActivitiesTrace_rule_1.FilterPendingActivitiesTraceRule(),
    new FilterDOMNodeChainTrace_rule_1.FilterDOMNodeChainTraceRule(),
    new FilterAttachedDOMToDetachedDOMTrace_rule_1.FilterAttachedDOMToDetachedDOMTraceRule(),
    new FilterCppRootsToDetachedDOMTrace_rule_1.FilterCppRootsToDetachedDOMTraceRule(),
];
exports.default = (0, InternalValueSetter_1.setInternalValue)(list, __filename, Constant_1.default.internalDir);
