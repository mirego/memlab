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
const SIZE_TO_PRINT = 10;
const FIBER_NODE_PROPERTIES = new Set([
    'alternate',
    'child',
    'memoizedProps',
    'memoizedState',
    'return',
    'sibling',
    'type',
]);
function getProperty(node, prop) {
    var _a;
    return (_a = node.references.find(ref => ref.name_or_index === prop)) === null || _a === void 0 ? void 0 : _a.toNode;
}
class ReactComponentHookAnalysis extends BaseAnalysis_1.default {
    constructor() {
        super(...arguments);
        this.isHeapSnapshotMinified = false;
        this.fiberNodeName = null;
    }
    getCommandName() {
        return 'react-hooks';
    }
    /** @internal */
    getDescription() {
        return ('Show a memory breakdown of the most memory-consuming React components ' +
            'and their React hooks. This works best with unminified heap snapshots ' +
            'taken from React apps running in Dev mode. But also supports minified ' +
            'heap snapshots taken from React apps in production mode.');
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
            yield this.breakDownMemoryByReactComponents({ file: snapshotPath });
        });
    }
    /** @internal */
    breakDownMemoryByReactComponents(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const opt = { buildNodeIdIndex: true, verbose: true };
            const file = options.file ||
                core_1.utils.getSnapshotFilePathWithTabType(/.*/) ||
                '<EMPTY_FILE_PATH>';
            const snapshot = yield core_1.utils.getSnapshotFromFile(file, opt);
            core_1.analysis.preparePathFinder(snapshot);
            this.probeHeapAndFiberInfo(snapshot);
            const heapInfo = core_1.analysis.getOverallHeapInfo(snapshot, { force: true });
            if (heapInfo && !this.isHeapSnapshotMinified) {
                this.printHeapInfo(heapInfo);
                core_1.info.topLevel('\n');
            }
            const componentStatsMap = this.breakDownSnapshotByReactComponents(snapshot);
            this.printReactComponentStats(componentStatsMap);
        });
    }
    /** @internal */
    walkHookChain(memoizedStateNode, types, i) {
        var _a, _b;
        if (memoizedStateNode == null) {
            return [];
        }
        const nextNode = getProperty(memoizedStateNode, 'next');
        return [
            {
                type: (_a = types[i]) !== null && _a !== void 0 ? _a : 'unknown hook - React Dev mode only',
                size: memoizedStateNode.retainedSize - ((_b = nextNode === null || nextNode === void 0 ? void 0 : nextNode.retainedSize) !== null && _b !== void 0 ? _b : 0),
            },
            ...this.walkHookChain(nextNode, types, i + 1),
        ];
        return [];
    }
    /**
     * This methods get readable React component name corresponds to
     * a specific FiberNode object.
     * @internal
     **/
    getComponentNameFromFiberNode(node, fiberNodeObjectName) {
        var _a, _b, _c, _d;
        if (node.name !== fiberNodeObjectName) {
            return null;
        }
        const componentName = null;
        // get fiberNode.type
        const typeNode = getProperty(node, 'type');
        if (typeNode == null) {
            return null;
        }
        // if fiberNode.type itself is a string
        if (typeNode.isString) {
            return (_a = typeNode.toStringNode()) === null || _a === void 0 ? void 0 : _a.stringValue;
        }
        // try to get component name from fiberNode.type.__debugModuleSource
        const debugModuleName = getProperty(typeNode, '__debugModuleSource');
        if (debugModuleName === null || debugModuleName === void 0 ? void 0 : debugModuleName.isString) {
            return (_b = debugModuleName.toStringNode()) === null || _b === void 0 ? void 0 : _b.stringValue;
        }
        // try to get component name from fiberNode.type.displayName
        const displayNameNode = getProperty(typeNode, 'displayName');
        if (displayNameNode != null) {
            let componentName = (_c = displayNameNode.toStringNode()) === null || _c === void 0 ? void 0 : _c.stringValue;
            // if the heap snapshot is minified replace
            // "a [from parentComponent.react]" with
            // "<minified component> from [from parentComponent.react]"
            if (this.isHeapSnapshotMinified && (componentName === null || componentName === void 0 ? void 0 : componentName.includes('['))) {
                componentName = componentName === null || componentName === void 0 ? void 0 : componentName.replace(/^[^[]*/, '<minified component> ');
            }
            return componentName;
        }
        else if (componentName === 'Object') {
            const typeofNodeId = (_d = getProperty(typeNode, '$$typeof')) === null || _d === void 0 ? void 0 : _d.id;
            return `Component (@${typeofNodeId})`;
        }
        return null;
    }
    /**
     * Detects Fiber nodes in the heap snaphot and returns the string name
     * representation for the FiberNode objects.
     * For unminified heap snapshot, this method returns 'FiberNode'.
     * For minified heap snapshot, this method returns the FiberNode object's
     * minified name.
     * @internal
     **/
    probeHeapAndFiberInfo(snapshot) {
        let foundFiberNodeWithUnminifiedName = false;
        const likelyFiberNodes = new Map();
        snapshot.nodes.forEach((node) => {
            var _a;
            if (node.name === 'FiberNode' && node.isString === false) {
                foundFiberNodeWithUnminifiedName = true;
            }
            else if (this.hasFiberNodeAttributes(node)) {
                likelyFiberNodes.set(node.name, ((_a = likelyFiberNodes.get(node.name)) !== null && _a !== void 0 ? _a : 0) + 1);
            }
        });
        if (foundFiberNodeWithUnminifiedName) {
            this.fiberNodeName = 'FiberNode';
            return;
        }
        const entries = Array.from(likelyFiberNodes.entries()).sort((e1, e2) => e2[1] - e1[1]);
        if (entries.length === 0) {
            this.fiberNodeName = null;
            return;
        }
        this.isHeapSnapshotMinified = true;
        this.fiberNodeName = entries[0][0];
    }
    /** @internal */
    hasFiberNodeAttributes(node) {
        for (const prop of FIBER_NODE_PROPERTIES) {
            if (!node.findAnyReference(ref => ref.name_or_index === prop)) {
                return false;
            }
        }
        return true;
    }
    /** @internal */
    breakDownSnapshotByReactComponents(snapshot) {
        core_1.info.overwrite('Breaking down memory by React components...');
        const componentMemMap = new Map();
        const fiberNodeName = this.fiberNodeName;
        if (fiberNodeName == null) {
            throw core_1.utils.haltOrThrow('No FiberNode detected in the heap snapshot.');
        }
        snapshot.nodes.forEach((node) => {
            var _a;
            const componentName = this.getComponentNameFromFiberNode(node, fiberNodeName);
            if (componentName == null) {
                return;
            }
            const record = (_a = componentMemMap.get(componentName)) !== null && _a !== void 0 ? _a : {
                fiberNodeIds: [],
                totalRetainedSize: 0,
                totalShallowSize: 0,
                memoizedStateIds: [],
                totalMemoizedStateRetainedSize: 0,
                hooks: [],
                memoizedPropsIds: [],
                totalMemoizedPropsRetainedSize: 0,
                children: 0,
                sibling: 0,
            };
            componentMemMap.set(componentName, record);
            record.fiberNodeIds.push(node.id);
            record.totalShallowSize += node.self_size;
            const debugHookTypesNode = getProperty(node, '_debugHookTypes');
            const types = [];
            if (debugHookTypesNode) {
                for (let index = 0; index < 1000; ++index) {
                    const element = getProperty(debugHookTypesNode, index);
                    if (element == null) {
                        break;
                    }
                    types.push(element.name);
                }
            }
            const memoizedStateNode = getProperty(node, 'memoizedState');
            if (memoizedStateNode != null) {
                record.memoizedStateIds.push(memoizedStateNode.id);
                record.hooks = this.walkHookChain(memoizedStateNode, types, 0);
            }
            const memoizedPropsNode = getProperty(node, 'memoizedProps');
            if (memoizedPropsNode != null) {
                record.memoizedPropsIds.push(memoizedPropsNode.id);
            }
            const childrenNode = getProperty(node, 'child');
            if (childrenNode != null) {
                record.children += childrenNode.retainedSize;
            }
            const siblingNode = getProperty(node, 'sibling');
            if (siblingNode != null) {
                record.sibling += siblingNode.retainedSize;
            }
        });
        // aggregate and calculate the retained sizes
        for (const [, record] of componentMemMap) {
            record.totalRetainedSize = core_1.utils.aggregateDominatorMetrics(new Set(record.fiberNodeIds), snapshot, () => true, core_1.utils.getRetainedSize);
            record.totalMemoizedStateRetainedSize = core_1.utils.aggregateDominatorMetrics(new Set(record.memoizedStateIds), snapshot, () => true, core_1.utils.getRetainedSize);
            record.totalMemoizedPropsRetainedSize = core_1.utils.aggregateDominatorMetrics(new Set(record.memoizedPropsIds), snapshot, () => true, core_1.utils.getRetainedSize);
        }
        return componentMemMap;
    }
    /** @internal */
    printHeapInfo(heapInfo) {
        const key = chalk_1.default.white.bind(chalk_1.default);
        const sep = chalk_1.default.grey.bind(chalk_1.default);
        const size = (n) => chalk_1.default.yellow(core_1.utils.getReadableBytes(n));
        core_1.info.topLevel('\nHeap Overall Statistics:');
        core_1.info.topLevel(`  ${key('Fiber node total retained size')}${sep(':')} ${size(heapInfo.fiberNodeSize)}`);
        core_1.info.topLevel(`  ${key('Rendered Fiber node retained size')}${sep(':')} ${size(heapInfo.regularFiberNodeSize)}`);
        core_1.info.topLevel(`  ${key('Alternate Fiber node retained size')}${sep(':')} ${size(heapInfo.alternateFiberNodeSize)}`);
        core_1.info.topLevel(`  ${key('Detached Fiber node retained size')}${sep(':')} ${size(heapInfo.detachedFiberNodeSize)}`);
    }
    /** @internal */
    printReactComponentStats(componentStatsMap) {
        const key = chalk_1.default.white.bind(chalk_1.default);
        const sep = chalk_1.default.grey.bind(chalk_1.default);
        const num = chalk_1.default.blue.bind(chalk_1.default);
        const size = (n) => chalk_1.default.yellow(core_1.utils.getReadableBytes(n));
        const entries = Array.from(componentStatsMap.entries()).sort((entry1, entry2) => {
            return entry2[1].totalRetainedSize - entry1[1].totalRetainedSize;
        });
        core_1.info.topLevel(`Found ${entries.length} React component types. Top ${SIZE_TO_PRINT} results:\n`);
        let numPrinted = 0;
        for (const [name, stat] of entries) {
            if (numPrinted++ >= SIZE_TO_PRINT) {
                break;
            }
            let indent = ' ';
            core_1.info.topLevel(`${indent}${name}${sep(':')}`);
            indent += '  ';
            core_1.info.topLevel(`${indent}${key('Instances')}${sep(':')} ${num(stat.fiberNodeIds.length)}`);
            core_1.info.topLevel(`${indent}${key('Total retained size')}${sep(':')} ${size(stat.totalRetainedSize)}`);
            core_1.info.topLevel(`${indent}${key('Total shallow size')}${sep(':')} ${size(stat.totalShallowSize)}`);
            core_1.info.topLevel(`${indent}${key('Children retained size')}${sep(':')} ${size(stat.children)}`);
            core_1.info.topLevel(`${indent}${key('Sibling retained size')}${sep(':')} ${size(stat.sibling)}`);
            core_1.info.topLevel(`${indent}${key('Total memoizedProps retained size')}${sep(':')} ${size(stat.totalMemoizedPropsRetainedSize)}`);
            core_1.info.topLevel(`${indent}${key('Total memoizedState retained size')}${sep(':')} ${size(stat.totalMemoizedStateRetainedSize)}`);
            const totalHookSize = stat.hooks.reduce((acc, cur) => acc + cur.size, 0);
            core_1.info.topLevel(`${indent}${key('React hooks')}${sep(':')} (total size per component: ${size(totalHookSize)})`);
            const hookStats = stat.hooks;
            for (let i = 0; i < hookStats.length; ++i) {
                const hookStat = hookStats[i];
                core_1.info.topLevel(`${indent} [${num(i)}]${sep(':')} ${size(hookStat.size)} (${sep(hookStat.type)})`);
            }
            core_1.info.topLevel('');
        }
    }
}
exports.default = ReactComponentHookAnalysis;
