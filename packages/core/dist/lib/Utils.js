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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.runShell = exports.resolveSnapshotFilePath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const process_1 = __importDefault(require("process"));
const Config_1 = __importStar(require("./Config"));
const Console_1 = __importDefault(require("./Console"));
const Constant_1 = __importDefault(require("./Constant"));
const HeapParser_1 = __importDefault(require("./HeapParser"));
const memCache = Object.create(null);
const FileManager_1 = __importDefault(require("./FileManager"));
const __1 = require("..");
const HeapNode_1 = require("./heap-data/HeapNode");
// For more details see ReactWorkTags.js of React
const reactWorkTag = {
    FunctionComponent: 0,
    ClassComponent: 1,
    IndeterminateComponent: 2,
    HostRoot: 3,
    HostPortal: 4,
    HostComponent: 5,
    HostText: 6,
    Fragment: 7,
    Mode: 8,
    ContextConsumer: 9,
    ContextProvider: 10,
    ForwardRef: 11,
    Profiler: 12,
    SuspenseComponent: 13,
    MemoComponent: 14,
    SimpleMemoComponent: 15,
    LazyComponent: 16,
    IncompleteClassComponent: 17,
    DehydratedFragment: 18,
    SuspenseListComponent: 19,
    ScopeComponent: 21,
    OffscreenComponent: 22,
    LegacyHiddenComponent: 23,
    CacheComponent: 24,
};
const reactTagIdToName = [];
Object.entries(reactWorkTag).forEach(workTag => (reactTagIdToName[workTag[1]] = workTag[0]));
function _getReactWorkTagName(tagId) {
    if (typeof tagId === 'string') {
        tagId = parseInt(tagId, 10);
    }
    if (typeof tagId !== 'number' || tagId !== tagId) {
        return null;
    }
    return reactTagIdToName[tagId];
}
function isHermesInternalObject(node) {
    return (node.type === 'number' ||
        node.name === 'HiddenClass' ||
        node.name === 'Environment' ||
        node.name === 'ArrayStorage' ||
        node.name === 'SegmentedArray' ||
        node.name === 'WeakValueMap' ||
        node.name === 'HashMapEntry');
}
function isStackTraceFrame(node) {
    if (!node || node.type !== 'hidden') {
        return false;
    }
    return node.name === 'system / StackTraceFrame';
}
// returns true if it is detached DOM element or detached FiberNode
// NOTE: Doesn't work for FiberNode without detachedness field
function isDetached(node) {
    if (Config_1.default.snapshotHasDetachedness) {
        return node.is_detached;
    }
    return node.name.startsWith('Detached ');
}
function isFiberNode(node) {
    if (!node || node.type !== 'object') {
        return false;
    }
    const name = node.name;
    return name === 'FiberNode' || name === 'Detached FiberNode';
}
// quickly check the detachedness field
// need to call markDetachedFiberNode(node) before this function
// does not traverse and check the existance of HostRoot
// NOTE: Doesn't work for FiberNode without detachedness field
function isDetachedFiberNode(node) {
    return isFiberNode(node) && isDetached(node);
}
// return true if this node is InternalNode (native)
function isDOMInternalNode(node) {
    if (node == null) {
        return false;
    }
    return (node.type === 'native' &&
        (node.name === 'InternalNode' || node.name === 'Detached InternalNode'));
}
// return true the the nodee is a global handles node
function isGlobalHandlesNode(node) {
    if (node == null) {
        return false;
    }
    return node.name === '(Global handles)' && node.type === 'synthetic';
}
// this function returns a more general sense of DOM nodes. Specifically,
// any detached DOM nodes (e.g., HTMLXXElement, IntersectionObserver etc.)
// that are not internal nodes.
function isDetachedDOMNode(node, args = {}) {
    let name = null;
    if (!node || typeof (name = node.name) !== 'string') {
        return false;
    }
    if (isFiberNode(node)) {
        return false;
    }
    if (name === 'Detached InternalNode' && args.ignoreInternalNode) {
        return false;
    }
    return isDetached(node);
}
function isWeakMapEdge(edge) {
    if (!edge || typeof edge.name_or_index !== 'string') {
        return false;
    }
    if (edge.name_or_index.indexOf('WeakMap') < 0) {
        return false;
    }
    return true;
}
function isWeakMapEdgeToKey(edge) {
    if (!isWeakMapEdge(edge)) {
        return false;
    }
    const weakMapKeyObjectId = getWeakMapEdgeKeyId(edge);
    const toNodeObjectId = edge.toNode.id;
    // in WeakMap, keys are weakly referenced
    if (weakMapKeyObjectId === toNodeObjectId) {
        return true;
    }
    return false;
}
function isWeakMapEdgeToValue(edge) {
    if (!isWeakMapEdge(edge)) {
        return false;
    }
    const weakMapKeyObjectId = getWeakMapEdgeKeyId(edge);
    const toNodeObjectId = edge.toNode.id;
    // in WeakMap, keys are weakly referenced
    if (weakMapKeyObjectId !== toNodeObjectId) {
        return true;
    }
    return false;
}
function isEssentialEdge(nodeIndex, edgeType, rootNodeIndex) {
    // According to Chrome Devtools, most shortcut edges are non-essential
    // except at the root node, which have special meaning of marking user
    // global objects
    // NOTE: However, bound function may have a shortcut edge to the bound
    //       host object
    return (edgeType !== 'weak' &&
        (edgeType !== 'shortcut' || nodeIndex === rootNodeIndex));
}
function isFiberNodeDeletionsEdge(edge) {
    if (!edge || !edge.fromNode || !edge.toNode) {
        return false;
    }
    if (!isFiberNode(edge.fromNode)) {
        return false;
    }
    return edge.name_or_index === 'deletions';
}
function isBlinkRootNode(node) {
    if (!node || !node.name) {
        return false;
    }
    return (node.type === 'synthetic' &&
        (node.name === 'Blink cross-thread roots' || node.name === 'Blink roots'));
}
function isPendingActivityNode(node) {
    if (!node || !node.name) {
        return false;
    }
    if (node.type !== 'synthetic' && node.type !== 'native') {
        return false;
    }
    return node.name === 'Pending activities';
}
const htmlElementRegex = /^HTML.*Element$/;
const svgElementRegex = /^SVG.*Element$/;
const htmlCollectionRegex = /^HTML.*Collection$/;
const cssElementRegex = /^CSS/;
const styleSheetRegex = /StyleSheet/;
const newDOMNodeRegex = /^<[a-zA-Z]+.*>$/;
// special DOM element names that are not
// included in the previous regex definitions
const domElementSpecialNames = new Set([
    'DOMTokenList',
    'HTMLDocument',
    'InternalNode',
    'Text',
    'XMLDocument',
]);
// check the node against a curated list of known HTML Elements
// the list may be incomplete
function isDOMNodeIncomplete(node) {
    if (node.type !== 'native') {
        return false;
    }
    let name = node.name;
    const detachedPrefix = 'Detached ';
    if (name.startsWith(detachedPrefix)) {
        name = name.substring(detachedPrefix.length);
    }
    name = name.trim();
    return (htmlElementRegex.test(name) ||
        svgElementRegex.test(name) ||
        cssElementRegex.test(name) ||
        styleSheetRegex.test(name) ||
        htmlCollectionRegex.test(name) ||
        domElementSpecialNames.has(name) ||
        newDOMNodeRegex.test(name));
}
function isXMLDocumentNode(node) {
    return node.type === 'native' && node.name === 'XMLDocument';
}
function isHTMLDocumentNode(node) {
    return node.type === 'native' && node.name === 'HTMLDocument';
}
function isDOMTextNode(node) {
    return node.type === 'native' && node.name === 'Text';
}
// check if this is a [C++ roots] (synthetic) node
function isCppRootsNode(node) {
    return node.name === 'C++ roots' && node.type === 'synthetic';
}
function isRootNode(node, opt = {}) {
    if (!node) {
        return false;
    }
    // consider Hermes snapshot GC roots
    if (Config_1.default.jsEngine === 'hermes') {
        return node.name === '(GC roots)' || node.name === '(GC Roots)';
    }
    if (node.id === 0 || node.id === 1) {
        return true;
    }
    // the window object
    if (node.type === 'native' && node.name.indexOf('Window') === 0) {
        return true;
    }
    if (node.type === 'synthetic' && node.name === '(GC roots)') {
        return true;
    }
    if (!opt.excludeBlinkRoot && isBlinkRootNode(node)) {
        return true;
    }
    if (!opt.excludePendingActivity && isPendingActivityNode(node)) {
        return true;
    }
    return false;
}
// in Hermes engine, directProp edge is a shortcut reference
// and is less useful for debugging leak trace
const directPropRegex = /^directProp\d+$/;
function isDirectPropEdge(edge) {
    return directPropRegex.test(`${edge.name_or_index}`);
}
function isReturnEdge(edge) {
    if (!edge) {
        return false;
    }
    if (typeof edge.name_or_index !== 'string') {
        return false;
    }
    return edge.name_or_index.startsWith('return');
}
function isReactPropsEdge(edge) {
    if (!edge) {
        return false;
    }
    if (typeof edge.name_or_index !== 'string') {
        return false;
    }
    return edge.name_or_index.startsWith('__reactProps$');
}
function isReactFiberEdge(edge) {
    if (!edge) {
        return false;
    }
    if (typeof edge.name_or_index !== 'string') {
        return false;
    }
    return edge.name_or_index.startsWith('__reactFiber$');
}
function hasReactEdges(node) {
    if (!node) {
        return false;
    }
    let ret = false;
    node.forEachReference((edge) => {
        if (isReactFiberEdge(edge) || isReactPropsEdge(edge)) {
            ret = true;
        }
        return { stop: true };
    });
    return ret;
}
// HostRoot's stateNode should be a FiberRootNode
function isHostRoot(node) {
    if (!isFiberNode(node)) {
        return false;
    }
    const stateNode = getToNodeByEdge(node, 'stateNode', 'property');
    return !!stateNode && stateNode.name === 'FiberRootNode';
}
function getReactFiberNode(node, propName) {
    if (!node || !isFiberNode(node)) {
        return;
    }
    const targetNode = getToNodeByEdge(node, propName, 'property');
    return isFiberNode(targetNode) ? targetNode : void 0;
}
// check if the current node's parent has the node as a child
function checkIsChildOfParent(node) {
    const parent = getToNodeByEdge(node, 'return', 'property');
    let matched = false;
    iterateChildFiberNodes(parent, child => {
        if (child.id === node.id) {
            matched = true;
            return { stop: true };
        }
    });
    return matched;
}
// iterate through immediate children
function iterateChildFiberNodes(node, cb) {
    if (!isFiberNode(node)) {
        return;
    }
    const visited = new Set();
    let cur = getReactFiberNode(node, 'child');
    while (cur && isFiberNode(cur) && !visited.has(cur.id)) {
        const ret = cb(cur);
        visited.add(cur.id);
        if (ret && ret.stop) {
            break;
        }
        cur = getReactFiberNode(cur, 'sibling');
    }
}
function iterateDescendantFiberNodes(node, iteratorCB) {
    if (!isFiberNode(node)) {
        return;
    }
    const visited = new Set();
    const stack = [node];
    while (stack.length > 0) {
        const cur = stack.pop();
        if (!cur) {
            continue;
        }
        const ret = iteratorCB(cur);
        visited.add(cur.id);
        if (ret && ret.stop) {
            break;
        }
        iterateChildFiberNodes(cur, child => {
            if (visited.has(child.id)) {
                return;
            }
            stack.push(child);
        });
    }
}
function getNodesIdSet(snapshot) {
    const set = new Set();
    snapshot.nodes.forEach(node => {
        set.add(node.id);
    });
    return set;
}
// given a set of nodes S, return a minimal subset S' where
// no nodes are dominated by nodes in S
function getConditionalDominatorIds(ids, snapshot, condCb) {
    const dominatorIds = new Set();
    const fullDominatorIds = new Set();
    // set all node ids
    applyToNodes(ids, snapshot, node => {
        if (condCb(node)) {
            dominatorIds.add(node.id);
            fullDominatorIds.add(node.id);
        }
    });
    // traverse the dominators and remove the node
    // if one of it's dominators is already in the set
    applyToNodes(ids, snapshot, node => {
        const visited = new Set([node.id]);
        let cur = node.dominatorNode;
        while (cur) {
            if (visited.has(cur.id)) {
                break;
            }
            if (fullDominatorIds.has(cur.id)) {
                dominatorIds.delete(node.id);
                break;
            }
            visited.add(cur.id);
            cur = cur.dominatorNode;
        }
    });
    return dominatorIds;
}
const ALTERNATE_NODE_FLAG = 0b1;
const REGULAR_NODE_FLAG = 0b10;
function setFiberNodeAttribute(node, flag) {
    if (!node || !isFiberNode(node)) {
        return;
    }
    node.attributes |= flag;
}
function hasFiberNodeAttribute(node, flag) {
    if (!isFiberNode(node)) {
        return false;
    }
    return !!(node.attributes & flag);
}
function setIsAlternateNode(node) {
    setFiberNodeAttribute(node, ALTERNATE_NODE_FLAG);
}
function isAlternateNode(node) {
    return hasFiberNodeAttribute(node, ALTERNATE_NODE_FLAG);
}
function setIsRegularFiberNode(node) {
    setFiberNodeAttribute(node, REGULAR_NODE_FLAG);
}
function isRegularFiberNode(node) {
    return hasFiberNodeAttribute(node, REGULAR_NODE_FLAG);
}
// The Fiber tree starts with a special type of Fiber node (HostRoot).
function hasHostRoot(node) {
    if (node && node.is_detached) {
        return false;
    }
    let cur = node;
    const visitedIds = new Set();
    const visitedNodes = new Set();
    while (cur && isFiberNode(cur)) {
        if (cur.id == null || visitedIds.has(cur.id)) {
            break;
        }
        visitedNodes.add(cur);
        visitedIds.add(cur.id);
        if (isHostRoot(cur)) {
            return true;
        }
        cur = getReactFiberNode(cur, 'return');
    }
    return false;
}
// The Fiber tree starts with a special type of Fiber node (HostRoot).
// return true if the node is a mounted Fiber node
function markDetachedFiberNode(node) {
    if (node && node.is_detached) {
        return false;
    }
    let cur = node;
    const visitedIds = new Set();
    const visitedNodes = new Set();
    while (cur && isFiberNode(cur)) {
        if (cur.id == null || visitedIds.has(cur.id)) {
            break;
        }
        visitedNodes.add(cur);
        // if a Fiber node whose dominator is neither root nor
        // another Fiber node, then consider it as detached Fiber node
        if (cur.dominatorNode && cur.dominatorNode.id !== 1) {
            if (isDOMNodeIncomplete(cur.dominatorNode) &&
                !isDetachedDOMNode(cur.dominatorNode)) {
                // skip the direct marking of detached DOM nodes here
                // if the Fiber Node is dominated by an attached DOM element
            }
            else if (!isFiberNode(cur.dominatorNode)) {
                cur.markAsDetached();
            }
        }
        visitedIds.add(cur.id);
        if (isHostRoot(cur)) {
            return true;
        }
        cur = getReactFiberNode(cur, 'return');
    }
    for (const visitedNode of visitedNodes) {
        visitedNode.markAsDetached();
    }
    return false;
}
function filterNodesInPlace(idSet, snapshot, cb) {
    const ids = Array.from(idSet);
    for (const id of ids) {
        const node = snapshot.getNodeById(id);
        if (node && !cb(node, snapshot)) {
            idSet.delete(id);
        }
    }
}
function applyToNodes(idSet, snapshot, cb, options = {}) {
    let ids = Array.from(idSet);
    if (options.shuffle) {
        ids.sort(() => Math.random() - 0.5);
    }
    else if (options.reverse) {
        ids = ids.reverse();
    }
    for (const id of ids) {
        const node = snapshot.getNodeById(id);
        if (!node) {
            if (Config_1.default.verbose) {
                Console_1.default.warning(`node @${id} is not found`);
            }
            return;
        }
        cb(node, snapshot);
    }
}
function checkScenarioInstance(s) {
    if (typeof s !== 'object' ||
        typeof s.url !== 'function' ||
        (s.action && typeof s.action !== 'function') ||
        (s.back && typeof s.back !== 'function') ||
        (s.repeat && typeof s.repeat !== 'function') ||
        (s.isPageLoaded && typeof s.isPageLoaded !== 'function') ||
        (s.leakFilter && typeof s.leakFilter !== 'function') ||
        (s.beforeLeakFilter && typeof s.beforeLeakFilter !== 'function') ||
        (s.beforeInitialPageLoad &&
            typeof s.beforeInitialPageLoad !== 'function') ||
        (s.setup && typeof s.setup !== 'function')) {
        throw new Error('Invalid senario');
    }
    return s;
}
function loadLeakFilter(filename) {
    const filepath = resolveFilePath(filename);
    if (!filepath || !fs_1.default.existsSync(filepath)) {
        // add a throw to silent the type error
        throw haltOrThrow(`Leak filter definition file doesn't exist: ${filepath}`);
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        let filter = require(filepath);
        if (typeof filter === 'function') {
            return { leakFilter: filter };
        }
        filter = (filter === null || filter === void 0 ? void 0 : filter.default) || filter;
        if (typeof filter === 'function') {
            return { leakFilter: filter };
        }
        if (typeof (filter === null || filter === void 0 ? void 0 : filter.leakFilter) === 'function' ||
            typeof (filter === null || filter === void 0 ? void 0 : filter.retainerReferenceFilter) === 'function') {
            return filter;
        }
        throw haltOrThrow(`Invalid leak filter in ${filepath}`);
    }
    catch (ex) {
        throw haltOrThrow('Invalid leak filter definition file: ' + filename);
    }
}
function loadScenario(filename) {
    const filepath = resolveFilePath(filename);
    if (!filepath || !fs_1.default.existsSync(filepath)) {
        // add a throw to silent the type error
        throw haltOrThrow(`Scenario file doesn't exist: ${filepath}`);
    }
    let scenario;
    try {
        scenario = require(filepath);
        scenario = checkScenarioInstance(scenario);
        if (scenario.name == null) {
            scenario.name = () => path_1.default.basename(filename);
        }
        return scenario;
    }
    catch (ex) {
        throw haltOrThrow('Invalid scenario file: ' + filename);
    }
}
function getScenarioName(scenario) {
    if (!scenario.name) {
        return Constant_1.default.namePrefixForScenarioFromFile;
    }
    if (Constant_1.default.namePrefixForScenarioFromFile.length > 0) {
        return Constant_1.default.namePrefixForScenarioFromFile + '-' + scenario.name();
    }
    return scenario.name();
}
function handleSnapshotError(e) {
    haltOrThrow(e, {
        primaryMessageToPrint: 'Error parsing heap snapshot',
        secondaryMessageToPrint: 'Please pass in a valid heap snapshot file',
    });
}
function getSnapshotFromFile(filename, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const heapConfig = Config_1.default.heapConfig;
        if (heapConfig &&
            heapConfig.currentHeapFile === filename &&
            heapConfig.currentHeap) {
            return heapConfig.currentHeap;
        }
        Console_1.default.overwrite('parsing ' + filename + ' ...');
        let ret = null;
        try {
            ret = yield HeapParser_1.default.parse(filename, options);
        }
        catch (e) {
            handleSnapshotError(getError(e));
        }
        Console_1.default.flush();
        return ret;
    });
}
function getSnapshotNodeIdsFromFile(filename, options) {
    return __awaiter(this, void 0, void 0, function* () {
        Console_1.default.overwrite('lightweight parsing ' + filename + ' ...');
        let ret = new Set();
        try {
            ret = yield HeapParser_1.default.getNodeIdsFromFile(filename, options);
        }
        catch (e) {
            handleSnapshotError(getError(e));
        }
        return ret;
    });
}
const weakMapKeyRegExp = /@(\d+)\) ->/;
function getWeakMapEdgeKeyId(edge) {
    const name = edge.name_or_index;
    if (typeof name !== 'string') {
        return -1;
    }
    const ret = name.match(weakMapKeyRegExp);
    if (!ret) {
        return -1;
    }
    return Number(ret[1]);
}
function isDocumentDOMTreesRoot(node) {
    if (!node) {
        return false;
    }
    return node.type === 'synthetic' && node.name === '(Document DOM trees)';
}
function getEdgeByNameAndType(node, edgeName, type) {
    if (!node) {
        return null;
    }
    return node.findAnyReference((edge) => edge.name_or_index === edgeName &&
        (type === void 0 || edge.type === type));
}
function getEdgeStartsWithName(node, prefix) {
    if (!node) {
        return null;
    }
    return node.findAnyReference(edge => typeof edge.name_or_index === 'string' &&
        edge.name_or_index.startsWith(prefix));
}
function isStringNode(node) {
    return (0, HeapNode_1.isHeapStringType)(node.type);
}
function isSlicedStringNode(node) {
    return node.type === 'sliced string';
}
function getStringNodeValue(node) {
    var _a, _b, _c;
    if (!node) {
        return '';
    }
    if (node.type === 'concatenated string') {
        const firstNode = (_a = getEdgeByNameAndType(node, 'first')) === null || _a === void 0 ? void 0 : _a.toNode;
        const secondNode = (_b = getEdgeByNameAndType(node, 'second')) === null || _b === void 0 ? void 0 : _b.toNode;
        return getStringNodeValue(firstNode) + getStringNodeValue(secondNode);
    }
    if (isSlicedStringNode(node)) {
        const parentNode = (_c = getEdgeByNameAndType(node, 'parent')) === null || _c === void 0 ? void 0 : _c.toNode;
        return getStringNodeValue(parentNode);
    }
    return node.name;
}
function extractClosureNodeInfo(node) {
    let name = _extractClosureNodeInfo(node);
    // replace all [, ], (, and )
    name = name.replace(/[[\]()]/g, '');
    return name;
}
function _extractClosureNodeInfo(node) {
    if (!node) {
        return '';
    }
    const name = node.name === '' ? '<anonymous>' : node.name;
    if (node.type !== 'closure') {
        return name;
    }
    // node.shared
    const sharedEdge = getEdgeByNameAndType(node, 'shared');
    if (!sharedEdge) {
        return name;
    }
    // node.shared.function_data
    const sharedNode = sharedEdge.toNode;
    const functionDataEdge = getEdgeByNameAndType(sharedNode, 'function_data');
    if (!functionDataEdge) {
        return name;
    }
    // node.shared.function_data[0]
    const functionDataNode = functionDataEdge.toNode;
    const displaynameEdge = getEdgeByNameAndType(functionDataNode, 0, 'hidden');
    if (!displaynameEdge) {
        return name;
    }
    // extract display name
    const displayNameNode = displaynameEdge.toNode;
    if (displayNameNode.type === 'concatenated string' ||
        displayNameNode.type === 'string' ||
        displayNameNode.type === 'sliced string') {
        const str = getStringNodeValue(displayNameNode);
        if (str !== '') {
            return `${name} ${str}`;
        }
    }
    return name;
}
function extractFiberNodeInfo(node) {
    let name = _extractFiberNodeInfo(node);
    const tagName = _extractFiberNodeTagInfo(node);
    if (tagName) {
        name += ` ${tagName}`;
    }
    // simplify redundant pattern:
    //  "(Detached )FiberNode X from X.react" -> "(Detached )FiberNode X"
    const detachedPrefix = 'Detached ';
    let prefix = '';
    if (name.startsWith(detachedPrefix)) {
        prefix = detachedPrefix;
        name = name.substring(detachedPrefix.length);
    }
    const matches = name.match(/^FiberNode (\w+) \[from (\w+)\.react\]$/);
    if (matches && matches[1] === matches[2]) {
        name = `FiberNode ${matches[1]}`;
    }
    // replace all [, ], (, and )
    name = name.replace(/[[\]()]/g, '');
    return prefix + name;
}
function getSimplifiedDOMNodeName(node) {
    if (isDetachedDOMNode(node) || isDOMNodeIncomplete(node)) {
        return simplifyTagAttributes(node.name);
    }
    return node.name;
}
function limitStringLength(str, len) {
    if (str.length > len) {
        return str.substring(0, len) + '...';
    }
    return str;
}
function simplifyTagAttributes(str, prioritizedAttributes = Config_1.default.defaultPrioritizedHTMLTagAttributes) {
    const outputLengthLimit = 100;
    const prefixEnd = str.indexOf('<');
    if (prefixEnd <= 0) {
        return str;
    }
    try {
        const prefix = str.substring(0, prefixEnd);
        const tagStr = str.substring(prefixEnd).trim();
        const parsedTag = parseHTMLTags(tagStr)[0];
        if (parsedTag == null) {
            return limitStringLength(str, outputLengthLimit);
        }
        // Build maps for quick lookup
        const attrMap = new Map(parsedTag.attributes.map(attr => [attr.key, attr]));
        const prioritized = [];
        for (const key of prioritizedAttributes) {
            const attr = attrMap.get(key);
            if (attr != null) {
                prioritized.push(attr);
                attrMap.delete(key);
            }
        }
        const remaining = parsedTag.attributes.filter(attr => attrMap.has(attr.key));
        parsedTag.attributes = [...prioritized, ...remaining];
        const finalStr = prefix + serializeParsedTags([parsedTag]);
        return limitStringLength(finalStr, outputLengthLimit);
    }
    catch (_a) {
        return limitStringLength(str, outputLengthLimit);
    }
}
function parseHTMLTags(html) {
    const result = [];
    let i = 0;
    while (i < html.length) {
        if (html[i] === '<') {
            i++; // skip '<'
            // Determine if this is a closing tag
            let isClosing = false;
            if (html[i] === '/') {
                isClosing = true;
                i++;
            }
            // Extract tag name
            let tagName = '';
            while (i < html.length && /[a-zA-Z0-9:-]/.test(html[i])) {
                tagName += html[i++];
            }
            // Skip whitespace
            while (i < html.length && /\s/.test(html[i]))
                i++;
            // Parse attributes
            const attributes = [];
            while (i < html.length && html[i] !== '>' && html[i] !== '/') {
                // Extract key
                let key = '';
                while (i < html.length && /[^\s=>]/.test(html[i])) {
                    key += html[i++];
                }
                // Skip whitespace
                while (i < html.length && /\s/.test(html[i]))
                    i++;
                // Extract value
                let value = true;
                if (html[i] === '=') {
                    i++; // skip '='
                    while (i < html.length && /\s/.test(html[i]))
                        i++;
                    if (html[i] === '"' || html[i] === "'") {
                        const quote = html[i++];
                        value = '';
                        while (i < html.length && html[i] !== quote) {
                            value += html[i++];
                        }
                        i++; // skip closing quote
                    }
                    else {
                        value = '';
                        while (i < html.length && /[^\s>]/.test(html[i])) {
                            value += html[i++];
                        }
                    }
                }
                if (key) {
                    attributes.push({ key, value });
                }
                // Skip whitespace
                while (i < html.length && /\s/.test(html[i]))
                    i++;
            }
            // Check for self-closing
            let isSelfClosing = false;
            if (html[i] === '/') {
                isSelfClosing = true;
                i++; // skip '/'
            }
            // Skip '>'
            if (html[i] === '>')
                i++;
            const type = isClosing
                ? 'closing'
                : isSelfClosing
                    ? 'self-closing'
                    : 'opening';
            result.push({ tagName, attributes, type });
        }
        else {
            i++;
        }
    }
    return result;
}
function serializeParsedTags(tags) {
    return tags
        .map(tag => {
        if (tag.type === 'closing') {
            return `</${tag.tagName}>`;
        }
        const attrString = tag.attributes
            .map(({ key, value }) => {
            if (value === true)
                return key;
            const escaped = String(value).replace(/"/g, '&quot;');
            return `${key}="${escaped}"`;
        })
            .join(' ');
        const space = attrString ? ' ' : '';
        return tag.type === 'self-closing'
            ? `<${tag.tagName}${space}${attrString}/>`
            : `<${tag.tagName}${space}${attrString}>`;
    })
        .join('');
}
// remove all attributes from the tag name
// so Detached <div prop1="xyz" prop2="xyz" ...>
// becomes Detached <div>
function stripTagAttributes(str) {
    let result = '';
    let i = 0;
    while (i < str.length) {
        const open = str.indexOf('<', i);
        if (open === -1) {
            result += str.slice(i);
            break;
        }
        const close = str.indexOf('>', open);
        if (close === -1) {
            result += str.slice(i);
            break;
        }
        // Find the tag name
        const space = str.indexOf(' ', open);
        if (space !== -1 && space < close) {
            const tagName = str.slice(open + 1, space);
            result += str.slice(i, open) + `<${tagName}>`;
        }
        else {
            result += str.slice(i, close + 1);
        }
        i = close + 1;
    }
    return result;
}
function getNumberNodeValue(node) {
    if (!node) {
        return null;
    }
    if (Config_1.default.jsEngine === 'hermes') {
        return +node.name;
    }
    const valueNode = getToNodeByEdge(node, 'value', 'internal');
    if (!valueNode) {
        return null;
    }
    return +valueNode.name;
}
function getBooleanNodeValue(node) {
    if (node === null || node === void 0) {
        return null;
    }
    if (Config_1.default.jsEngine === 'hermes') {
        return node.name === 'true';
    }
    const valueNode = getToNodeByEdge(node, 'value', 'internal');
    if (valueNode === null || valueNode === void 0) {
        return null;
    }
    return valueNode.name === 'true';
}
function _extractFiberNodeTagInfo(node) {
    if (!node) {
        return null;
    }
    if (!isFiberNode(node)) {
        return null;
    }
    const tagNode = getToNodeByEdge(node, 'tag', 'property');
    if (!tagNode) {
        return null;
    }
    if (tagNode.type !== 'number') {
        return null;
    }
    const tagId = getNumberNodeValue(tagNode);
    return _getReactWorkTagName(tagId);
}
function getToNodeByEdge(node, propName, propType) {
    const edge = getEdgeByNameAndType(node, propName, propType);
    if (!edge) {
        return null;
    }
    return edge.toNode;
}
function getSymbolNodeValue(node) {
    if (!node || node.name !== 'symbol') {
        return null;
    }
    const nameNode = getToNodeByEdge(node, 'name');
    if (!nameNode) {
        return null;
    }
    return nameNode.name;
}
function _extractFiberNodeInfo(node) {
    if (!node) {
        return '';
    }
    const name = node.name;
    if (!isFiberNode(node)) {
        return name;
    }
    // extract FiberNode.type
    const typeNode = getToNodeByEdge(node, 'type', 'property');
    if (!typeNode) {
        return name;
    }
    if (typeNode.type === 'string') {
        return `${name} ${typeNode.name}`;
    }
    // extract FiberNode.type.render
    const renderNode = getToNodeByEdge(typeNode, 'render');
    if (renderNode && renderNode.name) {
        return `${name} ${renderNode.name}`;
    }
    // if FiberNode.type or FiberNode.elementType is a symbol
    let value = getSymbolNodeValue(typeNode);
    if (value) {
        return `${name} ${value}`;
    }
    const elementTypeNode = getToNodeByEdge(node, 'elementType', 'property');
    value = getSymbolNodeValue(elementTypeNode);
    if (value) {
        return `${name} ${value}`;
    }
    // extract FiberNode.elementType.$$typeof
    const typeofNode = getToNodeByEdge(elementTypeNode, '$$typeof', 'property');
    value = getSymbolNodeValue(typeofNode);
    if (value) {
        return `${name} ${value}`;
    }
    // extract FiberNode.type.displayName
    const displayNameNode = getToNodeByEdge(typeNode, 'displayName');
    if (!displayNameNode) {
        return name;
    }
    if (displayNameNode.type === 'string') {
        return `${name} ${displayNameNode.name}`;
    }
    if (displayNameNode.type === 'concatenated string') {
        return `${name} ${getStringNodeValue(displayNameNode)}`;
    }
    return name;
}
function extractHTMLElementNodeInfo(node) {
    if (!node) {
        return '';
    }
    const reactFiberEdge = getEdgeStartsWithName(node, '__reactFiber$');
    if (!reactFiberEdge) {
        return node.name;
    }
    return `${node.name} ${extractFiberNodeInfo(reactFiberEdge.toNode)}`;
}
function hasOnlyWeakReferrers(node) {
    const referrer = node.findAnyReferrer(
    // shortcut references are added by JS engine
    // GC won't consider shortcut as a retaining edge
    (edge) => edge.type !== 'weak' && edge.type !== 'shortcut');
    return referrer == null;
}
function getSnapshotSequenceFilePath() {
    if (!Config_1.default.useExternalSnapshot) {
        // load the snapshot sequence meta file from the default location
        return Config_1.default.snapshotSequenceFile;
    }
    if (Config_1.default.externalSnapshotDir) {
        // try to load the snap-seq.json file from the specified external dir
        const metaFile = path_1.default.join(Config_1.default.externalSnapshotDir, 'snap-seq.json');
        if (fs_1.default.existsSync(metaFile)) {
            return metaFile;
        }
    }
    // otherwise return the default meta file for external snapshots
    return Config_1.default.externalSnapshotVisitOrderFile;
}
// this should be called only after exploration
function loadTabsOrder(metaFile = void 0) {
    try {
        const file = metaFile != null && fs_1.default.existsSync(metaFile)
            ? metaFile
            : getSnapshotSequenceFilePath();
        const content = fs_1.default.readFileSync(file, 'UTF-8');
        return JSON.parse(content);
    }
    catch (_a) {
        throw haltOrThrow('snapshot meta data invalid or missing');
    }
}
// return true if the heap node represents JS object or closure
function isObjectNode(node) {
    if (isPlainJSObjectNode(node)) {
        return true;
    }
    return node.type === 'closure';
}
// return true if the heap node represents JS object
function isPlainJSObjectNode(node) {
    if (!node) {
        return false;
    }
    if (Config_1.default.jsEngine === 'hermes') {
        return node.name === 'Object' || node.name.startsWith('Object(');
    }
    return node.name === 'Object';
}
function pathHasDetachedHTMLNode(path) {
    if (!path) {
        return false;
    }
    let p = path;
    while (p) {
        if (p.node && isDetachedDOMNode(p.node)) {
            return true;
        }
        p = p.next;
    }
    return false;
}
function pathHasEdgeWithIndex(path, idx) {
    if (!path || typeof idx !== 'number') {
        return false;
    }
    let p = path;
    while (p) {
        if (p.edge && p.edge.edgeIndex === idx) {
            return true;
        }
        p = p.next;
    }
    return false;
}
function pathHasEdgeWithName(path, edgeName) {
    let p = path;
    while (p) {
        if (p.edge && p.edge.name_or_index === edgeName) {
            return true;
        }
        p = p.next;
    }
    return false;
}
function pathHasNodeOrEdgeWithName(path, name) {
    if (name == null) {
        return true;
    }
    name = name.toLowerCase();
    let p = path;
    while (p) {
        if (p.edge && `${p.edge.name_or_index}`.toLowerCase().includes(name)) {
            return true;
        }
        if (p.node && `${p.node.name}`.toLowerCase().includes(name)) {
            return true;
        }
        p = p.next;
    }
    return false;
}
function getLastNodeId(path) {
    if (!path) {
        return -1;
    }
    let p = path;
    while (p) {
        if (!p.next && p.node) {
            return p.node.id;
        }
        p = p.next;
    }
    return -1;
}
function getReadablePercent(num) {
    if (Number.isNaN(num)) {
        return `${num}%`;
    }
    const v = num * 100;
    let str = v.toFixed(2);
    if (str.endsWith('.00')) {
        str = str.slice(0, -3);
    }
    else if (str.endsWith('0')) {
        str = str.slice(0, -1);
    }
    return str + '%';
}
function getReadableBytes(bytes) {
    let n, suffix;
    if (bytes === void 0 || bytes === null) {
        return '';
    }
    if (bytes >= 1e12) {
        n = ((bytes / 1e11) | 0) / 10;
        suffix = 'TB';
    }
    else if (bytes >= 1e9) {
        n = ((bytes / 1e8) | 0) / 10;
        suffix = 'GB';
    }
    else if (bytes >= 1e6) {
        n = ((bytes / 1e5) | 0) / 10;
        suffix = 'MB';
    }
    else if (bytes >= 1e3) {
        n = ((bytes / 1e2) | 0) / 10;
        suffix = 'KB';
    }
    else if (bytes > 1) {
        n = bytes;
        suffix = ' bytes';
    }
    else if (bytes >= 0) {
        n = bytes;
        suffix = ' byte';
    }
    else {
        return '';
    }
    return n + suffix;
}
function p1(n, divide) {
    return (((n * 10) / divide) | 0) / 10;
}
function getReadableTime(ms) {
    let time = ms;
    if (time < 1000) {
        return `${time}ms`;
    }
    time /= 1000;
    if (time < 60) {
        return `${p1(time, 1)}s`;
    }
    time /= 60;
    if (time < 60) {
        return `${p1(time, 1)}min`;
    }
    time /= 60;
    if (time < 24) {
        return `${p1(time, 1)}hr`;
    }
    time /= 24;
    return `${p1(time, 1)} days`;
}
function shouldShowMoreInfo(node) {
    if (!node || !node.name) {
        return false;
    }
    if (!Config_1.default.nodeToShowMoreInfo) {
        return false;
    }
    return Config_1.default.nodeToShowMoreInfo.has(node.name);
}
function isDebuggableNode(node) {
    if (!node) {
        return false;
    }
    if (node.type === 'native' && !isDetachedDOMNode(node)) {
        return false;
    }
    if (node.type === 'hidden' ||
        node.type === 'array' ||
        node.type === 'string' ||
        node.type === 'number' ||
        node.type === 'concatenated string' ||
        node.type === 'sliced string' ||
        node.type === 'code' ||
        node.name === 'system / Context') {
        return false;
    }
    return true;
}
function throwError(error) {
    if (error) {
        error.stack;
    }
    throw error;
}
function callAsync(f) {
    const promise = f();
    if (promise && promise.catch) {
        promise.catch((e) => {
            var _a;
            const parsedError = getError(e);
            Console_1.default.error(parsedError.message);
            Console_1.default.lowLevel((_a = parsedError.stack) !== null && _a !== void 0 ? _a : '', {
                annotation: Console_1.default.annotations.STACK_TRACE,
            });
        });
    }
}
function checkUninstalledLibrary(ex) {
    var _a;
    const stackStr = (_a = ex.stack) === null || _a === void 0 ? void 0 : _a.toString();
    if (stackStr === null || stackStr === void 0 ? void 0 : stackStr.includes('cannot open shared object file')) {
        haltOrThrow(ex, {
            primaryMessageToPrint: 'Could not launch Chrome. To run MemLab on a CentOS 8 devserver, please run the following command:\n',
            secondaryMessageToPrint: 'sudo dnf install nss libwayland-client libwayland-egl egl-wayland libpng15 mesa-libGL atk java-atk-wrapper at-spi2-atk gtk3 libXt',
        });
    }
}
function closePuppeteer(browser, pages, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Config_1.default.isLocalPuppeteer && !options.warmup) {
            yield Promise.all(pages.map(page => page.close()));
            yield browser.disconnect();
        }
        else if (Config_1.default.skipBrowserCloseWait) {
            browser.close();
        }
        else {
            yield browser.close();
        }
    });
}
function camelCaseToReadableString(str, options = {}) {
    let ret = '';
    const strToProcess = str.trim();
    const isUpperCase = (c) => /^[A-Z]$/.test(c);
    for (const c of strToProcess) {
        if (isUpperCase(c)) {
            ret += ret.length > 0 ? ' ' : '';
            ret += c.toLowerCase();
        }
        else {
            ret += c;
        }
    }
    if (options.capitalizeFirstWord && ret.length > 0) {
        ret = ret[0].toUpperCase() + ret.slice(1);
    }
    return ret;
}
// Given a file path (relative or absolute),
// this function tries to resolve to a absolute path that exists
// in MemLab's directories.
// if nothing is found, it returns null.
function resolveFilePath(file) {
    if (!file) {
        return null;
    }
    const dirs = [
        Config_1.default.curDataDir,
        Config_1.default.persistentDataDir,
        Config_1.default.monoRepoDir,
    ];
    const paths = [file].concat(dirs.map(d => path_1.default.join(d, file)));
    for (const p of paths) {
        const filepath = path_1.default.resolve(p);
        if (fs_1.default.existsSync(filepath)) {
            return filepath;
        }
    }
    return null;
}
const snapshotNamePattern = /^s(\d+)\.heapsnapshot$/;
function compareSnapshotName(f1, f2) {
    // if file name follows the 's{\d+}.heapsnapshot' pattern
    // then order based on the ascending order of the number
    const m1 = f1.match(snapshotNamePattern);
    const m2 = f2.match(snapshotNamePattern);
    if (m1 && m2) {
        return parseInt(m1[1], 10) - parseInt(m2[1], 10);
    }
    // otherwise sort in alpha numeric order
    return f1 < f2 ? -1 : f1 === f2 ? 0 : 1;
}
function getSnapshotFilesInDir(dir) {
    try {
        return fs_1.default
            .readdirSync(dir)
            .filter(file => file.endsWith('.heapsnapshot'))
            .sort(compareSnapshotName)
            .map(file => path_1.default.join(dir, file));
    }
    catch (ex) {
        throw __1.utils.haltOrThrow(__1.utils.getError(ex));
    }
}
function getSnapshotFilesFromTabsOrder(options = {}) {
    const tabsOrder = loadTabsOrder();
    const ret = [];
    const typesSeen = new Set();
    for (let i = 0; i < tabsOrder.length; i++) {
        const tab = tabsOrder[i];
        if (!tab.snapshot) {
            continue;
        }
        if (tab.type) {
            typesSeen.add(tab.type);
        }
        if (options.skipBeforeTabType &&
            !typesSeen.has(options.skipBeforeTabType)) {
            continue;
        }
        ret.push(getSnapshotFilePath(tab));
    }
    return ret;
}
// checks if the snapshots along with their meta data are complete
function checkSnapshots(options = {}) {
    if (Config_1.default.skipSnapshot) {
        haltOrThrow('This command is run with `--no-snapshot`, skip snapshot check.');
    }
    let snapshotDir;
    if (options.snapshotDir) {
        snapshotDir = options.snapshotDir;
    }
    else if (Config_1.default.useExternalSnapshot) {
        snapshotDir = Config_1.default.externalSnapshotDir || '<missing>';
    }
    else {
        snapshotDir = FileManager_1.default.getCurDataDir({ workDir: Config_1.default.workDir });
    }
    if (options.snapshotDir) {
        const snapshots = getSnapshotFilesInDir(snapshotDir);
        const min = options.minSnapshots || 0;
        if (snapshots.length < min) {
            __1.utils.haltOrThrow(`Directory has < ${min} snapshot files: ${options.snapshotDir}`);
        }
        return;
    }
    // check if any snapshot file is missing
    const tabsOrder = loadTabsOrder();
    const missingTabs = Object.create(null);
    let miss = 0;
    for (const tab of tabsOrder) {
        if (!tab.snapshot) {
            continue;
        }
        const file = getSnapshotFilePath(tab);
        if (!fs_1.default.existsSync(file)) {
            ++miss;
            missingTabs[tab.idx] = {
                name: tab.name,
                url: tab.url,
                type: tab.type,
            };
        }
    }
    if (miss > 0) {
        const msg = 'snapshot for the following tabs are missing:';
        const printCallback = () => {
            Console_1.default.warning(msg);
            Console_1.default.table(missingTabs);
        };
        haltOrThrow(msg + JSON.stringify(missingTabs, null, 2), {
            printCallback,
        });
    }
}
function resolveSnapshotFilePath(snapshotFile) {
    const file = resolveFilePath(snapshotFile);
    if (!file) {
        throw haltOrThrow(new Error(`Error: snapshot file doesn't exist ${snapshotFile}`));
    }
    return file;
}
exports.resolveSnapshotFilePath = resolveSnapshotFilePath;
function getSnapshotDirForAnalysis() {
    const dir = Config_1.default.externalSnapshotDir;
    if (!dir) {
        throw __1.utils.haltOrThrow(new Error('external snapshot file not set'));
    }
    return dir;
}
function getSingleSnapshotFileForAnalysis() {
    let path = null;
    // if an external snapshot file is specified
    if (Config_1.default.useExternalSnapshot &&
        Config_1.default.externalSnapshotFilePaths.length > 0) {
        path =
            Config_1.default.externalSnapshotFilePaths[Config_1.default.externalSnapshotFilePaths.length - 1];
        // if running in interactive heap analysis mode
    }
    else if (Config_1.default.heapConfig &&
        Config_1.default.heapConfig.isCliInteractiveMode &&
        Config_1.default.heapConfig.currentHeapFile) {
        path = Config_1.default.heapConfig.currentHeapFile;
        // search for snapshot labeled as baseline, target, or final
    }
    else {
        path = getSnapshotFilePathWithTabType(/(final)|(target)|(baseline)/);
    }
    return resolveSnapshotFilePath(path);
}
function getSnapshotFilePath(tab, options = {}) {
    if (tab.snapshotFile) {
        return path_1.default.isAbsolute(tab.snapshotFile)
            ? tab.snapshotFile
            : path_1.default.join(FileManager_1.default.getCurDataDir(options), tab.snapshotFile);
    }
    const fileName = `s${tab.idx}.heapsnapshot`;
    if (options.workDir) {
        return path_1.default.join(FileManager_1.default.getCurDataDir(options), fileName);
    }
    if (!Config_1.default.useExternalSnapshot) {
        return path_1.default.join(Config_1.default.curDataDir, fileName);
    }
    // if we are loading snapshot from external snapshot dir
    if (Config_1.default.externalSnapshotDir) {
        return path_1.default.join(Config_1.default.externalSnapshotDir, fileName);
    }
    return Config_1.default.externalSnapshotFilePaths[tab.idx - 1];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function equalOrMatch(v1, v2) {
    const t1 = typeof v1;
    const t2 = typeof v2;
    if (t1 === t2) {
        return v1 === v2;
    }
    if (t1 === 'string' && v2 instanceof RegExp) {
        return v2.test(v1);
    }
    if (t2 === 'string' && v1 instanceof RegExp) {
        return v1.test(v2);
    }
    return false;
}
function getSnapshotFilePathWithTabType(type) {
    checkSnapshots();
    const tabsOrder = loadTabsOrder();
    for (let i = tabsOrder.length - 1; i >= 0; --i) {
        const tab = tabsOrder[i];
        if (!tab.snapshot) {
            continue;
        }
        if (equalOrMatch(tab.type, type)) {
            return getSnapshotFilePath(tab);
        }
    }
    return null;
}
function isMeaningfulNode(node) {
    if (!node) {
        return false;
    }
    const nodeName = node.name;
    if (Config_1.default.nodeNameBlockList.has(nodeName)) {
        return false;
    }
    if (isFiberNode(node)) {
        const displayName = extractFiberNodeInfo(node);
        if (Config_1.default.nodeNameBlockList.has(displayName)) {
            return false;
        }
    }
    // More details in https://github.com/ChromeDevTools/devtools-frontend
    // under front_end/heap_snapshot_worker/HeapSnapshot.ts
    if (nodeName === 'system / NativeContext') {
        return false;
    }
    if (nodeName === 'system / SourcePositionTableWithFrameCache') {
        return false;
    }
    if (nodeName === '(map descriptors)') {
        return false;
    }
    if (node.type === 'code') {
        return false;
    }
    return true;
}
function isMeaningfulEdge(edge, options = {}) {
    const node = options.isForward ? edge.toNode : edge.fromNode;
    const source = options.isForward ? edge.fromNode : edge.toNode;
    // exclude self references
    if (source.id === node.id) {
        return false;
    }
    const edgeNameOrIndex = edge.name_or_index;
    if (typeof edgeNameOrIndex === 'string' &&
        Config_1.default.edgeNameBlockList.has(edgeNameOrIndex)) {
        return false;
    }
    const edgeType = edge.type;
    // shortcut edge may be meaningful edges
    // --forceUpdate (variable)--->  [native_bind]
    // --bound_argument_0 (shortcut)--->  [FiberNode]
    if (edgeType === 'weak' /* || edge.type === 'shortcut' */) {
        return false;
    }
    if (options.excludeWeakMapEdge && isWeakMapEdgeToKey(edge)) {
        return false;
    }
    const nodeIndex = node.nodeIndex;
    if (options.visited && options.visited[nodeIndex]) {
        return false;
    }
    if (options.queued && options.queued[nodeIndex]) {
        return false;
    }
    const nodeType = node.type;
    if (!options.includeString && nodeType === 'string') {
        return false;
    }
    if (edgeType === 'internal' && edgeNameOrIndex === 'code') {
        return false;
    }
    // More details about the following three special cases are available
    // in https://github.com/ChromeDevTools/devtools-frontend
    // under front_end/heap_snapshot_worker/HeapSnapshot.ts
    if (edgeType === 'hidden' && edgeNameOrIndex === 'sloppy_function_map') {
        return false;
    }
    const nodeName = node.name;
    if (edgeType === 'hidden' && nodeName === 'system / NativeContext') {
        return false;
    }
    // In v8, (map descriptors) are fixed-length descriptors arrays used
    // to hold JS descriptors.
    if (edgeType === 'array' && nodeName === '(map descriptors)') {
        const index = edgeNameOrIndex;
        // only elements at particular indexes of (map descriptors) are holding
        // representative references to objects.
        if (parseInt(index.toString(), 10) >= 2) {
            return false;
        }
        if (typeof index === 'number' && index % 3 === 1) {
            return false;
        }
    }
    if (!isMeaningfulNode(node)) {
        return false;
    }
    if (Config_1.default.jsEngine === 'hermes' && isDirectPropEdge(edge)) {
        return false;
    }
    if (Config_1.default.ignoreInternalNode && nodeName.includes('InternalNode')) {
        return false;
    }
    if (Config_1.default.ignoreDevToolsConsoleLeak) {
        if (typeof edgeNameOrIndex === 'string' &&
            edgeNameOrIndex.includes('DevTools console')) {
            return false;
        }
    }
    return true;
}
// check if two URLs are equivalent
// for example, the following pairs are equal
// 'https://test.com/?a=1&b=2&a=3', 'https://test.com?b=2&a=3&a=1'
// 'https://test.com/p1/p2?a=1,b=2', 'https://test.com/p1/p2/?a=1,b=2'
function isURLEqual(url1, url2) {
    let u1, u2;
    try {
        u1 = new URL(url1);
        u2 = new URL(url2);
    }
    catch (_e) {
        return false;
    }
    // compare URL fields
    if (u1.protocol !== u2.protocol ||
        u1.host !== u2.host ||
        u1.hostname !== u2.hostname ||
        u1.port !== u2.port ||
        u1.hash !== u2.hash) {
        return false;
    }
    // compare path
    let p1 = u1.pathname;
    p1 = p1.endsWith('/') ? p1.slice(0, -1) : p1;
    let p2 = u2.pathname;
    p2 = p2.endsWith('/') ? p2.slice(0, -1) : p2;
    if (p1 !== p2) {
        return false;
    }
    // compare URL params
    const paramKeys = new Set([
        ...Array.from(u1.searchParams.keys()),
        ...Array.from(u2.searchParams.keys()),
    ]);
    for (const key of paramKeys) {
        const v1 = u1.searchParams.getAll(key).sort().join(' ');
        const v2 = u2.searchParams.getAll(key).sort().join(' ');
        if (v1 !== v2) {
            return false;
        }
    }
    return true;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function getLeakedNode(path) {
    let p = path;
    const set = new Set([p]);
    while (p.next && !set.has(p.next)) {
        set.add(p.next);
        p = p.next;
    }
    if (!p || !p.node) {
        return null;
    }
    return p.node;
}
// print snapshot to file for local testing
function dumpSnapshot(file, snapshot) {
    fs_1.default.writeFileSync(file, JSON.stringify(snapshot.snapshot.meta, null, 0), 'UTF-8');
    const dumpSection = (name, arr) => {
        let buf = '';
        fs_1.default.appendFileSync(file, `\n\n ${name}:\n\n`, 'UTF-8');
        for (let i = 0; i < arr.length; ++i) {
            buf += arr[i] + ',';
            if (buf.length > 1024 * 1024) {
                fs_1.default.appendFileSync(file, '\n\n' + buf, 'UTF-8');
                buf = '';
            }
        }
        fs_1.default.appendFileSync(file, '\n\n' + buf, 'UTF-8');
        buf = '';
    };
    dumpSection('nodes', snapshot.nodes);
    dumpSection('edges', snapshot.edges);
    dumpSection('locations', snapshot.locations);
}
function markAllDetachedFiberNode(snapshot) {
    Console_1.default.overwrite('marking all detached Fiber nodes...');
    snapshot.nodes.forEach(node => {
        if (isFiberNode(node)) {
            markDetachedFiberNode(node);
        }
    });
}
function markAlternateFiberNode(snapshot) {
    Console_1.default.overwrite('marking alternate Fiber nodes...');
    snapshot.nodes.forEach(node => {
        // mark the fiber root node
        if (!isHostRoot(node)) {
            return;
        }
        iterateDescendantFiberNodes(node, (descendant) => {
            // check if the node is doubly linked to its parent
            if (checkIsChildOfParent(descendant)) {
                setIsRegularFiberNode(descendant);
            }
            // mark explicit alternate fiber node
            setIsAlternateNode(getToNodeByEdge(descendant, 'alternate', 'property'));
        });
    });
}
function getAllDominators(node) {
    const visited = new Set();
    const dominators = [];
    let cur = node;
    while (cur && !visited.has(cur.id)) {
        visited.add(cur.id);
        dominators.push(cur);
        cur = cur.dominatorNode;
    }
    return dominators;
}
function upperCaseFirstCharacter(text) {
    if (text.length === 0) {
        return text;
    }
    return text[0].toUpperCase() + text.substring(1);
}
function repeat(str, n) {
    let ret = '';
    for (let i = 0; i < n; ++i) {
        ret += str;
    }
    return ret;
}
function normalizeBaseUrl(url) {
    let ret = url;
    if (url.length > 0 &&
        !url.endsWith('.html') &&
        !url.endsWith('.htm') &&
        !url.endsWith('/')) {
        ret += '/';
    }
    return ret;
}
function haltOrThrow(errorInfo, options = {}) {
    var _a;
    const err = getError(errorInfo);
    const halt = () => __awaiter(this, void 0, void 0, function* () {
        var _b;
        if (options.printErrorBeforeHalting !== false) {
            // only print the error.message when there is no
            // primary message to print or there is no print callback
            if (!options.primaryMessageToPrint && !options.printCallback) {
                Console_1.default.error(err.message);
            }
            // only print stack trace in verbose mode
            if (Config_1.default.verbose) {
                Console_1.default.lowLevel((_b = err.stack) !== null && _b !== void 0 ? _b : '', {
                    annotation: Console_1.default.annotations.STACK_TRACE,
                });
            }
            else {
                Console_1.default.topLevel('Use `memlab help` or `memlab <COMMAND> -h` to get helper text');
            }
            if (options.primaryMessageToPrint) {
                Console_1.default.error(options.primaryMessageToPrint);
            }
            if (options.secondaryMessageToPrint) {
                Console_1.default.lowLevel(options.secondaryMessageToPrint);
            }
            if (options.printCallback) {
                options.printCallback();
            }
        }
        throw process_1.default.exit(1);
    });
    const throwErr = () => {
        let message = '';
        // show primary message
        if (options.primaryMessageToPrint) {
            message = options.primaryMessageToPrint;
        }
        else {
            message = err.message;
        }
        // append secondary message
        if (options.secondaryMessageToPrint) {
            message += `(${options.secondaryMessageToPrint})`;
        }
        // if already specified a primary message,
        // append the error.message at the end
        if (options.primaryMessageToPrint) {
            if (message.length > 0 && !message.endsWith('.')) {
                message += '. ';
            }
            message += err.message;
        }
        err.message = message;
        throw err;
    };
    const handling = (_a = options === null || options === void 0 ? void 0 : options.errorHandling) !== null && _a !== void 0 ? _a : Config_1.default.errorHandling;
    switch (handling) {
        case Config_1.ErrorHandling.Halt:
            halt();
            break;
        case Config_1.ErrorHandling.Throw:
            throwErr();
            break;
    }
    throw 'unreachable';
}
function getError(maybeError) {
    if (maybeError instanceof Error) {
        return maybeError;
    }
    return convertToError(maybeError);
}
function convertToError(maybeError) {
    if (isErrorWithMessage(maybeError)) {
        return new Error(maybeError.message);
    }
    try {
        const msg = typeof maybeError === 'string' ? maybeError : JSON.stringify(maybeError);
        return new Error(msg);
    }
    catch (_a) {
        // fallback in case there's an error stringifying the maybeError
        // like with circular references for example.
        return new Error(String(maybeError));
    }
}
function isErrorWithMessage(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string');
}
// check if a node is dominated by an array referenced as 'deletions'
// React stores unmounted fiber nodes that will be deleted soon in
// a 'deletions' array.
function isNodeDominatedByDeletionsArray(node) {
    const dominators = getAllDominators(node);
    return dominators.some(dominator => {
        const edges = dominator.referrers;
        return edges.some(e => e.name_or_index === 'deletions');
    });
}
let uindex = 1;
function getUniqueID() {
    return `${process_1.default.pid}-${Date.now()}-${uindex++}`;
}
// try to get the url that defines the closure function
// this is particular to heap snapshot taken from V8 in Chromium
function getClosureSourceUrl(node) {
    var _a, _b;
    if (node.type !== 'closure') {
        return null;
    }
    const shared = node.getReferenceNode('shared', 'internal');
    if (!shared) {
        return null;
    }
    const debug = shared.getReferenceNode('script_or_debug_info', 'internal');
    if (!debug) {
        return null;
    }
    const urlNode = debug.getReferenceNode('name', 'internal');
    const url = (_b = (_a = urlNode === null || urlNode === void 0 ? void 0 : urlNode.toStringNode()) === null || _a === void 0 ? void 0 : _a.stringValue) !== null && _b !== void 0 ? _b : null;
    return url;
}
function runShell(command, options = {}) {
    var _a, _b, _c;
    const runningDir = (_b = (_a = options.dir) !== null && _a !== void 0 ? _a : Config_1.default.workDir) !== null && _b !== void 0 ? _b : FileManager_1.default.getTmpDir();
    const execOptions = {
        cwd: runningDir,
        stdio: options.disconnectStdio
            ? []
            : [process_1.default.stdin, process_1.default.stdout, process_1.default.stderr],
    };
    if (process_1.default.platform !== 'win32') {
        execOptions.shell = '/bin/bash';
    }
    let ret = null;
    if (Config_1.default.verbose || Config_1.default.isContinuousTest) {
        Console_1.default.lowLevel(`running shell command: ${command}`);
    }
    try {
        ret = child_process_1.default.execSync(command, execOptions);
    }
    catch (ex) {
        if (Config_1.default.verbose || Config_1.default.isContinuousTest) {
            if (ex instanceof Error) {
                Console_1.default.lowLevel(ex.message);
                Console_1.default.lowLevel((_c = ex.stack) !== null && _c !== void 0 ? _c : '', {
                    annotation: Console_1.default.annotations.STACK_TRACE,
                });
            }
        }
        if (options.throwError) {
            throw ex;
        }
        if (options.ignoreError === true) {
            return '';
        }
        __1.utils.haltOrThrow(`Error when executing command: ${command}`);
    }
    return ret && ret.toString('UTF-8');
}
exports.runShell = runShell;
function getRetainedSize(node) {
    return node.retainedSize;
}
function aggregateDominatorMetrics(ids, snapshot, checkNodeCb, nodeMetricsCb) {
    let ret = 0;
    const dominators = __1.utils.getConditionalDominatorIds(ids, snapshot, checkNodeCb);
    __1.utils.applyToNodes(dominators, snapshot, node => {
        ret += nodeMetricsCb(node);
    });
    return ret;
}
function getLeakTracePathLength(path) {
    let len = 0;
    let p = path;
    while (p) {
        p = p.next;
        ++len;
    }
    return len;
}
function getNumberAtPercentile(arr, percentile) {
    arr.sort(function (a, b) {
        return a - b;
    });
    const index = (percentile / 100) * arr.length;
    const indexInt = Math.floor(index);
    if (indexInt === index) {
        return arr[Math.floor(index)];
    }
    if (indexInt + 1 < arr.length) {
        return (arr[indexInt] + arr[indexInt + 1]) / 2;
    }
    return arr[indexInt];
}
function mapToObject(map) {
    const ret = Object.create(null);
    map.forEach((v, k) => {
        ret[k] = v;
    });
    return ret;
}
function objectToMap(object) {
    const ret = new Map();
    for (const k of Object.keys(object)) {
        ret.set(k, object[k]);
    }
    return ret;
}
function tryToMutePuppeteerWarning() {
    if (process_1.default.env['PUPPETEER_DISABLE_HEADLESS_WARNING'] != null) {
        return;
    }
    if (Config_1.default.verbose) {
        Console_1.default.lowLevel('Setting env variable PUPPETEER_DISABLE_HEADLESS_WARNING=1 ' +
            'to mute puppeteer warnings.');
    }
    process_1.default.env['PUPPETEER_DISABLE_HEADLESS_WARNING'] = '1';
}
function isStandardNumberToString(input) {
    return parseInt(input, 10).toString() === input;
}
function setChromiumBinary(config, chromiumBinary) {
    const binaryPath = path_1.default.isAbsolute(chromiumBinary)
        ? path_1.default.resolve(chromiumBinary)
        : path_1.default.resolve(process_1.default.cwd(), chromiumBinary);
    if (!fs_1.default.existsSync(binaryPath)) {
        throw __1.utils.haltOrThrow(`Chromium binary does not exist: ${binaryPath}`);
    }
    if (config.verbose) {
        Console_1.default.lowLevel(`Using ${binaryPath} as Chromium binary for E2E run`);
    }
    config.puppeteerConfig.executablePath = binaryPath;
}
function convertToReadableArg(arg) {
    const startsWithBackslashAndQuote = arg.startsWith('\\"');
    const endsWithBackslashAndQuote = arg.endsWith('\\"');
    if (startsWithBackslashAndQuote && endsWithBackslashAndQuote) {
        return `"${arg.substring(2, arg.length - 2)}"`;
    }
    if (/\s/.test(arg)) {
        return `"${arg}"`;
    }
    return arg;
}
function convertCLIArgsToReadableCommand(args) {
    return args.map(convertToReadableArg).join(' ');
}
exports.default = {
    aggregateDominatorMetrics,
    applyToNodes,
    callAsync,
    camelCaseToReadableString,
    checkIsChildOfParent,
    checkSnapshots,
    checkUninstalledLibrary,
    closePuppeteer,
    convertCLIArgsToReadableCommand,
    dumpSnapshot,
    equalOrMatch,
    extractClosureNodeInfo,
    extractFiberNodeInfo,
    extractHTMLElementNodeInfo,
    filterNodesInPlace,
    getAllDominators,
    getBooleanNodeValue,
    getClosureSourceUrl,
    getConditionalDominatorIds,
    getEdgeByNameAndType,
    getError,
    getLastNodeId,
    getLeakTracePathLength,
    getLeakedNode,
    getNodesIdSet,
    getNumberAtPercentile,
    getNumberNodeValue,
    getReadableBytes,
    getReadablePercent,
    getReadableTime,
    getRetainedSize,
    getScenarioName,
    getSimplifiedDOMNodeName,
    getSingleSnapshotFileForAnalysis,
    getSnapshotDirForAnalysis,
    getSnapshotFilePath,
    getSnapshotFilePathWithTabType,
    getSnapshotFilesFromTabsOrder,
    getSnapshotFilesInDir,
    getSnapshotFromFile,
    getSnapshotNodeIdsFromFile,
    getSnapshotSequenceFilePath,
    getStringNodeValue,
    getToNodeByEdge,
    getUniqueID,
    getWeakMapEdgeKeyId,
    haltOrThrow,
    hasHostRoot,
    hasOnlyWeakReferrers,
    hasReactEdges,
    isAlternateNode,
    isBlinkRootNode,
    isCppRootsNode,
    isDOMInternalNode,
    isDOMNodeIncomplete,
    isDOMTextNode,
    isDebuggableNode,
    isDetachedDOMNode,
    isDetachedFiberNode,
    isDirectPropEdge,
    isDocumentDOMTreesRoot,
    isEssentialEdge,
    isFiberNode,
    isFiberNodeDeletionsEdge,
    isGlobalHandlesNode,
    isHTMLDocumentNode,
    isHermesInternalObject,
    isHostRoot,
    isMeaningfulEdge,
    isMeaningfulNode,
    isNodeDominatedByDeletionsArray,
    isObjectNode,
    isPendingActivityNode,
    isPlainJSObjectNode,
    isReactFiberEdge,
    isReactPropsEdge,
    isRegularFiberNode,
    isReturnEdge,
    isRootNode,
    isSlicedStringNode,
    isStackTraceFrame,
    isStandardNumberToString,
    isStringNode,
    isURLEqual,
    isWeakMapEdge,
    isWeakMapEdgeToKey,
    isWeakMapEdgeToValue,
    isXMLDocumentNode,
    iterateChildFiberNodes,
    iterateDescendantFiberNodes,
    loadLeakFilter,
    loadScenario,
    loadTabsOrder,
    mapToObject,
    markAllDetachedFiberNode,
    markAlternateFiberNode,
    markDetachedFiberNode,
    memCache,
    normalizeBaseUrl,
    objectToMap,
    pathHasDetachedHTMLNode,
    pathHasEdgeWithIndex,
    pathHasEdgeWithName,
    pathHasNodeOrEdgeWithName,
    repeat,
    resolveFilePath,
    resolveSnapshotFilePath,
    runShell,
    setChromiumBinary,
    setIsAlternateNode,
    setIsRegularFiberNode,
    shouldShowMoreInfo,
    shuffleArray,
    simplifyTagAttributes,
    stripTagAttributes,
    throwError,
    tryToMutePuppeteerWarning,
    upperCaseFirstCharacter,
};
