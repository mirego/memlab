/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
export type TraceSamplerOption = {
    maxSample?: number;
};
export default class TraceSampler {
    private maxCount;
    private processed;
    private selected;
    private population;
    constructor(n: number, options?: TraceSamplerOption);
    init(n: number): void;
    private calculateSampleRatio;
    /**
     * The caller decide to give up sampling this time.
     * This `giveup` and the `sample` method in aggregation should be
     * called `this.population` times.
     *
     * For example, if `giveup` is called n1 times,
     * and `sample` is called n2 times, then n1 + n2 === this.population.
     */
    giveup(): void;
    /**
     * This sample method should be called precisely this.population times.
     * @returns true if this sample should be taken
     */
    sample(): boolean;
}
//# sourceMappingURL=TraceSampler.d.ts.map