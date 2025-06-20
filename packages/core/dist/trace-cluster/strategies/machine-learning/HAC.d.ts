/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
/**
 *
 * @param {*} nDocs number of docs
 * @param {*} D condenced distance matrix
 * @returns labels - list of doc ids as clusters
 */
export declare const cluster: (nDocs: number, condensedDistanceMatrix: Float32Array, maxDistanceThreshold: number) => number[] | Uint32Array;
//# sourceMappingURL=HAC.d.ts.map