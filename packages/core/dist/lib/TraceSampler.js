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
const Config_1 = __importDefault(require("./Config"));
const Console_1 = __importDefault(require("./Console"));
const Utils_1 = __importDefault(require("./Utils"));
class TraceSampler {
    constructor(n, options = {}) {
        var _a;
        // the max number of traces after sampling
        this.maxCount = Config_1.default.maxSamplesForClustering;
        this.processed = 0;
        this.selected = 0;
        this.population = -1;
        this.maxCount = (_a = options.maxSample) !== null && _a !== void 0 ? _a : Config_1.default.maxSamplesForClustering;
        this.init(n);
    }
    init(n) {
        this.processed = 0;
        this.selected = 0;
        this.population = n;
        this.calculateSampleRatio(n);
    }
    calculateSampleRatio(n) {
        const sampleRatio = Math.min(1, this.maxCount / n);
        if (sampleRatio < 1) {
            Console_1.default.warning('Sampling trace due to a large number of traces:');
            Console_1.default.lowLevel(` Number of Traces: ${n}`);
            Console_1.default.lowLevel(` Sampling Ratio: ${Utils_1.default.getReadablePercent(sampleRatio)}`);
        }
        return sampleRatio;
    }
    /**
     * The caller decide to give up sampling this time.
     * This `giveup` and the `sample` method in aggregation should be
     * called `this.population` times.
     *
     * For example, if `giveup` is called n1 times,
     * and `sample` is called n2 times, then n1 + n2 === this.population.
     */
    giveup() {
        ++this.processed;
    }
    /**
     * This sample method should be called precisely this.population times.
     * @returns true if this sample should be taken
     */
    sample() {
        if (this.processed >= this.population) {
            throw Utils_1.default.haltOrThrow(`processing ${this.processed + 1} samples but total population is ${this.population}`);
        }
        // use large number to mod here to avoid too much console I/O
        if (!Config_1.default.isContinuousTest && this.processed % 771 === 0) {
            const percent = Utils_1.default.getReadablePercent(this.processed / this.population);
            Console_1.default.overwrite(`progress: ${this.processed} / ${this.population} (${percent})`);
        }
        const dynamicRatio = (this.maxCount - this.selected) / (this.population - this.processed);
        // increase the counter indicating how many samples has been processed
        ++this.processed;
        if (Math.random() <= dynamicRatio) {
            ++this.selected;
            return true;
        }
        return false;
    }
}
exports.default = TraceSampler;
