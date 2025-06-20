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
/**
 * This analysis finds duplicated string instance in JavaScript heap
 * and rank them based on the duplicated string size and count.
 */
class StringAnalysis extends BaseAnalysis_1.default {
    constructor() {
        super(...arguments);
        this.topDupStrInCnt = [];
        this.topDupStrInCntListSize = 10;
        this.topDupStrInSize = [];
        this.topDupStrInSizeListSize = 10;
        this.stringPatternsStat = {};
    }
    /**
     * get the top duplicated string in terms of duplicated string count
     * @returns an array of the top-duplicated strings' information
     */
    getTopDuplicatedStringsInCount() {
        return this.topDupStrInCnt;
    }
    /**
     * get CLI command name for this memory analysis;
     * use it with `memlab analyze <ANALYSIS_NAME>` in CLI
     * @returns command name
     */
    getCommandName() {
        return 'string';
    }
    /**
     * get a textual description of the memory analysis
     * @returns textual description
     * @internal
     */
    getDescription() {
        return 'Find duplicated string instances in heap';
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
    static shouldIgnoreNode(node) {
        if (!core_1.utils.isStringNode(node) || core_1.utils.isSlicedStringNode(node)) {
            return true;
        }
        // ignore strings retained by code
        const dominators = core_1.utils.getAllDominators(node);
        const hasCodeDominator = dominators.reduce((prev, cur) => prev && cur.type !== 'code', true);
        return !hasCodeDominator;
    }
    /** @internal */
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield PluginUtils_1.default.loadHeapSnapshot(options);
            const stringMap = this.getPreprocessedStringMap(snapshot);
            this.calculateStringPatternsStatistics(stringMap);
            this.calculateTopDuplicatedStringsInCount(stringMap);
            this.calculateTopDuplicatedStringsInSize(stringMap);
            this.print();
        });
    }
    getPreprocessedStringMap(snapshot) {
        core_1.info.overwrite('building string map...');
        const stringMap = Object.create(null);
        // going through string nodes
        snapshot.nodes.forEach((node) => {
            if (StringAnalysis.shouldIgnoreNode(node)) {
                return;
            }
            const strValue = core_1.utils.getStringNodeValue(node);
            stringMap[strValue] = stringMap[strValue] || {
                n: 0,
                size: 0,
                ids: [],
            };
            const record = stringMap[strValue];
            ++record.n;
            record.size += node.retainedSize;
            record.ids.push(node.id);
        });
        return stringMap;
    }
    rankRecords(stringMap, compare, listSize) {
        let rank = [];
        for (const [str, record] of Object.entries(stringMap)) {
            if (record.n <= 1) {
                continue; // only care about duplicated strings
            }
            let i = 0;
            for (i = rank.length - 1; i >= 0; --i) {
                const item = rank[i];
                if (compare(item, record) >= 0) {
                    rank.splice(i + 1, 0, Object.assign({ str }, record));
                    break;
                }
            }
            if (i < 0) {
                rank.unshift(Object.assign({ str }, record));
            }
            rank = rank.slice(0, listSize);
        }
        return rank;
    }
    calculateTopDuplicatedStringsInCount(stringMap) {
        core_1.info.overwrite('calculating top duplicated strings in count...');
        this.topDupStrInCnt = this.rankRecords(stringMap, (item1, item2) => item1.n - item2.n, this.topDupStrInCntListSize);
    }
    calculateTopDuplicatedStringsInSize(stringMap) {
        core_1.info.overwrite('calculating top duplicated strings in size...');
        this.topDupStrInSize = this.rankRecords(stringMap, (item1, item2) => item1.size - item2.size, this.topDupStrInSizeListSize);
    }
    calculateStringPatternsStatistics(stringMap) {
        core_1.info.overwrite('calculating statistics for specified string patterns...');
        const strPatternStat = Object.create(null);
        for (const [str, record] of Object.entries(stringMap)) {
            patternLoop: for (const [patternName, patternCheck] of Object.entries(StringAnalysis.stringPatternsToObserve)) {
                if (!patternCheck(str)) {
                    continue patternLoop;
                }
                strPatternStat[patternName] = strPatternStat[patternName] || {
                    n: 0,
                    dupN: 0,
                    size: 0,
                    dupSize: 0,
                };
                const item = strPatternStat[patternName];
                item.n += record.n;
                item.size += record.size;
                if (record.n > 1) {
                    item.dupN += record.n - 1;
                    item.dupSize += (record.size * (record.n - 1)) / record.n;
                }
            }
        }
        this.stringPatternsStat = strPatternStat;
    }
    print() {
        const sep = chalk_1.default.grey(', ');
        const colon = chalk_1.default.grey(': ');
        const beg = chalk_1.default.grey('[');
        const end = chalk_1.default.grey(']');
        const dot = chalk_1.default.grey('·');
        const head = chalk_1.default.yellow.bind(chalk_1.default);
        // print statistics of specified string patterns
        for (const [str, item] of Object.entries(this.stringPatternsStat)) {
            core_1.info.topLevel(head(`\n${str}`));
            let p = core_1.utils.getReadablePercent(item.dupN / item.n);
            core_1.info.topLevel(`${dot}Count: ${item.n} (${p} are duplicated)`);
            const size = core_1.utils.getReadableBytes(item.size);
            p = core_1.utils.getReadablePercent(item.dupSize / item.size);
            core_1.info.topLevel(`${dot}Size: ${size} (${p} are duplicated)`);
        }
        core_1.info.topLevel(head('\nTop duplicated strings in count'));
        for (let i = 0; i < this.topDupStrInCnt.length; ++i) {
            const item = this.topDupStrInCnt[i];
            const size = core_1.utils.getReadableBytes(item.size);
            const str = `"${chalk_1.default.blue(item.str)}"`;
            core_1.info.topLevel(` ${dot}${beg}${item.n}${sep}${size}${end}${colon}${str}`);
        }
        core_1.info.topLevel(head('\nTop duplicated strings in size:'));
        for (let i = 0; i < this.topDupStrInSize.length; ++i) {
            const item = this.topDupStrInSize[i];
            const size = core_1.utils.getReadableBytes(item.size);
            const str = `"${chalk_1.default.blue(item.str)}"`;
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
exports.default = StringAnalysis;
/**
 * collect statistics for specified string patterns
 * pattern name -> string pattern checker
 */
StringAnalysis.stringPatternsToObserve = {
    // all strings (excluding sliced strings)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'All strings': (_) => true,
    'Relay DataID': (str) => {
        return str.startsWith('Uzpf');
    },
    'Relay DataID composite': (str) => {
        return /^\d+\{"/.test(str);
    },
    // example: "{"query_id":-7401558440803739294,"serialized":"z5_eJztfQ...
    'Relay query': (str) => {
        return str.startsWith('{"query_id":');
    },
    'Relay client string': (str) => {
        return str.startsWith('client:');
    },
    // example: n00je7tq arfg74bv qs9ysxi8 k77z8yql i09qtzwb n7fi1qx3
    'Element class name': (str) => {
        const arr = str.split(' ');
        if (arr.length < 6) {
            return false;
        }
        for (const s of arr) {
            if (s.length !== 8) {
                return false;
            }
        }
        return true;
    },
};
