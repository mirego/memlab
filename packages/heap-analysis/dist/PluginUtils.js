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
const chalk_1 = __importDefault(require("chalk"));
const core_2 = require("@memlab/core");
const HeapConfig_1 = __importDefault(require("./HeapConfig"));
const nodeNameBlockList = new Set([
    '(Startup object cache)',
    '(Global handles)',
    '(External strings)',
    '(Builtins)',
]);
const nodeTypeBlockList = new Set([
    'array',
    'native',
    'code',
    'synthetic',
    'hidden',
]);
const defaultAnalysisArgs = { args: { _: [] } };
function isNodeWorthInspecting(node) {
    // exclude meta objects like GC roots etc.
    if (node.id <= 3) {
        return false;
    }
    if (nodeTypeBlockList.has(node.type)) {
        return false;
    }
    if (nodeNameBlockList.has(node.name)) {
        return false;
    }
    return true;
}
/**
 * filter out dominators that have a similar size, for example if
 * input is [A, B] and A is the dominator of B, then this function
 * throw away A if the size of A is close to the size of B
 * @param nodeList an array of heap nodes
 * @returns an array of heap nodes with dominators that have similar size removed
 */
function filterOutDominators(nodeList) {
    const candidateIdSet = new Set(nodeList.map(node => node.id));
    const childrenSizeInList = new Map();
    for (const node of nodeList) {
        const visitedIds = new Set();
        let curNode = node;
        inner: while (!visitedIds.has(curNode.id)) {
            curNode = node.dominatorNode;
            if (!curNode || curNode.id === node.id) {
                break inner;
            }
            // record the size of the children node in the candidate list
            // and associate the children size with its dominator in the candidate list
            if (candidateIdSet.has(curNode.id)) {
                let childrenSize = node.retainedSize;
                if (childrenSizeInList.has(curNode.id)) {
                    childrenSize += childrenSizeInList.get(curNode.id)[1];
                }
                childrenSizeInList.set(curNode.id, [
                    curNode.retainedSize,
                    childrenSize,
                ]);
                break inner;
            }
            visitedIds.add(curNode.id);
        }
    }
    // remove the dominator node from the candidate set
    // if the dominator node's size is similar to the child node
    for (const [dominatorId, [dominatorSize, childrenSize],] of childrenSizeInList) {
        if (dominatorSize - childrenSize < 500000) {
            candidateIdSet.delete(dominatorId);
        }
    }
    return nodeList.filter(node => candidateIdSet.has(node.id));
}
// Note: be cautious when using printRef = true, it may cause infinite loop
function getNodeRecord(node, printRef = false) {
    const refs = node.references.slice(0, MAX_NUM_OF_EDGES_TO_PRINT);
    return {
        id: node.id,
        name: node.name,
        type: node.type,
        selfsize: node.self_size,
        retainedSize: node.retainedSize,
        traceNodeId: node.trace_node_id,
        nodeIndex: node.nodeIndex,
        references: printRef
            ? refs.map(edge => getEdgeRecord(edge))
            : refs.map(edge => ({
                name: edge.name_or_index.toString(),
                toNode: edge.toNode.id,
            })),
        referrers: node.referrers.slice(0, MAX_NUM_OF_EDGES_TO_PRINT).map(edge => ({
            name: edge.name_or_index.toString(),
            fromNode: edge.fromNode.id,
        })),
    };
}
function getEdgeRecord(edge) {
    return {
        nameOrIndex: edge.name_or_index,
        type: edge.type,
        edgeIndex: edge.edgeIndex,
        toNode: getNodeRecord(edge.toNode),
        fromNode: getNodeRecord(edge.fromNode),
    };
}
// Note: be cautious when setting printReferences to true,
// it may cause infinite loop
function printNodeListInTerminal(nodeList, options = {}) {
    const dot = chalk_1.default.grey('· ');
    const indent = options.indent || '';
    const printRef = !!options.printReferences;
    if (!options.printAll) {
        nodeList = filterOutDominators(nodeList);
    }
    if (core_1.config.outputFormat === core_1.OutputFormat.Json) {
        const jsonNodes = nodeList.map(node => getNodeRecord(node, printRef));
        core_2.info.writeOutput(JSON.stringify(jsonNodes));
        core_2.info.writeOutput('\n');
        return;
    }
    for (const node of nodeList) {
        const nodeInfo = getHeapObjectString(node);
        core_2.info.topLevel(`${indent}${dot}${nodeInfo}`);
        if (printRef) {
            printReferencesInTerminal(node.references, { indent: indent + '  ' });
        }
    }
}
function printNodeInTerminal(node) {
    const nodeRecord = getNodeRecord(node);
    core_2.info.writeOutput(JSON.stringify(nodeRecord));
    core_2.info.writeOutput('\n');
}
function isNumeric(v) {
    if (typeof v === 'number') {
        return true;
    }
    if (parseInt(v, 10) + '' === v + '') {
        return true;
    }
    if (parseFloat(v) + '' === v + '') {
        return true;
    }
    return false;
}
function getObjectReferenceNames(node) {
    const referrers = node.referrers;
    const names = new Set();
    const visited = new Set();
    for (const edge of referrers) {
        const name = edge.name_or_index;
        // in case infinite loop
        if (visited.has(edge.edgeIndex)) {
            continue;
        }
        visited.add(edge.edgeIndex);
        // numeric index is not informative
        if (isNumeric(name) || name === '') {
            continue;
        }
        // context and previous references are not informative
        if ((name === 'previous' || name === 'context') &&
            edge.type === 'internal') {
            for (const ref of edge.fromNode.referrers) {
                referrers.push(ref);
            }
            continue;
        }
        names.add(name);
    }
    const refs = Array.from(names).slice(0, 10).join(chalk_1.default.grey(', '));
    return 'refs: ' + chalk_1.default.grey('[') + refs + chalk_1.default.grey(']');
}
function getHeapObjectString(node) {
    const colon = chalk_1.default.grey(':');
    const comma = chalk_1.default.grey(',');
    const serializeOpt = { color: true, compact: true };
    const shapeStr = core_2.serializer.summarizeNodeShape(node, serializeOpt);
    const edgeCount = getObjectOutgoingEdgeCount(node);
    const fanout = `${edgeCount} edges`;
    const bytes = core_2.utils.getReadableBytes(node.retainedSize);
    const nodeId = chalk_1.default.grey(`@${node.id}`);
    const type = node.type === 'object' ? '' : ` ${node.type}`;
    const refs = getObjectReferenceNames(node);
    return (`${nodeId}${type} ${shapeStr}${colon} ` +
        `${fanout}${comma} ${bytes}${comma} ${refs}`);
}
const MAX_NUM_OF_EDGES_TO_PRINT = 50;
function getReferenceString(edge) {
    const edgeName = chalk_1.default.green(edge.name_or_index);
    const objectInfo = getHeapObjectString(edge.toNode);
    return ` --${edgeName}--> ${objectInfo}`;
}
function printReferencesInTerminal(edgeList, options = {}) {
    if (core_1.config.outputFormat === core_1.OutputFormat.Json) {
        printEdgesJson(edgeList);
        return;
    }
    const dot = chalk_1.default.grey('· ');
    const indent = options.indent || '';
    let n = 0;
    for (const edge of edgeList) {
        if (!core_1.config.verbose && n >= MAX_NUM_OF_EDGES_TO_PRINT) {
            break;
        }
        ++n;
        const refStr = getReferenceString(edge);
        core_2.info.topLevel(`${indent}${dot}${refStr}`);
    }
    if (n < edgeList.length) {
        core_2.info.lowLevel(`${edgeList.length - n} more references...`);
    }
}
function getReferrerString(edge) {
    const edgeName = chalk_1.default.green(edge.name_or_index);
    const objectInfo = getHeapObjectString(edge.fromNode);
    return ` ${objectInfo} --${edgeName}--> `;
}
function printReferrersInTerminal(edgeList, options = {}) {
    if (core_1.config.outputFormat === core_1.OutputFormat.Json) {
        printEdgesJson(edgeList);
        return;
    }
    const dot = chalk_1.default.grey('· ');
    const indent = options.indent || '';
    let n = 0;
    for (const edge of edgeList) {
        if (!core_1.config.verbose && n >= MAX_NUM_OF_EDGES_TO_PRINT) {
            break;
        }
        ++n;
        const refStr = getReferrerString(edge);
        core_2.info.topLevel(`${indent}${dot}${refStr}`);
    }
    if (n < edgeList.length) {
        core_2.info.lowLevel(`${edgeList.length - n} more referrers...`);
    }
}
function printEdgesJson(edgeList) {
    const jsonEdges = edgeList.map(edge => getEdgeRecord(edge));
    core_2.info.writeOutput(JSON.stringify(jsonEdges));
    core_2.info.writeOutput('\n');
}
function getObjectOutgoingEdgeCount(node) {
    if (node.name === 'Set' || node.name === 'Map') {
        const edge = core_2.utils.getEdgeByNameAndType(node, 'table');
        if (!edge) {
            return node.edge_count;
        }
        return edge.toNode.edge_count;
    }
    return node.edge_count;
}
/**
 * Get the heap snapshot file's absolute path passed to the hosting heap
 * analysis via `HeapAnalysisOptions`.
 *
 * This API is supposed to be used within the overridden `process` method
 * of an `BaseAnalysis` instance.
 *
 * @param options this is the auto-generated input passed to all the `BaseAnalysis` instances
 * @returns the absolute path of the heap snapshot file
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {getSnapshotFileForAnalysis, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     const file = getSnapshotFileForAnalysis(options);
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // any .heapsnapshot file recorded by memlab or saved manually from Chrome
 * await analysis.analyzeSnapshotFromFile(snapshotFile);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `getSnapshotFileForAnalysis` will use the last heap snapshot in alphanumerically
 * ascending order from {@link BrowserInteractionResultReader}.
 */
function getSnapshotFileForAnalysis(options) {
    const args = options.args;
    if (args.snapshot) {
        return args.snapshot;
    }
    return core_2.utils.getSingleSnapshotFileForAnalysis();
}
/**
 * Get the absolute path of the directory holding all the heap snapshot files
 * passed to the hosting heap analysis via `HeapAnalysisOptions`.
 *
 * This API is supposed to be used within the overridden `process` method
 * of an `BaseAnalysis` instance.
 *
 * @param options this is the auto-generated input passed
 * to all the `BaseAnalysis` instances
 * @returns the absolute path of the directory
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {getSnapshotFileForAnalysis, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     const directory = getSnapshotDirForAnalysis(options);
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // any .heapsnapshot file recorded by memlab or saved manually from Chrome
 * await analysis.analyzeSnapshotFromFile(snapshotFile);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `getSnapshotDirForAnalysis` use the snapshot directory from
 * {@link BrowserInteractionResultReader}.
 */
function getSnapshotDirForAnalysis(options) {
    const args = options.args;
    if (args['snapshot-dir']) {
        return args['snapshot-dir'];
    }
    if (core_1.config.externalSnapshotDir) {
        return core_1.config.externalSnapshotDir;
    }
    return null;
}
/**
 * Load the heap graph based on the single JavaScript heap snapshot
 * passed to the hosting heap analysis via `HeapAnalysisOptions`.
 *
 * This API is supposed to be used within the `process` implementation
 * of an `BaseAnalysis` instance.
 *
 * @param options this is the auto-generated input passed to all the `BaseAnalysis` instances
 * @returns the graph representation of the heap
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {loadHeapSnapshot, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     const heap = await loadHeapSnapshot(options);
 *     // doing heap analysis
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // any .heapsnapshot file recorded by memlab or saved manually from Chrome
 * await analysis.analyzeSnapshotFromFile(snapshotFile);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `loadHeapSnapshot` will use the last heap snapshot in alphanumerically
 * ascending order from {@link BrowserInteractionResultReader}.
 */
function loadHeapSnapshot(options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (HeapConfig_1.default.isCliInteractiveMode) {
            if (!HeapConfig_1.default.currentHeap) {
                const file = getSnapshotFileForAnalysis(options);
                const heap = yield loadProcessedSnapshot({ file });
                HeapConfig_1.default.currentHeapFile = file;
                HeapConfig_1.default.currentHeap = heap;
            }
            return HeapConfig_1.default.currentHeap;
        }
        else {
            const file = getSnapshotFileForAnalysis(options);
            return loadProcessedSnapshot({ file });
        }
    });
}
/**
 * Load and parse a `.heapsnapshot` file and calculate meta data like
 * dominator nodes and retained sizes.
 * @param file the absolute path of the `.heapsnapshot` file
 * @returns the heap graph representation instance that supports querying
 * the heap
 * * **Examples**:
 * ```typescript
 * import {dumpNodeHeapSnapshot} from '@memlab/core';
 * import {getFullHeapFromFile} from '@memlab/heap-analysis';
 *
 * (async function (){
 *   const heapFile = dumpNodeHeapSnapshot();
 *   const heap = await getFullHeapFromFile(heapFile);
 * })();
 * ```
 */
function getFullHeapFromFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield loadProcessedSnapshot({ file });
    });
}
/**
 * Take a heap snapshot of the current program state
 * and parse it as {@link IHeapSnapshot}. This
 * API also calculates some heap analysis meta data
 * for heap analysis. But this also means slower heap parsing
 * comparing with {@link takeNodeMinimalHeap}.
 *
 * @returns heap representation with heap analysis meta data.
 *
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {takeNodeFullHeap} from '@memlab/heap-analysis';
 *
 * (async function () {
 *   const heap: IHeapSnapshot = await takeNodeFullHeap();
 * })();
 * ```
 */
function takeNodeFullHeap() {
    return __awaiter(this, void 0, void 0, function* () {
        const heap = yield (0, core_1.takeNodeMinimalHeap)();
        core_2.analysis.preparePathFinder(heap);
        core_2.info.flush();
        return heap;
    });
}
/** @deprecated */
function getHeapFromFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield loadProcessedSnapshot({ file });
    });
}
function loadProcessedSnapshot(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const opt = { buildNodeIdIndex: true, verbose: true };
        const file = options.file || core_2.utils.getSnapshotFilePathWithTabType(/.*/);
        const snapshot = yield core_2.utils.getSnapshotFromFile(file, opt);
        core_2.analysis.preparePathFinder(snapshot);
        core_2.info.flush();
        return snapshot;
    });
}
/**
 * When a heap analysis is taking multiple heap snapshots as input for memory
 * analysis (e.g., finding which object keeps growing in size in a series of
 * heap snapshots), this API could be used to do
 * [MapRedue](https://en.wikipedia.org/wiki/MapReduce) on all heap snapshots.
 *
 * This API is supposed to be used within the `process` implementation
 * of an `BaseAnalysis` instance that is designed to analyze multiple heap
 * snapshots (as an example, finding which object keeps growing overtime)
 *
 * @param mapCallback the map function in MapReduce, the function will be applied
 * to each heap snapshot
 * @param reduceCallback the reduce function in MapReduce, the function will take
 * as input all intermediate results from all map function calls
 * @typeParam T1 - the type of the intermediate result from each map function call
 * @typeParam T2 - the type of the final result of the reduce function call
 * @param options this is the auto-generated input passed to all the `BaseAnalysis` instances
 * @returns the return value of your reduce function
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import type {HeapAnalysisOptions} from '@memlab/heap-analysis';
 * import {snapshotMapReduce, BaseAnalysis} from '@memlab/heap-analysis';
 *
 * class ExampleAnalysis extends BaseAnalysis {
 *   public getCommandName(): string {
 *     return 'example-analysis';
 *   }
 *
 *   public getDescription(): string {
 *     return 'an example analysis for demo';
 *   }
 *
 *   async process(options: HeapAnalysisOptions): Promise<void> {
 *     // check if the number of heap objects keeps growing overtime
 *     const isMonotonicIncreasing = await snapshotMapReduce(
 *       (heap) => heap.nodes.length,
 *       (nodeCounts) =>
 *         nodeCounts[0] < nodeCounts[nodeCounts.length - 1] &&
 *         nodeCounts.every((count, i) => i === 0 || count >= nodeCounts[i - 1]),
 *       options,
 *     );
 *   }
 * }
 * ```
 *
 * Use the following code to invoke the heap analysis:
 * ```typescript
 * const analysis = new ExampleAnalysis();
 * // snapshotDir includes a series of .heapsnapshot files recorded by
 * // memlab or saved manually from Chrome, those files will be loaded
 * // in alphanumerically ascending order
 * await analysis.analyzeSnapshotsInDirectory(snapshotDir);
 * ```
 * The new heap analysis can also be used with {@link analyze}, in that case
 * `snapshotMapReduce` will use all the heap snapshot in alphanumerically
 * ascending order from {@link BrowserInteractionResultReader}.
 *
 * **Why not passing in all heap snapshots as an array of {@link IHeapSnapshot}s?**
 * Each heap snapshot could be non-trivial in size, loading them all at once
 * may not be possible.
 */
function snapshotMapReduce(mapCallback, reduceCallback, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshotDir = getSnapshotDirForAnalysis(options);
        core_2.utils.checkSnapshots({ snapshotDir });
        const snapshotFiles = snapshotDir
            ? // load snapshots from a directory
                core_2.utils.getSnapshotFilesInDir(snapshotDir)
            : // load snapshots based on the visit sequence meta data
                core_2.utils.getSnapshotFilesFromTabsOrder();
        const intermediateResults = [];
        for (let i = 0; i < snapshotFiles.length; ++i) {
            const file = snapshotFiles[i];
            // force GC before loading each snapshot
            if (global.gc) {
                global.gc();
            }
            const snapshot = yield loadProcessedSnapshot({ file });
            intermediateResults.push(mapCallback(snapshot, i, file));
        }
        return reduceCallback(intermediateResults);
    });
}
/**
 * This API aggregates metrics from the
 * [dominator nodes](https://firefox-source-docs.mozilla.org/devtools-user/memory/dominators/index.html)
 * of the set of input heap objects.
 *
 * @param ids Set of ids of heap objects (or nodes)
 * @param snapshot heap graph loaded from a heap snapshot
 * @param checkNodeCb filter callback to exclude some heap object/nodes
 * before calculating the dominator nodes
 * @param nodeMetricsCb callback to calculate metrics from each dominator node
 * @returns the aggregated metrics
 */
function aggregateDominatorMetrics(ids, snapshot, checkNodeCb, nodeMetricsCb) {
    let ret = 0;
    const dominators = core_2.utils.getConditionalDominatorIds(ids, snapshot, checkNodeCb);
    core_2.utils.applyToNodes(dominators, snapshot, node => {
        ret += nodeMetricsCb(node);
    });
    return ret;
}
/**
 * This API calculate the set of
 * [dominator nodes](https://firefox-source-docs.mozilla.org/devtools-user/memory/dominators/index.html)
 * of the set of input heap objects.
 * @param ids Set of ids of heap objects (or nodes)
 * @param snapshot heap loaded from a heap snapshot
 * @returns the set of dominator nodes/objects
 * * * **Examples**:
 * ```typescript
 * import {dumpNodeHeapSnapshot} from '@memlab/core';
 * import {getFullHeapFromFile, getDominatorNodes} from '@memlab/heap-analysis';
 *
 * class TestObject {}
 *
 * (async function () {
 *   const t1 = new TestObject();
 *   const t2 = new TestObject();
 *
 *   // dump the heap of this running JavaScript program
 *   const heapFile = dumpNodeHeapSnapshot();
 *   const heap = await getFullHeapFromFile(heapFile);
 *
 *   // find the heap node for TestObject
 *   let nodes = [];
 *   heap.nodes.forEach(node => {
 *     if (node.name === 'TestObject' && node.type === 'object') {
 *       nodes.push(node);
 *     }
 *   });
 *
 *   // get the dominator nodes
 *   const dominatorIds = getDominatorNodes(
 *     new Set(nodes.map(node => node.id)),
 *     heap,
 *   );
 * })();
 * ```
 */
function getDominatorNodes(ids, snapshot) {
    return core_2.utils.getConditionalDominatorIds(ids, snapshot, () => true);
}
function filterOutLargestObjects(snapshot, objectFilter, listSize = 50) {
    let largeObjects = [];
    snapshot.nodes.forEach(node => {
        if (!objectFilter(node)) {
            return;
        }
        const size = node.retainedSize;
        let i;
        for (i = largeObjects.length - 1; i >= 0; --i) {
            if (largeObjects[i].retainedSize >= size) {
                largeObjects.splice(i + 1, 0, node);
                break;
            }
        }
        if (i < 0) {
            largeObjects.unshift(node);
        }
        largeObjects = largeObjects.slice(0, listSize);
    });
    return largeObjects;
}
function calculateRetainedSizes(snapshot) {
    const finder = new core_2.TraceFinder();
    // dominator and retained size
    finder.calculateAllNodesRetainedSizes(snapshot);
}
function isCollectObject(node) {
    if (node.type !== 'object') {
        return false;
    }
    return (node.name === 'Map' ||
        node.name === 'Set' ||
        node.name === 'WeakMap' ||
        node.name === 'WeakSet');
}
function getCollectionFanout(node) {
    if (node.type !== 'object') {
        return 0;
    }
    if (node.name === 'Array') {
        return node.edge_count;
    }
    else if (node.name === 'Map' ||
        node.name === 'Set' ||
        node.name === 'WeakMap' ||
        node.name === 'WeakSet') {
        const table = node.getReferenceNode('table');
        if (table) {
            return table.edge_count;
        }
    }
    return 0;
}
exports.default = {
    aggregateDominatorMetrics,
    calculateRetainedSizes,
    defaultAnalysisArgs,
    filterOutLargestObjects,
    getCollectionFanout,
    getDominatorNodes,
    getObjectOutgoingEdgeCount,
    getSnapshotDirForAnalysis,
    getSnapshotFileForAnalysis,
    isCollectObject,
    isNodeWorthInspecting,
    loadHeapSnapshot,
    getHeapFromFile,
    getFullHeapFromFile,
    printNodeListInTerminal,
    printReferencesInTerminal,
    printReferrersInTerminal,
    printNodeInTerminal,
    snapshotMapReduce,
    takeNodeFullHeap,
};
