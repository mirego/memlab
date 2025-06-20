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
const FilterByExternalFilter_rule_1 = require("./rules/FilterByExternalFilter.rule");
const FilterDetachedDOMElement_rule_1 = require("./rules/FilterDetachedDOMElement.rule");
const FilterHermesNode_rule_1 = require("./rules/FilterHermesNode.rule");
const FilterOverSizedNodeAsLeak_rule_1 = require("./rules/FilterOverSizedNodeAsLeak.rule");
const FilterStackTraceFrame_rule_1 = require("./rules/FilterStackTraceFrame.rule");
const FilterTrivialNode_rule_1 = require("./rules/FilterTrivialNode.rule");
const FilterUnmountedFiberNode_rule_1 = require("./rules/FilterUnmountedFiberNode.rule");
const FilterXMLHTTPRequest_rule_1 = require("./rules/FilterXMLHTTPRequest.rule");
const FilterUserTaggedLeaks_rule_1 = require("./rules/FilterUserTaggedLeaks.rule");
const list = [
    new FilterUserTaggedLeaks_rule_1.FilterUserTaggedLeaksRule(),
    new FilterByExternalFilter_rule_1.FilterByExternalFilterRule(),
    new FilterTrivialNode_rule_1.FilterTrivialNodeRule(),
    new FilterHermesNode_rule_1.FilterHermesNodeRule(),
    new FilterOverSizedNodeAsLeak_rule_1.FilterOverSizedNodeAsLeakRule(),
    new FilterUnmountedFiberNode_rule_1.FilterUnmountedFiberNodeRule(),
    new FilterDetachedDOMElement_rule_1.FilterDetachedDOMElementRule(),
    new FilterStackTraceFrame_rule_1.FilterStackTraceFrameRule(),
    new FilterXMLHTTPRequest_rule_1.FilterXMLHTTPRequestRule(),
];
exports.default = (0, InternalValueSetter_1.setInternalValue)(list, __filename, Constant_1.default.internalDir);
