/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { LeakTrace } from '../lib/Types';
declare const _default: {
    isSimilarTrace: (t1: LeakTrace, t2: LeakTrace) => boolean;
};
export default _default;
/**
 * const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * randomChunks(elements, 3) -> [[4, 8, 3], [9, 5, 1], [2, 6, 7, 10]]
 * @internal
 */
export declare const randomChunks: <T>(items: T[], n: number) => T[][];
/**
 * chunks(elements, 3) -> [[1, 2, 3], [4, 5, 6], [7, 8, 9, 10]]
 * @internal
 */
export declare const chunks: <T>(items: T[], n: number) => T[][];
/** @internal*/
export declare const lastNodeFromTrace: (trace: LeakTrace) => import("../lib/Types").LeakTraceElement;
//# sourceMappingURL=ClusterUtils.d.ts.map