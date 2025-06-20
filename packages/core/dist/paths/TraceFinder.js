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
const Config_1 = __importDefault(require("../lib/Config"));
const Console_1 = __importDefault(require("../lib/Console"));
const Utils_1 = __importDefault(require("../lib/Utils"));
const ROOT_NODE_INDEX = 0;
const PAGE_OBJECT_FLAG = 1;
class TraceFinder {
    getRootNodeList(snapshot, opt = {}) {
        const highPri = [];
        const lowPri = [];
        if (opt.prioritize) {
            snapshot.nodes.forEach(node => {
                if (Utils_1.default.isRootNode(node, {
                    excludeBlinkRoot: true,
                    excludePendingActivity: true,
                })) {
                    highPri.push(node);
                }
                else if (Utils_1.default.isRootNode(node)) {
                    lowPri.push(node);
                }
            });
        }
        else {
            snapshot.nodes.forEach(node => {
                if (Utils_1.default.isRootNode(node)) {
                    highPri.push(node);
                }
            });
        }
        return [highPri, lowPri];
    }
    visitReachableNodesbyDFS(snapshot, nodeVisitor, edgeVisitor) {
        const [queue] = this.getRootNodeList(snapshot);
        const queuedIDs = new Set(queue.map(n => n.id));
        const visitedIDs = new Set();
        const traverseOption = {
            visited: visitedIDs,
            queued: queuedIDs,
            excludeWeakMapEdge: false,
            isForward: true,
        };
        while (queue.length > 0) {
            const node = queue.pop();
            if (!node || visitedIDs.has(node.id)) {
                continue;
            }
            if (nodeVisitor && nodeVisitor(node) === false) {
                continue;
            }
            visitedIDs.add(node.id);
            for (const edge of node.references) {
                if (!this.shouldTraverseEdge(edge, snapshot, traverseOption)) {
                    continue;
                }
                const nextNode = edge.toNode;
                // deal with weak map specifically
                if (Utils_1.default.isWeakMapEdgeToKey(edge)) {
                    const weakMapKeyObjectId = Utils_1.default.getWeakMapEdgeKeyId(edge);
                    // in weak map keys are weakly referenced
                    if (weakMapKeyObjectId === nextNode.id) {
                        continue;
                    }
                }
                if (edgeVisitor && edgeVisitor(edge) === false) {
                    continue;
                }
                queue.push(nextNode);
                queuedIDs.add(nextNode.id);
            }
        }
    }
    flagReachableNodesFromWindow(snapshot, flags, flag) {
        const nodesCount = snapshot.nodes.length;
        const nodesToVisit = new Uint32Array(nodesCount);
        let nodesToVisitLength = 0;
        const node = snapshot.nodes.get(ROOT_NODE_INDEX);
        for (const edge of node.references) {
            const toNode = edge.toNode;
            const type = edge.type;
            if (type === 'element') {
                if (Utils_1.default.isDocumentDOMTreesRoot(toNode)) {
                    continue;
                }
            }
            else if (type === 'shortcut') {
                continue;
            }
            const childNodeIndex = toNode.nodeIndex;
            nodesToVisit[nodesToVisitLength++] = childNodeIndex;
            flags[childNodeIndex] |= flag;
        }
        // flag all heap objects reachable from the root
        while (nodesToVisitLength > 0) {
            const nodeIndex = nodesToVisit[--nodesToVisitLength];
            const node = snapshot.nodes.get(nodeIndex);
            for (const edge of node.references) {
                const childNode = edge.toNode;
                const childNodeIndex = childNode.nodeIndex;
                if (flags[childNodeIndex] & flag) {
                    continue;
                }
                if (edge.type === 'weak') {
                    continue;
                }
                nodesToVisit[nodesToVisitLength++] = childNodeIndex;
                flags[childNodeIndex] |= flag;
            }
        }
    }
    // build post order based on:
    //  Keith D. Cooper and Timothy J. Harvey and Ken Kennedy
    //  "A Simple, Fast Dominance Algorithm"
    buildPostOrderIndex(snapshot, flags) {
        const nodeCount = snapshot.nodes.length;
        const rootNodeIndex = ROOT_NODE_INDEX;
        const forwardEdges = snapshot.edges;
        const firstEdgeIndexes = new Uint32Array(nodeCount + 1);
        firstEdgeIndexes[nodeCount] = forwardEdges.length;
        for (let nodeIndex = 0, edgeIndex = 0; nodeIndex < nodeCount; ++nodeIndex) {
            firstEdgeIndexes[nodeIndex] = edgeIndex;
            edgeIndex += snapshot.nodes.get(nodeIndex).edge_count;
        }
        const flag = PAGE_OBJECT_FLAG;
        const nodeStack = new Uint32Array(nodeCount);
        const edgeStack = new Uint32Array(nodeCount);
        const postOrderIndex2NodeIndex = new Uint32Array(nodeCount);
        const nodeIndex2PostOrderIndex = new Uint32Array(nodeCount);
        const visited = new Uint8Array(nodeCount);
        let postOrderIndex = 0;
        // build a DFS stack and put the root node
        // at the bottom of the stack
        let stackTopIndex = 0;
        nodeStack[0] = rootNodeIndex;
        edgeStack[0] = firstEdgeIndexes[rootNodeIndex];
        visited[rootNodeIndex] = 1;
        let iteratedOnce = false;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // use DFS to traverse all nodes via a stack
            while (stackTopIndex >= 0) {
                const nodeIndex = nodeStack[stackTopIndex];
                const edgeIndex = edgeStack[stackTopIndex];
                const edgesEnd = firstEdgeIndexes[nodeIndex + 1];
                if (edgeIndex < edgesEnd) {
                    edgeStack[stackTopIndex]++;
                    const edgeType = forwardEdges.get(edgeIndex).type;
                    if (!Utils_1.default.isEssentialEdge(nodeIndex, edgeType, rootNodeIndex)) {
                        continue;
                    }
                    const childNodeIndex = forwardEdges.get(edgeIndex)
                        .toNode.nodeIndex;
                    if (visited[childNodeIndex]) {
                        continue;
                    }
                    const nodeFlag = flags[nodeIndex] & flag;
                    const childNodeFlag = flags[childNodeIndex] & flag;
                    // According to Chrome devtools, need to skip the edges from
                    // non-page-owned nodes to page-owned nodes (since debugger may
                    // also have references to heap objects)
                    if (nodeIndex !== rootNodeIndex && childNodeFlag && !nodeFlag) {
                        continue;
                    }
                    ++stackTopIndex;
                    nodeStack[stackTopIndex] = childNodeIndex;
                    edgeStack[stackTopIndex] = firstEdgeIndexes[childNodeIndex];
                    visited[childNodeIndex] = 1;
                }
                else {
                    // DFS is done, now build the post order based on the stack
                    nodeIndex2PostOrderIndex[nodeIndex] = postOrderIndex;
                    postOrderIndex2NodeIndex[postOrderIndex++] = nodeIndex;
                    --stackTopIndex;
                }
            }
            // If we have tried by build the stack once previously
            // or we have already built the post order for all nodes
            if (iteratedOnce || postOrderIndex === nodeCount) {
                break;
            }
            // Otherwise there are some nodes unreachable from
            // the root node
            if (Config_1.default.verbose) {
                Console_1.default.overwrite(`${nodeCount - postOrderIndex} nodes are unreachable from the root`);
            }
            // Now the root node has the last post order index and
            // the DFS stack is empty; we need to put the root node
            // back to the bottom of the DFS stack, traverse all the
            // orphan nodes with weak referrers (nodes unreachable
            // from the root), and make sure the root node has the
            // last post order index
            --postOrderIndex;
            stackTopIndex = 0;
            nodeStack[0] = rootNodeIndex;
            // skip iterating the edges of the root node
            edgeStack[0] = firstEdgeIndexes[rootNodeIndex + 1];
            for (let nodeIndex = 0; nodeIndex < nodeCount; ++nodeIndex) {
                if (visited[nodeIndex] ||
                    !Utils_1.default.hasOnlyWeakReferrers(snapshot.nodes.get(nodeIndex))) {
                    continue;
                }
                // Add all nodes that have only weak referrers
                // to traverse their subgraphs
                ++stackTopIndex;
                nodeStack[stackTopIndex] = nodeIndex;
                edgeStack[stackTopIndex] = firstEdgeIndexes[nodeIndex];
                visited[nodeIndex] = nodeIndex;
            }
            iteratedOnce = true;
        }
        // If we already processed all orphan nodes (nodes unreachable from root)
        // that have only weak referrers and still have some orphans
        if (postOrderIndex !== nodeCount) {
            if (Config_1.default.verbose) {
                Console_1.default.lowLevel(nodeCount - postOrderIndex + ' unreachable nodes in heap snapshot');
            }
            // Now the root node has the last post order index and
            // the DFS stack is empty; we need to put the root node
            // back to the bottom of the DFS stack, traverse all the
            // remaining orphan nodes (nodes unreachable from the root),
            // and make sure the root node has the last post order index
            --postOrderIndex;
            for (let nodeIndex = 0; nodeIndex < nodeCount; ++nodeIndex) {
                if (visited[nodeIndex]) {
                    continue;
                }
                // give the orphan node a postorder index anyway
                nodeIndex2PostOrderIndex[nodeIndex] = postOrderIndex;
                postOrderIndex2NodeIndex[postOrderIndex++] = nodeIndex;
            }
            nodeIndex2PostOrderIndex[rootNodeIndex] = postOrderIndex;
            postOrderIndex2NodeIndex[postOrderIndex++] = rootNodeIndex;
        }
        return {
            postOrderIndex2NodeIndex,
            nodeIndex2PostOrderIndex,
        };
    }
    // The dominance algorithm is from:
    //  Keith D. Cooper and Timothy J. Harvey and Ken Kennedy
    //  "A Simple, Fast Dominance Algorithm"
    calculateDominatorNodesFromPostOrder(nodes, edges, postOrderInfo, flags, snapshot) {
        const { postOrderIndex2NodeIndex, nodeIndex2PostOrderIndex } = postOrderInfo;
        const nodeCount = nodes.length;
        const forwardEdges = edges;
        const firstEdgeIndexes = new Uint32Array(nodeCount + 1);
        firstEdgeIndexes[nodeCount] = forwardEdges.length;
        for (let nodeIndex = 0, edgeIndex = 0; nodeIndex < nodeCount; ++nodeIndex) {
            firstEdgeIndexes[nodeIndex] = edgeIndex;
            edgeIndex += nodes.get(nodeIndex).edge_count;
        }
        const flag = PAGE_OBJECT_FLAG;
        const rootPostOrderedIndex = nodeCount - 1;
        const emptySlot = nodeCount;
        const dominators = new Uint32Array(nodeCount);
        for (let i = 0; i < rootPostOrderedIndex; ++i) {
            dominators[i] = emptySlot;
        }
        dominators[rootPostOrderedIndex] = rootPostOrderedIndex;
        // flag heap objects whose referrers changed and therefore
        // the dominators of those heap objects needs to be recomputed
        const nodesWithOutdatedDominatorInfo = new Uint8Array(nodeCount);
        // start from the direct children of the root node
        let nodeIndex = ROOT_NODE_INDEX;
        const endEdgeIndex = firstEdgeIndexes[nodeIndex + 1];
        for (let edgeIndex = firstEdgeIndexes[nodeIndex]; edgeIndex < endEdgeIndex; edgeIndex++) {
            const edgeType = forwardEdges.get(edgeIndex).type;
            if (!Utils_1.default.isEssentialEdge(ROOT_NODE_INDEX, edgeType, ROOT_NODE_INDEX)) {
                continue;
            }
            const childNodeIndex = forwardEdges.get(edgeIndex).toNode
                .nodeIndex;
            nodesWithOutdatedDominatorInfo[nodeIndex2PostOrderIndex[childNodeIndex]] = 1;
        }
        // now iterate through all nodes in the heap
        let dominatorInfoChanged = true;
        // iterate until no dominator info changed
        while (dominatorInfoChanged) {
            dominatorInfoChanged = false;
            for (let postOrderIndex = rootPostOrderedIndex - 1; postOrderIndex >= 0; --postOrderIndex) {
                if (nodesWithOutdatedDominatorInfo[postOrderIndex] === 0) {
                    continue;
                }
                nodesWithOutdatedDominatorInfo[postOrderIndex] = 0;
                // If dominator of the heap object has already been set to root node,
                // then the heap object's dominator can't be changed anymore
                if (dominators[postOrderIndex] === rootPostOrderedIndex) {
                    continue;
                }
                nodeIndex = postOrderIndex2NodeIndex[postOrderIndex];
                const nodeFlag = flags[nodeIndex] & flag;
                let newDominatorIndex = emptySlot;
                let isOrphanNode = true;
                const node = nodes.get(nodeIndex);
                node.forEachReferrer((edge) => {
                    const referrerEdgeType = edge.type;
                    const referrerNodeIndex = edge.fromNode.nodeIndex;
                    if (!Utils_1.default.isEssentialEdge(referrerNodeIndex, referrerEdgeType, ROOT_NODE_INDEX)) {
                        return;
                    }
                    isOrphanNode = false;
                    const referrerNodeFlag = flags[referrerNodeIndex] & flag;
                    // According to Chrome devtools, need to skip the edges from
                    // non-page-owned nodes to page-owned nodes (since debugger may
                    // also have references to heap objects)
                    if (referrerNodeIndex !== ROOT_NODE_INDEX &&
                        nodeFlag &&
                        !referrerNodeFlag) {
                        return;
                    }
                    if (!this.shouldTraverseEdge(edge, snapshot)) {
                        return;
                    }
                    let referrerPostOrderIndex = nodeIndex2PostOrderIndex[referrerNodeIndex];
                    if (dominators[referrerPostOrderIndex] !== emptySlot) {
                        if (newDominatorIndex === emptySlot) {
                            newDominatorIndex = referrerPostOrderIndex;
                        }
                        else {
                            while (referrerPostOrderIndex !== newDominatorIndex) {
                                while (referrerPostOrderIndex < newDominatorIndex) {
                                    referrerPostOrderIndex = dominators[referrerPostOrderIndex];
                                }
                                while (newDominatorIndex < referrerPostOrderIndex) {
                                    newDominatorIndex = dominators[newDominatorIndex];
                                }
                            }
                        }
                        // no need to check any further if reaching the root node
                        if (newDominatorIndex === rootPostOrderedIndex) {
                            return { stop: true };
                        }
                    }
                });
                // set root node as the dominator of orphan nodes
                if (isOrphanNode) {
                    newDominatorIndex = rootPostOrderedIndex;
                }
                if (newDominatorIndex !== emptySlot &&
                    dominators[postOrderIndex] !== newDominatorIndex) {
                    dominators[postOrderIndex] = newDominatorIndex;
                    dominatorInfoChanged = true;
                    nodeIndex = postOrderIndex2NodeIndex[postOrderIndex];
                    const node = nodes.get(nodeIndex);
                    for (const edge of node.references) {
                        nodesWithOutdatedDominatorInfo[nodeIndex2PostOrderIndex[edge.toNode.nodeIndex]] = 1;
                    }
                }
            }
        }
        const dominatorInfo = new Uint32Array(nodeCount);
        for (let postOrderIndex = 0, l = dominators.length; postOrderIndex < l; ++postOrderIndex) {
            nodeIndex = postOrderIndex2NodeIndex[postOrderIndex];
            dominatorInfo[nodeIndex] =
                postOrderIndex2NodeIndex[dominators[postOrderIndex]];
        }
        return dominatorInfo;
    }
    calculateRetainedSizesFromDominatorNodes(nodes, dominatorInfo, postOrderInfo) {
        const { postOrderIndex2NodeIndex } = postOrderInfo;
        const nodeCount = nodes.length;
        const retainedSizes = new Float64Array(nodeCount);
        for (let nodeIndex = 0; nodeIndex < nodeCount; ++nodeIndex) {
            retainedSizes[nodeIndex] = nodes.get(nodeIndex).self_size;
        }
        // add each heap object size to its dominator
        // based on the post order
        for (let postOrderIndex = 0; postOrderIndex < nodeCount - 1; ++postOrderIndex) {
            const nodeIndex = postOrderIndex2NodeIndex[postOrderIndex];
            const dominatorIndex = dominatorInfo[nodeIndex];
            retainedSizes[dominatorIndex] += retainedSizes[nodeIndex];
        }
        return retainedSizes;
    }
    shouldIgnoreEdgeInTraceFinding(edge) {
        const fromNode = edge.fromNode;
        const toNode = edge.toNode;
        const isDetachedNode = Utils_1.default.isDetachedDOMNode(toNode);
        if (Config_1.default.hideBrowserLeak &&
            Utils_1.default.isBlinkRootNode(fromNode) &&
            isDetachedNode) {
            return true;
        }
        if (!Config_1.default.reportLeaksInTimers &&
            Utils_1.default.isPendingActivityNode(fromNode) &&
            isDetachedNode) {
            return true;
        }
        return false;
    }
    shouldTraverseEdge(edge, snapshot, options = {}) {
        var _a;
        const shouldTraverseByDefault = this.shouldTraverseNodeByInternalStandard(edge, options);
        const externalFilter = (_a = Config_1.default.externalLeakFilter) === null || _a === void 0 ? void 0 : _a.retainerReferenceFilter;
        if (externalFilter != null) {
            return externalFilter(edge, snapshot, shouldTraverseByDefault);
        }
        return shouldTraverseByDefault;
    }
    shouldTraverseNodeByInternalStandard(edge, options = {}) {
        if (this.isBlockListedEdge(edge)) {
            return false;
        }
        return Utils_1.default.isMeaningfulEdge(edge, Object.assign({ includeString: true }, options));
    }
    // remove edges that are already part of reported leaked paths
    isBlockListedEdge(edge) {
        const nameOrIndex = edge.name_or_index;
        if (!Config_1.default.traverseDevToolsConsole &&
            edge.type === 'internal' &&
            typeof nameOrIndex === 'string' &&
            nameOrIndex.indexOf('DevTools console') >= 0) {
            return true;
        }
        if (Config_1.default.edgeNameBlockList.has(String(nameOrIndex))) {
            return true;
        }
        if (Config_1.default.nodeNameBlockList.has(edge.toNode.name)) {
            return true;
        }
        if (Config_1.default.nodeNameBlockList.has(edge.fromNode.name)) {
            return true;
        }
        return false;
    }
    isLessPreferableEdge(edge) {
        const fromNode = edge.fromNode;
        const toNode = edge.toNode;
        // pending activities -> DOM element is less preferrable
        if (Utils_1.default.isPendingActivityNode(fromNode) &&
            Utils_1.default.isDOMNodeIncomplete(toNode)) {
            return true;
        }
        // detached DOM node -> non-detached DOM node is less preferable
        if (Utils_1.default.isDetachedDOMNode(fromNode) &&
            Utils_1.default.isDOMNodeIncomplete(toNode) &&
            !Utils_1.default.isDetachedDOMNode(toNode)) {
            return true;
        }
        // non-detached DOM node -> detached DOM node is less preferable
        if (Utils_1.default.isDOMNodeIncomplete(fromNode) &&
            !Utils_1.default.isDetachedDOMNode(fromNode) &&
            Utils_1.default.isDetachedDOMNode(toNode)) {
            return true;
        }
        return Config_1.default.edgeNameGreyList.has(String(edge.name_or_index));
    }
    isLessPreferableNode(node) {
        return Config_1.default.nodeNameGreyList.has(node.name) || Utils_1.default.isCppRootsNode(node);
    }
    // each edge is indexed by fromNode's ID, toNode's ID, edge name, and edge type
    getEdgeKey(edge) {
        const fromNode = edge.fromNode;
        const toNode = edge.toNode;
        return `${fromNode.id}|${edge.name_or_index}|${edge.type}|${toNode.id}`;
    }
    calculateAllNodesRetainedSizes(snapshot) {
        Console_1.default.overwrite('calculating dominators and retained sizes .');
        // step 1: build post order index
        const flags = new Uint32Array(snapshot.nodes.length);
        Console_1.default.overwrite('calculating dominators and retained sizes ..');
        this.flagReachableNodesFromWindow(snapshot, flags, PAGE_OBJECT_FLAG);
        Console_1.default.overwrite('calculating dominators and retained sizes ...');
        const postOrderInfo = this.buildPostOrderIndex(snapshot, flags);
        // step 2: build dominator relations
        Console_1.default.overwrite('calculating dominators and retained sizes .');
        const dominatorInfo = this.calculateDominatorNodesFromPostOrder(snapshot.nodes, snapshot.edges, postOrderInfo, flags, snapshot);
        // step 3: calculate retained sizes
        Console_1.default.overwrite('calculating dominators and retained sizes ..');
        const retainedSizes = this.calculateRetainedSizesFromDominatorNodes(snapshot.nodes, dominatorInfo, postOrderInfo);
        // step 4: assign retained sizes and dominators to nodes
        Console_1.default.overwrite('calculating dominators and retained sizes ...');
        for (let i = 0; i < retainedSizes.length; i++) {
            const node = snapshot.nodes.get(i);
            node.retainedSize = retainedSizes[i];
            node.dominatorNode = snapshot.nodes.get(dominatorInfo[i]);
        }
    }
    annotateShortestPaths(snapshot, excludeKeySet) {
        snapshot.clearShortestPathInfo();
        Console_1.default.overwrite('annotating shortest path for all nodes');
        const [nodeRootLists, lowPriRootLists] = this.getRootNodeList(snapshot, {
            prioritize: true,
        });
        const nodeCount = snapshot.nodes.length;
        const visited = new Uint8Array(nodeCount);
        const queued = new Uint8Array(nodeCount);
        const traverseOption = {
            visited,
            queued,
            excludeWeakMapEdge: true,
            isForward: true,
        };
        let curQueue = nodeRootLists;
        const postponeQueue = [];
        while (curQueue.length > 0) {
            const nextQueue = [];
            while (curQueue.length > 0) {
                const node = curQueue.pop();
                visited[node.nodeIndex] = 1;
                for (const edge of node.references) {
                    const toNode = edge.toNode;
                    // skip nodes that already have a parent
                    if (toNode.hasPathEdge) {
                        continue;
                    }
                    if (!this.shouldTraverseEdge(edge, snapshot, traverseOption)) {
                        continue;
                    }
                    if (this.shouldIgnoreEdgeInTraceFinding(edge)) {
                        continue;
                    }
                    if (Utils_1.default.isWeakMapEdge(edge) && excludeKeySet) {
                        const weakMapKeyObjectId = Utils_1.default.getWeakMapEdgeKeyId(edge);
                        if (excludeKeySet.has(weakMapKeyObjectId)) {
                            continue;
                        }
                    }
                    // postpone traversing edges and nodes that are less preferable
                    if (this.isLessPreferableEdge(edge) ||
                        this.isLessPreferableNode(toNode)) {
                        postponeQueue.push(edge);
                    }
                    else {
                        toNode.pathEdge = edge;
                        nextQueue.push(toNode);
                    }
                    queued[toNode.nodeIndex] = 1;
                }
            }
            // if no other preferable traces available
            // traverse the postpone queue
            while (nextQueue.length === 0 && postponeQueue.length > 0) {
                const edge = postponeQueue.pop();
                const toNode = edge.toNode;
                if (toNode.hasPathEdge) {
                    continue;
                }
                toNode.pathEdge = edge;
                nextQueue.push(toNode);
            }
            // if no other preferable traces available
            // consider the low priority root nodes
            while (nextQueue.length === 0 && lowPriRootLists.length > 0) {
                const root = lowPriRootLists.pop();
                if (root.hasPathEdge) {
                    continue;
                }
                nextQueue.push(root);
            }
            curQueue = nextQueue;
        }
    }
    getPathToGCRoots(_snapshot, node) {
        if (!node || !node.hasPathEdge) {
            return null;
        }
        const visited = new Set([node.id]);
        let path = { node };
        while (node && node.hasPathEdge) {
            const edge = node.pathEdge;
            const fromNode = edge.fromNode;
            if (visited.has(fromNode.id)) {
                return null;
            }
            visited.add(fromNode.id);
            path = { node: fromNode, edge, next: path };
            node = edge.fromNode;
        }
        return path;
    }
}
exports.default = TraceFinder;
