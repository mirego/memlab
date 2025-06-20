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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const core_1 = require("@memlab/core");
const HeapAnalysisSnapshotDirectoryOption_1 = __importDefault(require("../options/HeapAnalysisSnapshotDirectoryOption"));
const BaseAnalysis_1 = __importDefault(require("../BaseAnalysis"));
const PluginUtils_1 = __importDefault(require("../PluginUtils"));
class ShapeUnboundGrowthAnalysis extends BaseAnalysis_1.default {
    constructor() {
        super(...arguments);
        this.shapesOfInterest = null;
        this.shapesWithUnboundGrowth = [];
    }
    getCommandName() {
        return 'unbound-shape';
    }
    /** @internal */
    getDescription() {
        return ('Get shapes with unbound growth ' +
            '(a class of objects with growing aggregated retained size)');
    }
    /** @internal */
    getOptions() {
        return [new HeapAnalysisSnapshotDirectoryOption_1.default()];
    }
    /** @internal */
    analyzeSnapshotFromFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const f = file;
            throw core_1.utils.haltOrThrow(`${this.constructor.name} does not support analyzeSnapshotFromFile`);
        });
    }
    getShapesWithUnboundGrowth() {
        return this.shapesWithUnboundGrowth;
    }
    /** @internal */
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = yield PluginUtils_1.default.snapshotMapReduce(this.getShapesInfo.bind(this), this.getSummary, options);
            this.retrieveShapesOfInterest(list);
            list = yield PluginUtils_1.default.snapshotMapReduce(this.getShapesInfo.bind(this), this.getSummary, options);
            this.shapesOfInterest = null;
            this.shapesWithUnboundGrowth = list;
            this.print(list);
        });
    }
    retrieveShapesOfInterest(list) {
        this.shapesOfInterest = new Set();
        for (const summary of list) {
            this.shapesOfInterest.add(summary.shape);
        }
    }
    getShapesInfo(snapshot) {
        const population = Object.create(null);
        const shapes = this.shapesOfInterest;
        // group objects based on their shapes
        snapshot.nodes.forEach(node => {
            if ((node.type !== 'object' && !core_1.utils.isStringNode(node)) ||
                core_1.config.nodeIgnoreSetInShape.has(node.name)) {
                return;
            }
            const key = core_1.serializer.summarizeNodeShape(node, { color: true });
            if (shapes && !shapes.has(key)) {
                return;
            }
            population[key] =
                population[key] ||
                    {
                        shape: key,
                        n: 0,
                        examples: [],
                        ids: new Set(),
                    };
            const record = population[key];
            ++record.n;
            if (record.examples.length < 3) {
                record.examples.push(node.id);
            }
            if (shapes && shapes.has(key)) {
                record.ids.add(node.id);
            }
        });
        if (shapes) {
            for (const record of Object.values(population)) {
                record.size = PluginUtils_1.default.aggregateDominatorMetrics(record.ids, snapshot, () => true, node => node.retainedSize);
                record.ids = new Set();
            }
        }
        return population;
    }
    getSummary(ShapesInfoList) {
        const shapes = Object.create(null);
        for (const population of ShapesInfoList) {
            for (const key in population) {
                shapes[key] = shapes[key] || {
                    decrease: false,
                    increase: false,
                    counts: [],
                    sizes: [],
                    examples: [],
                };
                if (shapes[key].decrease) {
                    continue;
                }
                const counts = shapes[key].counts;
                const n = population[key].n;
                if (counts.length > 0 && counts[counts.length - 1] > n) {
                    shapes[key].decrease = true;
                    continue;
                }
                if (counts.length > 0 && counts[counts.length - 1] < n) {
                    shapes[key].increase = true;
                }
                counts.push(n);
                shapes[key].sizes.push(population[key].size);
                const examples = shapes[key].examples;
                examples.push(population[key].examples[0]);
            }
        }
        const result = [];
        for (const key in shapes) {
            if (!shapes[key].increase) {
                continue;
            }
            if (shapes[key].decrease || shapes[key].counts.length <= 1) {
                continue;
            }
            const counts = shapes[key].counts;
            if (counts[counts.length - 1] < 1000) {
                continue;
            }
            const examples = shapes[key].examples;
            const sizes = shapes[key].sizes;
            result.push({ shape: key, counts, examples, sizes });
        }
        result.sort((v1, v2) => v2.counts[v2.counts.length - 1] - v1.counts[v1.counts.length - 1]);
        return result;
    }
    print(list) {
        const colon = chalk_1.default.grey(': ');
        const sep = chalk_1.default.grey(' > ');
        const sep2 = chalk_1.default.grey(', ');
        const dot = chalk_1.default.grey('· ');
        for (const item of list) {
            const shapeStat = [];
            for (let i = 0; i < item.counts.length; ++i) {
                let size = core_1.utils.getReadableBytes(item.sizes[i]);
                size = chalk_1.default.grey(size);
                shapeStat.push(`${item.counts[i]} (${size})`);
            }
            const countHistory = shapeStat.join(sep);
            const examples = item.examples.map(v => `@${v}`).join(sep2);
            const msg = `${dot}${item.shape}${colon}${countHistory}${colon}${examples}`;
            core_1.info.topLevel(msg);
        }
    }
}
exports.default = ShapeUnboundGrowthAnalysis;
