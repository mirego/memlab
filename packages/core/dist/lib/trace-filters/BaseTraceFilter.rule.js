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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceDecision = void 0;
/**
 * Every leak trace filter rule needs to give a label
 * to each leak trace passed to the filter
 */
var TraceDecision;
(function (TraceDecision) {
    TraceDecision["INSIGHTFUL"] = "insightful";
    TraceDecision["MAYBE_INSIGHTFUL"] = "maybe-insightful";
    TraceDecision["NOT_INSIGHTFUL"] = "not-insightful";
})(TraceDecision = exports.TraceDecision || (exports.TraceDecision = {}));
