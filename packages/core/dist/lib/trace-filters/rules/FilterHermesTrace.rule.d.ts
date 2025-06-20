/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { LeakTracePathItem } from '../../Types';
import { ILeakTraceFilterRule, LeakTraceFilterOptions, TraceDecision } from '../BaseTraceFilter.rule';
export declare class FilterHermesTraceRule implements ILeakTraceFilterRule {
    filter(_p: LeakTracePathItem, options?: LeakTraceFilterOptions): TraceDecision;
}
//# sourceMappingURL=FilterHermesTrace.rule.d.ts.map