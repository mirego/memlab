/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
'use strict';
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
const fs_1 = __importDefault(require("fs"));
const Config_1 = __importDefault(require("./Config"));
const Console_1 = __importDefault(require("./Console"));
const Serializer_1 = __importDefault(require("./Serializer"));
const Utils_1 = __importDefault(require("./Utils"));
const FileManager_1 = __importDefault(require("./FileManager"));
const MemoryBarChart_1 = __importDefault(require("./charts/MemoryBarChart"));
const LeakClusterLogger_1 = __importDefault(require("../logger/LeakClusterLogger"));
const LeakTraceDetailsLogger_1 = __importDefault(require("../logger/LeakTraceDetailsLogger"));
const TraceFinder_1 = __importDefault(require("../paths/TraceFinder"));
const TraceBucket_1 = __importDefault(require("../trace-cluster/TraceBucket"));
const LeakObjectFilter_1 = require("./leak-filters/LeakObjectFilter");
const MLTraceSimilarityStrategy_1 = __importDefault(require("../trace-cluster/strategies/MLTraceSimilarityStrategy"));
const LeakTraceFilter_1 = require("./trace-filters/LeakTraceFilter");
const TraceSampler_1 = __importDefault(require("./TraceSampler"));
class MemoryAnalyst {
    checkLeak() {
        return __awaiter(this, void 0, void 0, function* () {
            MemoryBarChart_1.default.plotMemoryBarChart();
            Utils_1.default.checkSnapshots();
            return yield this.detectMemoryLeaks();
        });
    }
    diffLeakByWorkDir(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const controlSnapshotDirs = options.controlWorkDirs.map(controlWorkDir => FileManager_1.default.getCurDataDir({
                workDir: controlWorkDir,
            }));
            const treatmentSnapshotDirs = options.treatmentWorkDirs.map(treatmentWorkDir => FileManager_1.default.getCurDataDir({
                workDir: treatmentWorkDir,
            }));
            // check control working dir
            controlSnapshotDirs.forEach(controlSnapshotDir => Utils_1.default.checkSnapshots({ snapshotDir: controlSnapshotDir }));
            // check treatment working dir
            treatmentSnapshotDirs.forEach(treatmentSnapshotDir => Utils_1.default.checkSnapshots({ snapshotDir: treatmentSnapshotDir }));
            // display control and treatment memory
            MemoryBarChart_1.default.plotMemoryBarChart(options);
            return this.diffMemoryLeakTraces(options);
        });
    }
    // find all unique pattern of leaks
    diffMemoryLeakTraces(options) {
        return __awaiter(this, void 0, void 0, function* () {
            Config_1.default.dumpNodeInfo = false;
            // diff snapshots from control dirs and get control raw paths array
            const controlSnapshots = [];
            const leakPathsFromControlRuns = [];
            for (const controlWorkDir of options.controlWorkDirs) {
                const snapshotDiff = yield this.diffSnapshots({
                    loadAllSnapshots: true,
                    workDir: controlWorkDir,
                });
                leakPathsFromControlRuns.push(this.filterLeakPaths(snapshotDiff.leakedHeapNodeIdSet, snapshotDiff.snapshot, { workDir: controlWorkDir }));
                controlSnapshots.push(snapshotDiff.snapshot);
            }
            // diff snapshots from treatment dirs and get treatment raw paths array
            const treatmentSnapshots = [];
            const leakPathsFromTreatmentRuns = [];
            let firstTreatmentSnapshotDiff = null;
            for (const treatmentWorkDir of options.treatmentWorkDirs) {
                const snapshotDiff = yield this.diffSnapshots({
                    loadAllSnapshots: true,
                    workDir: treatmentWorkDir,
                });
                if (firstTreatmentSnapshotDiff == null) {
                    firstTreatmentSnapshotDiff = snapshotDiff;
                }
                leakPathsFromTreatmentRuns.push(this.filterLeakPaths(snapshotDiff.leakedHeapNodeIdSet, snapshotDiff.snapshot, { workDir: treatmentWorkDir }));
                treatmentSnapshots.push(snapshotDiff.snapshot);
            }
            const controlPathCounts = JSON.stringify(leakPathsFromControlRuns.map(leakPaths => leakPaths.length));
            const treatmentPathCounts = JSON.stringify(leakPathsFromTreatmentRuns.map(leakPaths => leakPaths.length));
            Console_1.default.topLevel(`${controlPathCounts} traces from control group`);
            Console_1.default.topLevel(`${treatmentPathCounts} traces from treatment group`);
            const result = TraceBucket_1.default.clusterControlTreatmentPaths(leakPathsFromControlRuns, controlSnapshots, leakPathsFromTreatmentRuns, treatmentSnapshots, Utils_1.default.aggregateDominatorMetrics, {
                strategy: Config_1.default.isMLClustering
                    ? new MLTraceSimilarityStrategy_1.default()
                    : void 0,
            });
            Console_1.default.midLevel(`MemLab found ${result.treatmentOnlyClusters.length} new leak(s) in the treatment group`);
            yield this.serializeClusterUpdate(result.treatmentOnlyClusters);
            // serialize JSON file with detailed leak trace information
            const treatmentOnlyPaths = result.treatmentOnlyClusters.map(c => c.path);
            if (firstTreatmentSnapshotDiff == null) {
                throw Utils_1.default.haltOrThrow('treatemnt snapshot diff result not found');
            }
            return LeakTraceDetailsLogger_1.default.logTraces(firstTreatmentSnapshotDiff.leakedHeapNodeIdSet, firstTreatmentSnapshotDiff.snapshot, firstTreatmentSnapshotDiff.listOfLeakedHeapNodeIdSet, treatmentOnlyPaths, Config_1.default.traceJsonOutDir);
        });
    }
    // find all unique pattern of leaks
    detectMemoryLeaks() {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshotDiff = yield this.diffSnapshots({ loadAllSnapshots: true });
            Config_1.default.dumpNodeInfo = false;
            const paths = yield this.findLeakTraces(snapshotDiff.leakedHeapNodeIdSet, snapshotDiff.snapshot);
            return LeakTraceDetailsLogger_1.default.logTraces(snapshotDiff.leakedHeapNodeIdSet, snapshotDiff.snapshot, snapshotDiff.listOfLeakedHeapNodeIdSet, paths, Config_1.default.traceJsonOutDir);
        });
    }
    focus(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            Console_1.default.overwrite(`Generating report for node @${Config_1.default.focusFiberNodeId}`);
            let snapshotLeakedHeapNodeIdSet = new Set();
            let nodeIdsInSnapshots = [];
            let snapshot;
            // if specified a heap file
            if (options.file) {
                const opt = { buildNodeIdIndex: true, verbose: true };
                snapshot = yield Utils_1.default.getSnapshotFromFile(options.file, opt);
                // if running in interactive heap analysis mode
            }
            else if (Config_1.default.heapConfig &&
                Config_1.default.heapConfig.isCliInteractiveMode &&
                Config_1.default.heapConfig.currentHeap) {
                snapshot = Config_1.default.heapConfig.currentHeap;
                // otherwise diff heap snapshots
            }
            else {
                Utils_1.default.checkSnapshots();
                const snapshotDiff = yield this.diffSnapshots({ loadAllSnapshots: true });
                nodeIdsInSnapshots = snapshotDiff.listOfLeakedHeapNodeIdSet;
                snapshotLeakedHeapNodeIdSet = snapshotDiff.leakedHeapNodeIdSet;
                snapshot = snapshotDiff.snapshot;
            }
            this.dumpPathByNodeId(snapshotLeakedHeapNodeIdSet, snapshot, nodeIdsInSnapshots, Config_1.default.focusFiberNodeId, Config_1.default.viewJsonFile, Config_1.default.singleReportSummary, { printConsoleOnly: true });
        });
    }
    shouldLoadCompleteSnapshot(tabsOrder, tab) {
        for (let i = tabsOrder.length - 1; i >= 0; --i) {
            const curTab = tabsOrder[i];
            if (curTab.type === 'target' || curTab.type === 'final') {
                return curTab === tab;
            }
        }
        return false;
    }
    diffSnapshots(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeIdsInSnapshots = [];
            const tabsOrder = Utils_1.default.loadTabsOrder(FileManager_1.default.getSnapshotSequenceMetaFile(options));
            // a set keeping track of node ids generated before the target snapshot
            const baselineIds = new Set();
            let collectBaselineIds = true;
            let targetAllocatedHeapNodeIdSet = null;
            let leakedHeapNodeIdSet = null;
            const parseSnapshotOptions = { verbose: true, workDir: options.workDir };
            let snapshot = null;
            for (let i = 0; i < tabsOrder.length; i++) {
                const tab = tabsOrder[i];
                // force GC before loading each snapshot
                if (global.gc) {
                    global.gc();
                }
                // when we see the target snapshot, stop collecting node ids allocated so far
                if (tab.type === 'target') {
                    collectBaselineIds = false;
                }
                let idsInSnapshot = new Set();
                nodeIdsInSnapshots.push(idsInSnapshot);
                if (!tab.snapshot) {
                    continue;
                }
                // in quick mode, there is no need to load all snapshots
                if (!options.loadAllSnapshots && !tab.type) {
                    continue;
                }
                const file = Utils_1.default.getSnapshotFilePath(tab, options);
                if (this.shouldLoadCompleteSnapshot(tabsOrder, tab)) {
                    // final snapshot needs to build node index
                    const opt = Object.assign(Object.assign({ buildNodeIdIndex: true }, parseSnapshotOptions), { workDir: options.workDir });
                    snapshot = yield Utils_1.default.getSnapshotFromFile(file, opt);
                    // record Ids in the snapshot
                    snapshot.nodes.forEach(node => {
                        idsInSnapshot.add(node.id);
                    });
                }
                else {
                    idsInSnapshot = yield Utils_1.default.getSnapshotNodeIdsFromFile(file, parseSnapshotOptions);
                    nodeIdsInSnapshots.pop();
                    nodeIdsInSnapshots.push(idsInSnapshot);
                }
                // collect all node ids allocated before the target snapshot
                if (collectBaselineIds) {
                    for (const id of idsInSnapshot) {
                        baselineIds.add(id);
                    }
                }
                if (tab.type === 'target') {
                    targetAllocatedHeapNodeIdSet = new Set();
                    idsInSnapshot.forEach(id => {
                        if (!baselineIds.has(id)) {
                            targetAllocatedHeapNodeIdSet === null || targetAllocatedHeapNodeIdSet === void 0 ? void 0 : targetAllocatedHeapNodeIdSet.add(id);
                        }
                    });
                    // if final snapshot is not present,
                    // search leaks among `Set { target } \ Set { baseline }`
                    leakedHeapNodeIdSet = targetAllocatedHeapNodeIdSet;
                }
                if (tab.type === 'final') {
                    if (!targetAllocatedHeapNodeIdSet) {
                        Utils_1.default.haltOrThrow('no target snapshot before finals snapshot');
                    }
                    leakedHeapNodeIdSet = new Set();
                    snapshot === null || snapshot === void 0 ? void 0 : snapshot.nodes.forEach(node => {
                        if (targetAllocatedHeapNodeIdSet === null || targetAllocatedHeapNodeIdSet === void 0 ? void 0 : targetAllocatedHeapNodeIdSet.has(node.id)) {
                            leakedHeapNodeIdSet === null || leakedHeapNodeIdSet === void 0 ? void 0 : leakedHeapNodeIdSet.add(node.id);
                        }
                    });
                    targetAllocatedHeapNodeIdSet = null;
                }
            }
            if (!snapshot || !leakedHeapNodeIdSet) {
                throw Utils_1.default.haltOrThrow('Snapshot incomplete', {
                    printErrorBeforeHalting: true,
                });
            }
            return {
                leakedHeapNodeIdSet: leakedHeapNodeIdSet,
                snapshot,
                listOfLeakedHeapNodeIdSet: nodeIdsInSnapshots,
            };
        });
    }
    // initialize the path finder
    preparePathFinder(snapshot) {
        const finder = new TraceFinder_1.default();
        if (!snapshot.isProcessed) {
            // shortest path for all nodes
            finder.annotateShortestPaths(snapshot);
            // dominator and retained size
            finder.calculateAllNodesRetainedSizes(snapshot);
            // mark detached Fiber nodes
            Utils_1.default.markAllDetachedFiberNode(snapshot);
            // mark alternate Fiber nodes
            Utils_1.default.markAlternateFiberNode(snapshot);
            snapshot.isProcessed = true;
        }
        return finder;
    }
    // summarize the page interaction and dump to the leak text summary file
    dumpPageInteractionSummary(options = {}) {
        const tabsOrder = Utils_1.default.loadTabsOrder(FileManager_1.default.getSnapshotSequenceMetaFile(options));
        const tabsOrderStr = Serializer_1.default.summarizeTabsOrder(tabsOrder);
        fs_1.default.writeFileSync(FileManager_1.default.getLeakSummaryFile(options), tabsOrderStr, 'UTF-8');
    }
    // summarize the leak and print the info in console
    dumpLeakSummaryToConsole(leakedNodeIds, snapshot) {
        if (!Config_1.default.verbose && !Config_1.default.useExternalSnapshot) {
            return;
        }
        Console_1.default.overwrite('summarizing snapshot diff...');
        const aggregatedLeakSummaryDict = Object.create(null);
        // count the distribution of nodes
        Utils_1.default.applyToNodes(leakedNodeIds, snapshot, node => {
            if (!Utils_1.default.isDebuggableNode(node)) {
                return false;
            }
            const key = `${node.name} (${node.type})`;
            const leakSummary = (aggregatedLeakSummaryDict[key] =
                aggregatedLeakSummaryDict[key] || {
                    name: node.name,
                    type: node.type,
                    count: 0,
                    retainedSize: 0,
                });
            leakSummary.count++;
            leakSummary.retainedSize += node.retainedSize | 0;
        });
        const list = Object.entries(aggregatedLeakSummaryDict)
            .sort((e1, e2) => e2[1].retainedSize - e1[1].retainedSize)
            .slice(0, 20)
            .map(entry => {
            const ret = Object.assign(entry[1]);
            ret.retainedSize = Utils_1.default.getReadableBytes(ret.retainedSize);
            return ret;
        });
        Console_1.default.topLevel('Alive objects allocated in target page:');
        Console_1.default.table(list);
    }
    filterLeakedObjects(leakedNodeIds, snapshot) {
        var _a;
        // call init leak filter hook if exists
        if ((_a = Config_1.default.externalLeakFilter) === null || _a === void 0 ? void 0 : _a.beforeLeakFilter) {
            Config_1.default.externalLeakFilter.beforeLeakFilter(snapshot, leakedNodeIds);
        }
        const leakFilter = new LeakObjectFilter_1.LeakObjectFilter();
        leakFilter.beforeFiltering(Config_1.default, snapshot, leakedNodeIds);
        // start filtering memory leaks
        Utils_1.default.filterNodesInPlace(leakedNodeIds, snapshot, node => leakFilter.filter(Config_1.default, node, snapshot, leakedNodeIds));
        if (Config_1.default.verbose) {
            Console_1.default.midLevel(`${leakedNodeIds.size} Fiber nodes and Detached elements`);
        }
    }
    getOverallHeapInfo(snapshot, options = {}) {
        if (!Config_1.default.verbose && !options.force) {
            return;
        }
        Console_1.default.overwrite('summarizing heap info...');
        const allIds = Utils_1.default.getNodesIdSet(snapshot);
        const heapInfo = {
            fiberNodeSize: Utils_1.default.aggregateDominatorMetrics(allIds, snapshot, Utils_1.default.isFiberNode, Utils_1.default.getRetainedSize),
            regularFiberNodeSize: Utils_1.default.aggregateDominatorMetrics(allIds, snapshot, Utils_1.default.isRegularFiberNode, Utils_1.default.getRetainedSize),
            detachedFiberNodeSize: Utils_1.default.aggregateDominatorMetrics(allIds, snapshot, Utils_1.default.isDetachedFiberNode, Utils_1.default.getRetainedSize),
            alternateFiberNodeSize: Utils_1.default.aggregateDominatorMetrics(allIds, snapshot, Utils_1.default.isAlternateNode, Utils_1.default.getRetainedSize),
            error: Utils_1.default.aggregateDominatorMetrics(allIds, snapshot, node => node.name === 'Error', Utils_1.default.getRetainedSize),
        };
        return heapInfo;
    }
    getOverallLeakInfo(leakedNodeIds, snapshot) {
        if (!Config_1.default.verbose) {
            return;
        }
        const leakInfo = Object.assign(Object.assign({}, this.getOverallHeapInfo(snapshot)), { leakedSize: Utils_1.default.aggregateDominatorMetrics(leakedNodeIds, snapshot, () => true, Utils_1.default.getRetainedSize), leakedFiberNodeSize: Utils_1.default.aggregateDominatorMetrics(leakedNodeIds, snapshot, Utils_1.default.isFiberNode, Utils_1.default.getRetainedSize), leakedAlternateFiberNodeSize: Utils_1.default.aggregateDominatorMetrics(leakedNodeIds, snapshot, Utils_1.default.isAlternateNode, Utils_1.default.getRetainedSize) });
        return leakInfo;
    }
    printHeapInfo(leakInfo) {
        Console_1.default.topLevel('Heap overall statistics:');
        Object.entries(leakInfo)
            .map(([k, v]) => [
            Utils_1.default.camelCaseToReadableString(k, { capitalizeFirstWord: true }),
            Utils_1.default.getReadableBytes(v),
        ])
            .forEach(([name, value]) => {
            Console_1.default.topLevel(`  ${name}: ${value}`);
        });
    }
    printHeapAndLeakInfo(leakedNodeIds, snapshot, options = {}) {
        // write page interaction summary to the leaks text file
        this.dumpPageInteractionSummary(options);
        // dump leak summry to console
        this.dumpLeakSummaryToConsole(leakedNodeIds, snapshot);
        // get aggregated leak info
        const heapInfo = this.getOverallHeapInfo(snapshot);
        if (heapInfo) {
            this.printHeapInfo(heapInfo);
        }
    }
    logLeakTraceSummary(trace, nodeIdInPaths, snapshot, options = {}) {
        if (!Config_1.default.isFullRun) {
            return;
        }
        // convert the path to a string
        const pathStr = Serializer_1.default.summarizePath(trace, nodeIdInPaths, snapshot);
        fs_1.default.appendFileSync(FileManager_1.default.getLeakSummaryFile(options), `\n\n${pathStr}\n\n`, 'UTF-8');
    }
    filterLeakPaths(leakedNodeIds, snapshot, options = {}) {
        const finder = this.preparePathFinder(snapshot);
        this.printHeapAndLeakInfo(leakedNodeIds, snapshot, options);
        // get all leaked objects
        this.filterLeakedObjects(leakedNodeIds, snapshot);
        const leakTraceFilter = new LeakTraceFilter_1.LeakTraceFilter();
        const nodeIdInPaths = new Set();
        const samplePool = [];
        // analysis for each node
        Utils_1.default.applyToNodes(leakedNodeIds, snapshot, node => {
            // BFS search for path from the leaked node to GC roots
            const p = finder.getPathToGCRoots(snapshot, node);
            if (p == null ||
                !leakTraceFilter.filter(p, { config: Config_1.default, leakedNodeIds, snapshot })) {
                return;
            }
            // filter leak trace based on CLI-specified node or edge names
            if (!Utils_1.default.pathHasNodeOrEdgeWithName(p, Config_1.default.filterTraceByName)) {
                return;
            }
            // ignore if the leak trace is too long
            if (Utils_1.default.getLeakTracePathLength(p) > 100) {
                return;
            }
            samplePool.push(p);
        }, { reverse: true });
        const sampler = new TraceSampler_1.default(samplePool.length);
        const paths = samplePool.filter(p => {
            if (sampler.sample()) {
                this.logLeakTraceSummary(p, nodeIdInPaths, snapshot, options);
                return true;
            }
            return false;
        });
        if (Config_1.default.verbose) {
            Console_1.default.midLevel(`Filter and select ${paths.length} leaked trace`);
        }
        return paths;
    }
    // find unique paths of leaked nodes
    findLeakTraces(leakedNodeIds, snapshot, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.filterLeakPaths(leakedNodeIds, snapshot, options);
            // cluster traces from the current run
            const clusters = TraceBucket_1.default.clusterPaths(paths, snapshot, Utils_1.default.aggregateDominatorMetrics, {
                strategy: Config_1.default.isMLClustering
                    ? new MLTraceSimilarityStrategy_1.default()
                    : void 0,
            });
            Console_1.default.midLevel(`MemLab found ${clusters.length} leak(s)`);
            yield this.serializeClusterUpdate(clusters);
            if (Config_1.default.logUnclassifiedClusters) {
                // cluster traces from the current run
                const clustersUnclassified = TraceBucket_1.default.generateUnClassifiedClusters(paths, snapshot, Utils_1.default.aggregateDominatorMetrics);
                LeakClusterLogger_1.default.logUnclassifiedClusters(clustersUnclassified);
            }
            return clusters.map(c => c.path);
        });
    }
    /**
     * Given a set of heap object ids, cluster them based on the similarity
     * of their retainer traces
     * @param leakedNodeIds
     * @param snapshot
     * @returns
     */
    clusterHeapObjects(objectIds, snapshot) {
        const finder = this.preparePathFinder(snapshot);
        const paths = [];
        const sampler = new TraceSampler_1.default(objectIds.size);
        // analysis for each node
        Utils_1.default.applyToNodes(objectIds, snapshot, node => {
            if (!sampler.sample()) {
                return;
            }
            // BFS search for path from the leaked node to GC roots
            const p = finder.getPathToGCRoots(snapshot, node);
            if (p) {
                paths.push(p);
            }
        }, { reverse: true });
        // cluster traces from the current run
        const clusters = TraceBucket_1.default.clusterPaths(paths, snapshot, Utils_1.default.aggregateDominatorMetrics, {
            strategy: Config_1.default.isMLClustering
                ? new MLTraceSimilarityStrategy_1.default()
                : void 0,
        });
        return clusters;
    }
    serializeClusterUpdate(clusters, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // load existing clusters
            const existingClusters = yield LeakClusterLogger_1.default.loadClusters(Config_1.default.currentUniqueClusterDir);
            Console_1.default.lowLevel(`Number of clusters loaded: ${existingClusters.length}`);
            // figure out stale and new clusters
            const clusterDiff = TraceBucket_1.default.diffClusters(clusters, existingClusters);
            if (options.reclusterOnly) {
                // only recluster updates
                LeakClusterLogger_1.default.logClusterDiff(clusterDiff);
            }
            else {
                // log clusters traces for the current run
                LeakClusterLogger_1.default.logClusters(clusters, { clusterDiff });
            }
        });
    }
    dumpPathByNodeId(leakedIdSet, snapshot, nodeIdsInSnapshots, id, pathLoaderFile, summaryFile, options = {}) {
        Console_1.default.overwrite('start analysis...');
        const finder = this.preparePathFinder(snapshot);
        const nodeIdInPaths = new Set();
        const idSet = new Set([id]);
        LeakTraceDetailsLogger_1.default.setTraceFileEmpty(pathLoaderFile);
        fs_1.default.writeFileSync(summaryFile, 'no path found', 'UTF-8');
        Utils_1.default.applyToNodes(idSet, snapshot, node => {
            const path = finder.getPathToGCRoots(snapshot, node);
            if (!path) {
                Console_1.default.topLevel(`path for node @${id} is not found`);
                return;
            }
            LeakTraceDetailsLogger_1.default.logTrace(leakedIdSet, snapshot, nodeIdsInSnapshots, path, pathLoaderFile);
            let pathSummary = Serializer_1.default.summarizePath(path, nodeIdInPaths, snapshot, { color: true });
            Console_1.default.topLevel(pathSummary);
            if (options.printConsoleOnly) {
                return;
            }
            const tabsOrder = Utils_1.default.loadTabsOrder(FileManager_1.default.getSnapshotSequenceMetaFile(options));
            const interactionSummary = Serializer_1.default.summarizeTabsOrder(tabsOrder);
            pathSummary = Serializer_1.default.summarizePath(path, nodeIdInPaths, snapshot);
            const summary = `Page Interaction: \n${interactionSummary}\n\n` +
                `Path from GC Root to Leaked Object:\n${pathSummary}`;
            fs_1.default.writeFileSync(summaryFile, summary, 'UTF-8');
        });
    }
}
exports.default = new MemoryAnalyst();
