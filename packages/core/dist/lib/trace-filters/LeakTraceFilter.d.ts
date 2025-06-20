/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { LeakTracePathItem } from '../Types';
import type { LeakTraceFilterOptions } from './BaseTraceFilter.rule';
/**
 * apply the leak trace filter rules chain and decide
 * if a leak trace is useful for memory debugging,
 * by default all leak traces are considered useful
 */
export declare class LeakTraceFilter {
    filter(p: LeakTracePathItem, options: LeakTraceFilterOptions): boolean;
}
//# sourceMappingURL=LeakTraceFilter.d.ts.map