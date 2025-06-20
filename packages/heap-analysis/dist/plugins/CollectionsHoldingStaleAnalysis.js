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
const core_1 = require("@memlab/core");
const BaseAnalysis_1 = __importDefault(require("../BaseAnalysis"));
const PluginUtils_1 = __importDefault(require("../PluginUtils"));
const chalk_1 = __importDefault(require("chalk"));
const HeapAnalysisSnapshotFileOption_1 = __importDefault(require("../options/HeapAnalysisSnapshotFileOption"));
const HeapAnalysisOutputOption_1 = __importDefault(require("../options/HeapAnalysisOutputOption"));
const MAX_COLLECTION_STAT_ITEMS = 20;
function initCollectionStat(collection) {
    return {
        collection,
        staleChildren: [],
        childrenSize: 0,
        staleRetainedSize: 0,
    };
}
function processCollectionChildren(node) {
    const stat = initCollectionStat(node);
    const refs = node.references;
    for (const ref of refs) {
        ++stat.childrenSize;
        const elementNode = ref.toNode;
        if (!core_1.utils.isDetachedDOMNode(elementNode) &&
            !core_1.utils.isDetachedFiberNode(elementNode)) {
            continue;
        }
        // update stat for the collection
        stat.staleChildren.push(elementNode);
        stat.staleRetainedSize += elementNode.retainedSize;
    }
    return stat;
}
function processMapOrSet(node) {
    const tableEdge = core_1.utils.getEdgeByNameAndType(node, 'table');
    if (!tableEdge) {
        return initCollectionStat(node);
    }
    return processCollectionChildren(tableEdge.toNode);
}
class CollectionsHoldingStaleAnalysis extends BaseAnalysis_1.default {
    constructor() {
        super(...arguments);
        this.staleCollectionMapper = new Map([
            ['Map', processMapOrSet],
            ['Set', processMapOrSet],
            ['Array', processCollectionChildren],
        ]);
    }
    getCommandName() {
        return 'collections-with-stale';
    }
    /** @internal */
    getDescription() {
        return 'Analyze collections holding stale objects';
    }
    /** @internal */
    getOptions() {
        return [new HeapAnalysisSnapshotFileOption_1.default(), new HeapAnalysisOutputOption_1.default()];
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
            const snapshot = yield PluginUtils_1.default.loadHeapSnapshot(options);
            const collectionsStat = this.getCollectionsWithStaleValues(snapshot);
            if (core_1.config.outputFormat === core_1.OutputFormat.Json) {
                this.printJson(collectionsStat);
            }
            else {
                this.print(collectionsStat);
            }
        });
    }
    getCollectionsWithStaleValues(snapshot) {
        core_1.info.overwrite('analyzing collections...');
        const collections = [];
        // going through collection nodes
        snapshot.nodes.forEachTraceable((node) => {
            const statCollector = this.staleCollectionMapper.get(node.name);
            if (!statCollector) {
                return;
            }
            const stat = statCollector(node);
            if (stat.staleChildren.length > 0) {
                collections.push(stat);
            }
        });
        return collections;
    }
    print(collections) {
        const dot = chalk_1.default.grey('·');
        const head = chalk_1.default.yellow.bind(chalk_1.default);
        if (collections.length === 0) {
            core_1.info.success('Congratulations! No collections holding stale objects');
        }
        else {
            core_1.info.topLevel(head('\nCollections holding stale objects:'));
        }
        collections.sort((c1, c2) => c2.staleRetainedSize - c1.staleRetainedSize);
        collections = collections.slice(0, MAX_COLLECTION_STAT_ITEMS);
        for (const stat of collections) {
            const collection = stat.collection;
            const collectionSize = core_1.utils.getReadableBytes(collection.retainedSize);
            const staleChildrenSize = stat.staleChildren.length;
            const childrenSize = stat.childrenSize;
            const staleDesc = `${staleChildrenSize} out of ${childrenSize} elements are stale`;
            const name = chalk_1.default.blue(collection.name);
            const id = `(${chalk_1.default.grey('@' + collection.id)})`;
            const collectionDesc = `${name} ${id} ${collectionSize} (${staleDesc})`;
            let childrenIds = stat.staleChildren.map(node => `@${node.id}`);
            if (childrenIds.length > 10) {
                childrenIds = childrenIds.slice(0, 10);
                childrenIds.push('...');
            }
            const childrenDesc = chalk_1.default.grey(childrenIds.join(', '));
            core_1.info.topLevel(`\n${dot} ${collectionDesc}:`);
            core_1.info.topLevel(`  ${childrenDesc}`);
        }
    }
    printJson(collections) {
        collections.sort((c1, c2) => c2.staleRetainedSize - c1.staleRetainedSize);
        const output = collections
            .slice(0, MAX_COLLECTION_STAT_ITEMS)
            .map(stat => ({
            id: stat.collection.id,
            size: core_1.utils.getReadableBytes(stat.collection.retainedSize),
            childrenSize: stat.childrenSize,
            staleChildrenSize: stat.staleChildren.length,
            staleChildrenIds: stat.staleChildren.map(node => node.id),
        }));
        core_1.info.writeOutput(JSON.stringify(output));
        core_1.info.writeOutput('\n');
    }
}
exports.default = CollectionsHoldingStaleAnalysis;
