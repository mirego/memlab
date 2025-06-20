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
class ObjectShallowAnalysis extends BaseAnalysis_1.default {
    constructor() {
        super(...arguments);
        this.topDupObjInCnt = [];
        this.topDupObjInCntListSize = 10;
        this.topDupObjInSize = [];
        this.topDupObjInSizeListSize = 10;
        this.objectPatternsStat = {};
    }
    /**
     * get CLI command name for this memory analysis;
     * use it with `memlab analyze <ANALYSIS_NAME>` in CLI
     * @returns command name
     */
    getCommandName() {
        return 'object-shallow';
    }
    /**
     * get a textual description of the memory analysis
     * @returns textual description
     * @internal
     */
    getDescription() {
        return 'Get objects by key and value, without recursing into sub-objects';
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
            const snapshot = yield PluginUtils_1.default.loadHeapSnapshot(options);
            const objectMap = this.getPreprocessedObjectMap(snapshot);
            this.calculateobjectPatternsStatistics(objectMap);
            this.calculateTopDuplicatedObjectsInCount(objectMap);
            this.calculateTopDuplicatedObjectsInSize(objectMap);
            this.print();
        });
    }
    /**
     * get the top duplicated object in terms of duplicated object count
     * @returns an array of the top-duplicated objects' information
     */
    getTopDuplicatedObjectInCount() {
        return this.topDupObjInCnt;
    }
    /** @ignore */
    getPreprocessedObjectMap(snapshot) {
        core_1.info.overwrite('building object map...');
        const objectMap = Object.create(null);
        snapshot.nodes.forEach((node) => {
            if (this.shouldIgnoreNode(node)) {
                return;
            }
            const obj = this.nodeToObject(node);
            const value = JSON.stringify(obj);
            objectMap[value] = objectMap[value] || {
                n: 0,
                size: 0,
                ids: [],
                obj: JSON.stringify(obj),
            };
            const record = objectMap[value];
            ++record.n;
            record.size += node.retainedSize;
            record.ids.push(node.id);
        });
        return objectMap;
    }
    nodeToObject(node) {
        const result = {};
        for (const edge of node.references) {
            if (edge.type === 'property' && edge.name_or_index != '__proto__') {
                const key = edge.name_or_index;
                const value = edge.toNode;
                if (core_1.utils.isStringNode(value)) {
                    result[key] = core_1.utils.getStringNodeValue(edge.toNode);
                }
                else if (value.type === 'number') {
                    result[key] = core_1.utils.getNumberNodeValue(edge.toNode);
                }
                else if (value.type === 'boolean') {
                    result[key] = core_1.utils.getBooleanNodeValue(edge.toNode);
                }
                else {
                    // shallow analysis, just put the id as a string
                    result[key] = 'REFERENCE_' + value.id;
                }
            }
        }
        return { class: node.name, object: result };
    }
    shouldIgnoreNode(node) {
        let hasAHiddenReferrer = false;
        node.forEachReferrer((edge) => {
            if (edge.type === 'hidden') {
                hasAHiddenReferrer = true;
                return { stop: true };
            }
        });
        return !(!hasAHiddenReferrer &&
            node.type === 'object' &&
            node.name !== 'Array' &&
            node.name !== 'ArrayBuffer' &&
            node.name !== 'Set' &&
            node.name !== 'Map' &&
            !node.name.startsWith('Window') &&
            !node.name.startsWith('system /'));
    }
    textEllipsis(str, maxLength, { side = 'end', ellipsis = '...' } = {}) {
        if (str.length > maxLength) {
            switch (side) {
                case 'start':
                    return ellipsis + str.slice(-(maxLength - ellipsis.length));
                case 'end':
                default:
                    return str.slice(0, maxLength - ellipsis.length) + ellipsis;
            }
        }
        return str;
    }
    rankRecords(objectMap, compare, listSize) {
        let rank = [];
        for (const [, record] of Object.entries(objectMap)) {
            if (record.n <= 1) {
                continue; // only care about duplicated objects
            }
            let i = 0;
            for (i = rank.length - 1; i >= 0; --i) {
                const item = rank[i];
                if (compare(item, record) >= 0) {
                    rank.splice(i + 1, 0, record);
                    break;
                }
            }
            if (i < 0) {
                rank.unshift(record);
            }
            rank = rank.slice(0, listSize);
        }
        return rank;
    }
    calculateTopDuplicatedObjectsInCount(objectMap) {
        core_1.info.overwrite('calculating top duplicated objects in count...');
        this.topDupObjInCnt = this.rankRecords(objectMap, (item1, item2) => item1.n - item2.n, this.topDupObjInCntListSize);
    }
    calculateTopDuplicatedObjectsInSize(objectMap) {
        core_1.info.overwrite('calculating top duplicated objects in size...');
        this.topDupObjInSize = this.rankRecords(objectMap, (item1, item2) => item1.size - item2.size, this.topDupObjInSizeListSize);
    }
    calculateobjectPatternsStatistics(objectMap) {
        core_1.info.overwrite('calculating statistics for specified object patterns...');
        const objectPatternStat = Object.create(null);
        for (const [str, record] of Object.entries(objectMap)) {
            patternLoop: for (const [patternName, patternCheck] of Object.entries(ObjectShallowAnalysis.objectPatternsToObserve)) {
                if (!patternCheck(str)) {
                    continue patternLoop;
                }
                objectPatternStat[patternName] = objectPatternStat[patternName] || {
                    n: 0,
                    dupN: 0,
                    size: 0,
                    dupSize: 0,
                };
                const item = objectPatternStat[patternName];
                item.n += record.n;
                item.size += record.size;
                if (record.n > 1) {
                    item.dupN += record.n - 1;
                    item.dupSize += (record.size * (record.n - 1)) / record.n;
                }
            }
        }
        this.objectPatternsStat = objectPatternStat;
    }
    print() {
        const sep = chalk_1.default.grey(', ');
        const colon = chalk_1.default.grey(': ');
        const beg = chalk_1.default.grey('[');
        const end = chalk_1.default.grey(']');
        const dot = chalk_1.default.grey('·');
        const head = chalk_1.default.yellow.bind(chalk_1.default);
        // print statistics of specified object patterns
        for (const [str, item] of Object.entries(this.objectPatternsStat)) {
            core_1.info.topLevel(head(`\n${str}`));
            let p = core_1.utils.getReadablePercent(item.dupN / item.n);
            core_1.info.topLevel(`${dot}Count: ${item.n} (${p} are duplicated)`);
            const size = core_1.utils.getReadableBytes(item.size);
            p = core_1.utils.getReadablePercent(item.dupSize / item.size);
            core_1.info.topLevel(`${dot}Size: ${size} (${p} are duplicated)`);
        }
        core_1.info.topLevel(head('\nTop duplicated objects in count'));
        let len = Math.min(15, this.topDupObjInCnt.length);
        for (let i = 0; i < len; ++i) {
            const item = this.topDupObjInCnt[i];
            const size = core_1.utils.getReadableBytes(item.size);
            const str = `"${chalk_1.default.blue(this.textEllipsis(item.obj, 100))}"`;
            core_1.info.topLevel(` ${dot}${beg}${item.n}${sep}${size}${end}${colon}${str}`);
        }
        len = Math.min(15, this.topDupObjInSize.length);
        core_1.info.topLevel(head('\nTop duplicated objects in size:'));
        for (let i = 0; i < len; ++i) {
            const item = this.topDupObjInSize[i];
            const size = core_1.utils.getReadableBytes(item.size);
            const str = `"${chalk_1.default.blue(this.textEllipsis(item.obj, 100))}"`;
            const exampleIds = item.ids.slice(0, 10).map((id) => `@${id}`);
            let examples = exampleIds.join(', ');
            if (exampleIds.length < item.ids.length) {
                examples += ' ...';
            }
            examples = chalk_1.default.grey(examples);
            core_1.info.topLevel(`\n ${dot}${beg}${size}${sep}${item.n}${end}${colon}${str}`);
            core_1.info.topLevel(`    node examples: ${examples}`);
        }
    }
}
ObjectShallowAnalysis.objectPatternsToObserve = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'All objects': (_) => true,
};
exports.default = ObjectShallowAnalysis;
