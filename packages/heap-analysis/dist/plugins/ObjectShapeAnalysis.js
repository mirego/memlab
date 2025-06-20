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
const BaseAnalysis_1 = __importDefault(require("../BaseAnalysis"));
const PluginUtils_1 = __importDefault(require("../PluginUtils"));
const HeapAnalysisSnapshotFileOption_1 = __importDefault(require("../options/HeapAnalysisSnapshotFileOption"));
class ObjectShapeAnalysis extends BaseAnalysis_1.default {
    getCommandName() {
        return 'shape';
    }
    /** @internal */
    getDescription() {
        return 'List the shapes that retained most memory';
    }
    /** @internal */
    getOptions() {
        return [new HeapAnalysisSnapshotFileOption_1.default()];
    }
    /** @internal */
    analyzeSnapshotsInDirectory(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const d = directory;
            throw core_1.utils.haltOrThrow(`${this.constructor.name} does not support analyzeSnapshotsInDirectory`);
        });
    }
    /** @internal */
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshotPath = PluginUtils_1.default.getSnapshotFileForAnalysis(options);
            yield this.breakDownMemoryByShapes({ file: snapshotPath });
        });
    }
    /** @internal */
    breakDownMemoryByShapes(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const opt = { buildNodeIdIndex: true, verbose: true };
            const file = options.file ||
                core_1.utils.getSnapshotFilePathWithTabType(/.*/) ||
                '<EMPTY_FILE_PATH>';
            const snapshot = yield core_1.utils.getSnapshotFromFile(file, opt);
            core_1.analysis.preparePathFinder(snapshot);
            const heapInfo = core_1.analysis.getOverallHeapInfo(snapshot, { force: true });
            if (heapInfo) {
                core_1.analysis.printHeapInfo(heapInfo);
            }
            this.breakDownSnapshotByShapes(snapshot);
        });
    }
    /** @internal */
    breakDownSnapshotByShapes(snapshot) {
        core_1.info.overwrite('Breaking down memory by shapes...');
        const breakdown = Object.create(null);
        const population = Object.create(null);
        // group objects based on their shapes
        snapshot.nodes.forEach((node) => {
            if ((node.type !== 'object' && !core_1.utils.isStringNode(node)) ||
                core_1.config.nodeIgnoreSetInShape.has(node.name)) {
                return;
            }
            const key = core_1.serializer.summarizeNodeShape(node);
            breakdown[key] = breakdown[key] || new Set();
            breakdown[key].add(node.id);
            if (population[key] === void 0) {
                population[key] = { examples: [], n: 0 };
            }
            ++population[key].n;
            // retain the top 5 examples
            const examples = population[key].examples;
            examples.push(node);
            examples.sort((n1, n2) => n2.retainedSize - n1.retainedSize);
            if (examples.length > 5) {
                examples.pop();
            }
        });
        // calculate and sort based on retained sizes
        const ret = [];
        for (const key in breakdown) {
            const size = core_1.utils.aggregateDominatorMetrics(breakdown[key], snapshot, () => true, core_1.utils.getRetainedSize);
            ret.push({ key, retainedSize: size });
        }
        ret.sort((o1, o2) => o2.retainedSize - o1.retainedSize);
        core_1.info.topLevel('Object shapes with top retained sizes:');
        core_1.info.lowLevel(' (Use `memlab trace --node-id=@ID` to get trace)\n');
        const topList = ret.slice(0, 40);
        // print settings
        const opt = { color: true, compact: true };
        const dot = chalk_1.default.grey('· ');
        const colon = chalk_1.default.grey(': ');
        // print the shapes with the biggest retained size
        for (const o of topList) {
            const referrerInfo = this.breakDownByReferrers(breakdown[o.key], snapshot);
            const { examples, n } = population[o.key];
            const shapeStr = core_1.serializer.summarizeNodeShape(examples[0], opt);
            const bytes = core_1.utils.getReadableBytes(o.retainedSize);
            const examplesStr = examples
                .map(e => `@${e.id} [${core_1.utils.getReadableBytes(e.retainedSize)}]`)
                .join(' | ');
            const meta = chalk_1.default.grey(` (N: ${n}, Examples: ${examplesStr})`);
            core_1.info.topLevel(`${dot}${shapeStr}${colon}${bytes}${meta}`);
            core_1.info.lowLevel(referrerInfo + '\n');
        }
    }
    /** @internal */
    breakDownByReferrers(ids, snapshot) {
        const edgeNames = Object.create(null);
        for (const id of ids) {
            const node = snapshot.getNodeById(id);
            for (const edge of (node === null || node === void 0 ? void 0 : node.referrers) || []) {
                const source = edge.fromNode;
                if (!core_1.utils.isMeaningfulEdge(edge) ||
                    this.isTrivialEdgeForBreakDown(edge)) {
                    continue;
                }
                const sourceName = core_1.serializer.summarizeNodeName(source, {
                    color: false,
                });
                const edgeName = core_1.serializer.summarizeEdgeName(edge, {
                    color: false,
                    abstract: true,
                });
                const edgeKey = `[${sourceName}] --${edgeName}--> `;
                edgeNames[edgeKey] = edgeNames[edgeKey] || {
                    numberOfEdgesToNode: 0,
                    source,
                    edge,
                };
                ++edgeNames[edgeKey].numberOfEdgesToNode;
            }
        }
        const referrerInfo = Object.entries(edgeNames)
            .sort((i1, i2) => i2[1].numberOfEdgesToNode - i1[1].numberOfEdgesToNode)
            .slice(0, 4)
            .map(i => {
            const meta = i[1];
            const source = core_1.serializer.summarizeNodeName(meta.source, {
                color: true,
            });
            const edgeName = core_1.serializer.summarizeEdgeName(meta.edge, {
                color: true,
                abstract: true,
            });
            const edgeSummary = `${source} --${edgeName}-->`;
            return `  · ${edgeSummary}: ${meta.numberOfEdgesToNode}`;
        })
            .join('\n');
        return referrerInfo;
    }
    /** @internal */
    isTrivialEdgeForBreakDown(edge) {
        const source = edge.fromNode;
        return (source.type === 'array' ||
            source.name === '(object elements)' ||
            source.name === 'system' ||
            edge.name_or_index === '__proto__' ||
            edge.name_or_index === 'prototype');
    }
}
exports.default = ObjectShapeAnalysis;
