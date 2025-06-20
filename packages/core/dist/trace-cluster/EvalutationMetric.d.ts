/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
type ClusteredLeakTraces = Record<string, string>;
declare const _default: {
    evaluateAdjustRandScore: (trueTraceIdLabelMap: ClusteredLeakTraces, predictedTraceIdLabelMap: ClusteredLeakTraces) => number;
    vMeasure: (trueLabels: number[], predictedLabels: number[], beta?: number) => number;
    completeness: (trueLabels: number[], predictedLabels: number[]) => number;
    homogeneity: (trueLabels?: number[], predictedLabels?: number[]) => number;
    getRepresentativeTraceMetrics: (trueTraceIdLabelMap: ClusteredLeakTraces, predictedTraceIdLabelMap: ClusteredLeakTraces) => {
        omitted: number;
        duplicated: number;
    };
};
export default _default;
//# sourceMappingURL=EvalutationMetric.d.ts.map