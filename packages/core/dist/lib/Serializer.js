"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const Config_1 = __importDefault(require("./Config"));
const Utils_1 = __importDefault(require("./Utils"));
const Console_1 = __importDefault(require("./Console"));
const TraceFinder_1 = __importDefault(require("../paths/TraceFinder"));
const SerializationHelper_1 = __importDefault(require("./SerializationHelper"));
const REGEXP_NAME_CLEANUP = /[[]\(\)]/g;
const EMPTY_JSONIFY_OPTIONS = {
    fiberNodeReturnTrace: {},
};
function JSONifyNodeRetainSize(node) {
    const nodeRetainSize = node.retainedSize;
    return nodeRetainSize ? `$retained-size:${nodeRetainSize}` : '';
}
function getNodeNameInJSON(node, args = {}) {
    const leakedIdSet = args.leakedIdSet;
    const isLeaked = leakedIdSet ? leakedIdSet.has(node.id) : false;
    let name = node.name === '' ? '<anonymous>' : node.name;
    const nodeImpact = JSONifyNodeRetainSize(node);
    if (Utils_1.default.isDetachedDOMNode(node) || Utils_1.default.isDOMNodeIncomplete(node)) {
        name = Utils_1.default.getSimplifiedDOMNodeName(node);
    }
    else if (Utils_1.default.isFiberNode(node)) {
        name = Utils_1.default.extractFiberNodeInfo(node);
    }
    else if (node.type === 'closure') {
        name = Utils_1.default.extractClosureNodeInfo(node);
    }
    // replace all [, ], (, and )
    name = name.replace(REGEXP_NAME_CLEANUP, ' ');
    const leakTag = isLeaked ? '$memLabTag:leaked' : '';
    // figure out the node is allocated in which snapshot
    let snapshotTag = '';
    if (args.nodeIdsInSnapshots) {
        for (let i = 0; i < args.nodeIdsInSnapshots.length; i++) {
            const snapshotIds = args.nodeIdsInSnapshots[i];
            if (snapshotIds.has(node.id)) {
                snapshotTag = `$snapshotIdTag:${i + 1}`;
                break;
            }
        }
    }
    const highlightTag = node.highlight ? '$highlight' : '';
    const alternateTag = Utils_1.default.isAlternateNode(node)
        ? '$memLabTag:alternate'
        : '';
    if (name === 'system / Context') {
        name = '<function scope>';
    }
    let ret = `[${name}](${node.type})`;
    ret += ` @${node.id}`;
    ret += ` ${nodeImpact}`;
    ret += ` ${leakTag}`;
    ret += ` ${alternateTag}`;
    ret += ` ${snapshotTag}`;
    ret += ` ${highlightTag}`;
    return ret;
}
function getEdgeNameInJSON(edge, edgeRetainSize = 0) {
    const prefix = `  --${JSONifyEdgeNameAndType(edge)}`;
    const suffix = '--->  ';
    const sizeInfo = edgeRetainSize > 0 ? `(retaining bytes: ${edgeRetainSize})` : '';
    return `${prefix}${sizeInfo}${suffix}`;
}
function JSONifyEdgeNameAndType(edge) {
    const edgeName = filterJSONPropName(edge.name_or_index);
    const edgeType = edge.type === 'context' ? 'variable' : edge.type;
    return `${edgeName} (${edgeType})`;
}
function filterJSONPropName(name_or_index) {
    if (name_or_index === 'hasOwnProperty') {
        name_or_index += ' ';
    }
    if (typeof name_or_index === 'string') {
        // replace all [, ], (, and )
        name_or_index = name_or_index.replace(/[[\]()]/g, '');
    }
    return name_or_index;
}
function JSONifyDetachedHTMLElement(node, args, options) {
    const info = Object.create(null);
    // options for elem.__reactFiber$xxx
    const fiberOptions = Object.assign({}, options);
    const nextDepth = options.forceJSONifyDepth
        ? options.forceJSONifyDepth - 1
        : void 0;
    fiberOptions.forceJSONifyDepth = nextDepth;
    // options for elem.__reactProps$xxx
    const propsOptions = Object.assign({}, options);
    propsOptions.forceJSONifyDepth = 1;
    iterateSelectedEdges(node, (edge) => {
        const key = JSONifyEdgeNameAndType(edge);
        if (Utils_1.default.isReactFiberEdge(edge)) {
            info[key] = JSONifyNode(edge.toNode, args, fiberOptions);
        }
        else if (Utils_1.default.isReactPropsEdge(edge)) {
            info[key] = JSONifyNode(edge.toNode, args, propsOptions);
        }
        else {
            info[key] = JSONifyNodeInShort(edge.toNode);
        }
        return null;
    });
    return info;
}
function calculateReturnTrace(node, cache) {
    if (!node || !Utils_1.default.isFiberNode(node)) {
        return null;
    }
    if (cache[node.nodeIndex]) {
        return cache[node.nodeIndex];
    }
    const returnNode = Utils_1.default.getToNodeByEdge(node, 'return', 'property');
    const returnNodeTrace = calculateReturnTrace(returnNode, cache);
    return (cache[node.nodeIndex] = node.nodeIndex + ' | ' + returnNodeTrace);
}
// use properties that should be serialized with more in-depth info
const objectNodeUsefulProps = new Set(['_context']);
function JSONifyNodeOneLevel(node) {
    const info = Object.create(null);
    iterateSelectedEdges(node, (edge) => {
        const key = JSONifyEdgeNameAndType(edge);
        info[key] = JSONifyNodeShallow(edge.toNode);
        return null;
    });
    return info;
}
// double check when you try to call JSONify methods
// other than JSONifyNodeShallow and JSONifyNodeInShort inside this method
// as it may trigger infinite recursion
function JSONifyNodeShallow(node, options = {}) {
    const info = Object.create(null);
    options.processedNodeId = options.processedNodeId || new Set();
    options.processedNodeId.add(node.id);
    iterateSelectedEdges(node, (edge) => {
        var _a;
        const key = JSONifyEdgeNameAndType(edge);
        if (!((_a = options.processedNodeId) === null || _a === void 0 ? void 0 : _a.has(edge.toNode.id)) &&
            objectNodeUsefulProps.has(edge.name_or_index)) {
            info[key] = JSONifyNodeShallow(edge.toNode);
        }
        else {
            info[key] = JSONifyNodeInShort(edge.toNode);
        }
        return null;
    });
    options.processedNodeId.delete(node.id);
    return info;
}
const fiberNodeUsefulProps = new Set([
    'stateNode',
    'type',
    'elementType',
]);
function JSONifyFiberNodeShallow(node) {
    const info = Object.create(null);
    iterateSelectedEdges(node, (edge) => {
        const key = JSONifyEdgeNameAndType(edge);
        if (fiberNodeUsefulProps.has(edge.name_or_index) &&
            Utils_1.default.isObjectNode(edge.toNode)) {
            info[key] = JSONifyNodeShallow(edge.toNode);
        }
        else {
            info[key] = JSONifyNodeInShort(edge.toNode);
        }
        return null;
    });
    return info;
}
// calculate the summary of return chain of the FiberNode
function JSONifyFiberNodeReturnTrace(node, args, options) {
    const cache = options.fiberNodeReturnTrace;
    const returnTrace = calculateReturnTrace(node, cache);
    if (!returnTrace) {
        return null;
    }
    const idxs = returnTrace.split(' | ');
    const trace = Object.create(null);
    let num = 0;
    for (const idx of idxs) {
        const index = Number(idx);
        let key = `${num++}`;
        if (Number.isNaN(index)) {
            continue;
        }
        const parent = node.snapshot.nodes.get(index);
        if (!parent) {
            continue;
        }
        const parentInfo = getNodeNameInJSON(parent, args);
        key = `${key}:  --return (property)--->  ${parentInfo}`;
        const info = Config_1.default.includeObjectInfoInTraceReturnChain
            ? JSONifyFiberNodeShallow(parent)
            : Object.create(null);
        trace[key] = info;
    }
    return trace;
}
function JSONifyFiberNode(node, args, options) {
    const info = Object.create(null);
    // create an option to cache the FiberNode return chain
    if (!options.fiberNodeReturnTrace) {
        options.fiberNodeReturnTrace = Object.create(null);
    }
    const returnTraceJSON = JSONifyFiberNodeReturnTrace(node, args, options);
    info['React Fiber return chain (extra)'] = returnTraceJSON;
    const propsOptions = Object.assign({}, options);
    // for FiberNode, force expand a few more levels
    if (propsOptions.forceJSONifyDepth === void 0) {
        propsOptions.forceJSONifyDepth = 1;
    }
    propsOptions.forceJSONifyDepth--;
    iterateSelectedEdges(node, (edge) => {
        const key = JSONifyEdgeNameAndType(edge);
        info[key] =
            propsOptions.forceJSONifyDepth && propsOptions.forceJSONifyDepth >= 1
                ? JSONifyNode(edge.toNode, args, propsOptions)
                : JSONifyNodeInShort(edge.toNode);
        return null;
    });
    return info;
}
function JSONifyClosure(node, args, options) {
    const info = Object.create(null);
    iterateSelectedEdges(node, (edge) => {
        if (edge.name_or_index === 'shared' ||
            edge.name_or_index === 'context' ||
            edge.name_or_index === 'displayName') {
            const key = filterJSONPropName(edge.name_or_index);
            info[key] = JSONifyNode(edge.toNode, args, options);
        }
        return null;
    });
    return info;
}
function JSONifyNumberNode(node, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_args, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_options) {
    const info = Object.create(null);
    info.value = Utils_1.default.getNumberNodeValue(node);
    return info;
}
function JSONifyCode(node, args, options) {
    const info = Object.create(null);
    iterateSelectedEdges(node, (edge) => {
        if (edge.name_or_index === 'name_or_scope_info' &&
            edge.toNode.name === '(function scope info)') {
            const key = 'variables with non-number values in closure scope chain';
            info[key] = Config_1.default.simplifyCodeSerialization
                ? JSONifyNodeOneLevel(edge.toNode)
                : JSONifyNode(edge.toNode, args, options);
        }
        else if (edge.name_or_index === 'script_or_debug_info') {
            info['script URL'] = edge.toNode.name;
        }
        else {
            const key = filterJSONPropName(edge.name_or_index);
            info[key] = Config_1.default.simplifyCodeSerialization
                ? JSONifyNodeOneLevel(edge.toNode)
                : JSONifyNode(edge.toNode, args, options);
        }
        return null;
    });
    return info;
}
function JSONifyContext(node, args, options) {
    const info = Object.create(null);
    const key = 'variables in defining scope (used by nested closures)';
    const closure_vars = (info[key] = Object.create(null));
    iterateSelectedEdges(node, (edge) => {
        const key = filterJSONPropName(edge.name_or_index);
        if (edge.type === 'context') {
            closure_vars[key] = JSONifyNodeInShort(edge.toNode);
        }
        else if (edge.type === '') {
            info[key] = JSONifyNode(edge.toNode, args, options);
        }
        return null;
    });
    return info;
}
function iterateSelectedEdges(node, callback) {
    let edgesProcessed = 0;
    node.forEachReference((edge) => {
        if (edge.type === 'internal') {
            if (edge.name_or_index === 'map' || edge.is_index) {
                return;
            }
        }
        if (edgesProcessed++ > Config_1.default.maxNumOfEdgesToJSONifyPerNode) {
            return { stop: true };
        }
        return callback(edge);
    });
}
function JSONifyOrdinaryValue(node, args, options) {
    const info = Object.create(null);
    iterateSelectedEdges(node, (edge) => {
        const key = JSONifyEdgeNameAndType(edge);
        const toNode = edge.toNode;
        const toNodeName = toNode.name;
        const edgeName = edge.name_or_index;
        if (edgeName === 'function_data' ||
            edgeName === 'name_or_scope_info' ||
            toNode.type === 'concatenated string' ||
            (toNode.type === 'array' && toNode.edge_count < 200) ||
            toNodeName === 'system / SourcePositionTableWithFrameCache' ||
            toNodeName === 'system / StackTraceFrame' ||
            toNodeName === 'system / StackFrameInfo' ||
            edgeName === 'line_ends' ||
            (edgeName === 'properties' && edge.type === 'internal')) {
            info[key] = JSONifyNode(toNode, args, options);
        }
        else {
            info[key] = JSONifyNodeInShort(toNode);
        }
        return null;
    });
    return info;
}
function reduceOptionDepths(options) {
    const ret = Object.assign({}, options);
    if (options.forceJSONifyDepth != null) {
        const delta = options.forceJSONifyDepth <= 0 ? 0 : -1;
        options.forceJSONifyDepth += delta;
    }
    return ret;
}
function reachedMaxDepth(options) {
    if (options.forceJSONifyDepth == null) {
        return false;
    }
    return options.forceJSONifyDepth <= 0;
}
function JSONifyNode(node, args, inputOptions) {
    if (!node) {
        return {};
    }
    let info;
    const options = reduceOptionDepths(inputOptions);
    // defense against infinite recursion
    if (options.processedNodeId.has(node.id)) {
        info = JSONifyNodeShallow(node);
        return info;
    }
    options.processedNodeId.add(node.id);
    const reachedDepthLimit = reachedMaxDepth(options);
    if (Utils_1.default.isDetachedDOMNode(node) && !reachedDepthLimit) {
        info = JSONifyDetachedHTMLElement(node, args, Object.assign(Object.assign({}, options), EMPTY_JSONIFY_OPTIONS));
    }
    else if (Utils_1.default.isFiberNode(node) && !reachedDepthLimit) {
        info = JSONifyFiberNode(node, args, options);
    }
    else if (Utils_1.default.shouldShowMoreInfo(node)) {
        info = JSONifyNodeOneLevel(node);
    }
    else if (node.type === 'closure' && !reachedDepthLimit) {
        info = JSONifyClosure(node, args, options);
    }
    else if (node.type === 'code' && !reachedDepthLimit) {
        info = JSONifyCode(node, args, options);
    }
    else if (node.name === 'system / Context' && !reachedDepthLimit) {
        info = JSONifyContext(node, args, options);
    }
    else if (node.type === 'number') {
        info = JSONifyNumberNode(node, args, options);
    }
    else if (!reachedDepthLimit) {
        info = JSONifyOrdinaryValue(node, args, options);
    }
    else {
        info = JSONifyNodeInShort(node);
    }
    options.processedNodeId.delete(node.id);
    if (node.location) {
        info[`${filterJSONPropName('allocation location (extra)')}`] = {
            script_id: node.location.script_id,
            line: node.location.line,
            column: node.location.column,
        };
    }
    if (node.dominatorNode) {
        info['dominator id (extra)'] = `@${node.dominatorNode.id}`;
    }
    // use serialization helper to wrap around
    // the JSON node with additional tagging information
    const { serializationHelper } = options;
    return serializationHelper
        ? serializationHelper.createOrMergeWrapper(info, node, args, options)
        : info;
}
function JSONifyTabsOrder() {
    const file = Utils_1.default.getSnapshotSequenceFilePath();
    return fs_1.default.readFileSync(file, 'UTF-8');
}
function shouldHighlight(node) {
    return Utils_1.default.isDetachedDOMNode(node) || Utils_1.default.isDetachedFiberNode(node);
}
function JSONifyPath(path, snapshot, args) {
    if (!path.node) {
        return null;
    }
    const ret = Object.create(null);
    let idx = 0;
    let encounterDetachedNode = false;
    ret['$tabsOrder:' + JSONifyTabsOrder()] = '';
    ret[`${idx++}: ${getNodeNameInJSON(path.node, args)}`] = JSONifyNode(path.node, args, Object.assign(Object.assign({}, EMPTY_JSONIFY_OPTIONS), { processedNodeId: new Set() }));
    let pathItem = path;
    // initialize serialization helper
    const serializationHelper = new SerializationHelper_1.default();
    serializationHelper.setSnapshot(snapshot);
    while (pathItem === null || pathItem === void 0 ? void 0 : pathItem.edge) {
        const edge = pathItem.edge;
        const nextNode = edge.toNode;
        if (!encounterDetachedNode && shouldHighlight(nextNode)) {
            encounterDetachedNode = true;
            nextNode.highlight = true;
        }
        const edgeRetainSize = pathItem.edgeRetainSize;
        ret[`${idx++}: ${getEdgeNameInJSON(edge, edgeRetainSize)}${getNodeNameInJSON(nextNode, args)}`] = JSONifyNode(nextNode, args, Object.assign(Object.assign({}, EMPTY_JSONIFY_OPTIONS), { processedNodeId: new Set(), serializationHelper, forceJSONifyDepth: Config_1.default.maxLevelsOfTraceToJSONify }));
        pathItem = pathItem.next;
    }
    return ret;
}
function JSONifyNodeInShort(node) {
    const wrapper = {
        _isMemLabWrapper: true,
        tags: {
            retainedSize: node.retainedSize,
            id: node.id,
            type: node.type,
        },
        value: getNodeValue(node),
    };
    return wrapper;
}
function getNodeValue(node) {
    var _a;
    if (node.type === 'number') {
        return (_a = Utils_1.default.getNumberNodeValue(node)) !== null && _a !== void 0 ? _a : '[<empty number>]';
    }
    if (Utils_1.default.isStringNode(node)) {
        const str = Utils_1.default.getStringNodeValue(node);
        if (str !== '') {
            return `"${str}"`;
        }
        else {
            return '[<empty string>]';
        }
    }
    if (node.name === 'symbol') {
        const nameNode = Utils_1.default.getToNodeByEdge(node, 'name');
        if (nameNode) {
            return `Symbol(${getNodeTypeShortName(nameNode)})`;
        }
    }
    const id = `@${node.id}`;
    if (Utils_1.default.isFiberNode(node)) {
        return `[${Utils_1.default.extractFiberNodeInfo(node)}] ${id}`;
    }
    if (node.name === 'system / Context') {
        return `[<function scope>] ${id}`;
    }
    if (node.name === 'system / Oddball') {
        let v = node.references[1].toNode.name;
        if (v === 'hole') {
            return 'undefined';
        }
        try {
            v = eval(v);
        }
        catch (_b) {
            if (Config_1.default.verbose) {
                Console_1.default.error(`unknown Oddball: ${v}`);
            }
            return '<unknown Oddball>';
        }
        return v + '';
    }
    if (node.name === 'symbol') {
        const nameNode = Utils_1.default.getToNodeByEdge(node, 'name');
        if (nameNode) {
            return `Symbol(${getNodeValue(nameNode)})`;
        }
    }
    if (Utils_1.default.isFiberNode(node)) {
        return `[${Utils_1.default.extractFiberNodeInfo(node)}]`;
    }
    if (node.name === 'system / Context') {
        return `[<function scope>]`;
    }
    if (node.name === '') {
        return `[<${node.type}>]`;
    }
    return `[${node.name}]`;
}
function getNodeTypeShortName(node) {
    const value = getNodeValue(node);
    if (node.type === 'number' ||
        node.name === 'system / Oddball' ||
        node.name === 'symbol' ||
        node.type === 'concatenated string' ||
        node.type === 'string') {
        return value + '';
    }
    const id = `@${node.id}`;
    return `${value} ${id}`;
}
function stringifyNode(node, str) {
    if (!node ||
        node.type === 'code' ||
        node.type === 'hidden' ||
        node.type === 'array' ||
        node.type === 'native' ||
        node.type === 'closure') {
        return str;
    }
    let info;
    if (node.name === 'system / Context') {
        info = { closure_vars: Object.create(null) };
        for (const edge of node.references) {
            if (edge.type === 'context') {
                const key = filterJSONPropName(edge.name_or_index);
                info.closure_vars[key] =
                    JSONifyNodeInShort(edge.toNode);
            }
        }
    }
    else {
        info = Object.create(null);
        for (const edge of node.references) {
            const key = filterJSONPropName(edge.name_or_index);
            if (edge.type === 'property') {
                info[key] = JSONifyNodeInShort(edge.toNode);
            }
        }
    }
    const nodeJSON = JSON.stringify(info, null, 2);
    str += beautifyJSON(nodeJSON);
    str += '\n';
    return str;
}
function beautifyJSON(nodeJSON) {
    const indent = '    ';
    return nodeJSON
        .split('\n')
        .map(l => {
        // add indentation to each line
        l = indent + l;
        return l;
    })
        .join('\n');
}
function summarizeObjectShape(node, options = {}) {
    const refs = node.references;
    const props = [];
    for (const edge of refs) {
        const name = edge.name_or_index;
        if (edge.type === 'internal') {
            continue;
        }
        if (!Config_1.default.edgeIgnoreSetInShape.has(name)) {
            props.push(name);
        }
    }
    let keys = options.compact ? props.slice(0, 5) : props;
    keys = keys.sort();
    keys = options.color ? keys.map(k => chalk_1.default.green(k)) : keys;
    keys = keys.length < props.length ? keys.concat('...') : keys;
    const sep = options.color ? chalk_1.default.grey(', ') : ', ';
    const beg = options.color ? chalk_1.default.bold('{ ') : '{ ';
    const end = options.color ? chalk_1.default.bold(' }') : ' }';
    return `Object ${beg}${keys.join(sep)}${end}`;
}
// convert a heap object into a string showing its shape
function summarizeNodeShape(node, options = {}) {
    if (Utils_1.default.isStringNode(node)) {
        return options.color ? chalk_1.default.blue.bold('string') : 'string';
    }
    if (!Utils_1.default.isPlainJSObjectNode(node)) {
        const name = node.name;
        return options.color ? chalk_1.default.blue.bold(name) : name;
    }
    return summarizeObjectShape(node, options);
}
function summarizeUnboundedObjects(unboundedObjects, options = {}) {
    const historySeparator = options.color ? chalk_1.default.grey(' > ') : ' > ';
    const prefix = options.color ? chalk_1.default.grey('· ') : '· ';
    const opt = Object.assign({ compact: true }, options);
    return unboundedObjects
        .map(item => {
        var _a;
        const id = options.color ? chalk_1.default.grey(`@${item.id}`) : `@${item.id}`;
        const name = summarizeNodeShape(item.node, opt);
        const formatter = (_a = item.historyNumberFormatter) !== null && _a !== void 0 ? _a : Utils_1.default.getReadableBytes.bind(Utils_1.default);
        return (`${prefix}${name} [${item.type}](${id}):  ` +
            item.history.map(v => formatter(v)).join(historySeparator));
    })
        .join('\n');
}
function summarizeUnboundedObjectsToCSV(unboundedObjects) {
    return unboundedObjects
        .map(item => {
        return `${item.name},${item.id},${item.type},` + item.history.join(',');
    })
        .join('\n');
}
function summarizeTab(tab, color = false) {
    let res = tab.name;
    if (tab.JSHeapUsedSize) {
        const bytes = Utils_1.default.getReadableBytes(tab.JSHeapUsedSize);
        res += color ? `[${chalk_1.default.green(bytes)}]` : ` [${bytes}]`;
    }
    if (tab.type) {
        res += color ? `(${chalk_1.default.green(tab.type)})` : ` (${tab.type})`;
    }
    if (tab.snapshot) {
        res += color ? `[${chalk_1.default.green('s' + tab.idx)}]` : ` [s${tab.idx}]`;
    }
    return res;
}
function summarizeTabsOrder(tabsOrder, options = {}) {
    const tabSep = options.color ? chalk_1.default.grey('>') : '>';
    let res = '';
    for (let i = 0; i < tabsOrder.length; ++i) {
        const tab = tabsOrder[i];
        const sep = i < tabsOrder.length - 1 ? tabSep : '';
        const isCurrentTab = i === options.progress;
        let tabSummaryString = summarizeTab(tab, options.color);
        if (options.color && isCurrentTab) {
            tabSummaryString = chalk_1.default.bold(tabSummaryString);
        }
        const tabSummaryStringWithSeparator = `${tabSummaryString} ${sep} `;
        if (options.color && options.progress !== void 0 && i > options.progress) {
            res += chalk_1.default.dim(tabSummaryStringWithSeparator);
        }
        else {
            res += tabSummaryStringWithSeparator;
        }
    }
    return res;
}
function summarizeNodeName(node, options) {
    const name = getNodeTypeShortName(node);
    let nodeStr = name.split('@')[0].trim();
    if (Utils_1.default.isDetachedDOMNode(node) || Utils_1.default.isDOMNodeIncomplete(node)) {
        nodeStr = Utils_1.default.simplifyTagAttributes(nodeStr);
    }
    return options.color ? chalk_1.default.green(nodeStr) : nodeStr;
}
function summarizeNode(node, options = {}) {
    const nodeRetainSize = Utils_1.default.getReadableBytes(node.retainedSize);
    let nodeImpact = '';
    if (nodeRetainSize) {
        nodeImpact = options.color
            ? chalk_1.default.grey('[') + chalk_1.default.blue.bold(nodeRetainSize) + chalk_1.default.grey(']')
            : `[${nodeRetainSize}]`;
    }
    const name = summarizeNodeName(node, options);
    const type = options.color ? chalk_1.default.grey(`(${node.type})`) : `(${node.type})`;
    const id = options.color ? chalk_1.default.grey(`@${node.id}`) : `@${node.id}`;
    return `${name} ${type} ${id} ${nodeImpact}`;
}
function summarizeEdgeName(edge, options = {}) {
    let name = `${edge.name_or_index}`;
    if (options.abstract) {
        if (edge.is_index) {
            name = '<numeric-element>';
        }
        if (edge.fromNode.type === 'array' &&
            edge.type === 'internal' &&
            !isNaN(parseInt(name, 10))) {
            name = '<array-element>';
        }
    }
    return options.color ? chalk_1.default.white(name) : name;
}
function summarizeEdge(edge, edgeRetainSize, options = {}) {
    const edgeImpact = edgeRetainSize
        ? `[${Utils_1.default.getReadableBytes(edgeRetainSize)}]`
        : '';
    const edgeType = edge.type === 'context' ? 'variable' : edge.type;
    const beg = options.color ? chalk_1.default.grey('--') : '--';
    const end = (options.color ? chalk_1.default.grey('---') : '---') + '>';
    const type = options.color ? chalk_1.default.grey(`(${edgeType})`) : `(${edgeType})`;
    const name = summarizeEdgeName(edge, options);
    return `  ${beg}${name} ${type}${edgeImpact}${end}  `;
}
function summarizePath(pathArg, nodeIdInPaths, snapshot, options = {}) {
    var _a, _b;
    const depth = (_a = options.depth) !== null && _a !== void 0 ? _a : 0;
    if (depth > 5) {
        return '...';
    }
    const excludeKeySet = options.excludeKeySet || new Set();
    let ret = '';
    let p = pathArg;
    let hasWeakMapEdge = false;
    let weakMapKeyObjectId = void 0;
    let weakMapEdgeIdx = void 0;
    while (p) {
        const node = p.node;
        const edge = p.edge;
        if (node) {
            nodeIdInPaths.add(node.id);
            ret += `${summarizeNode(node, options)}\n`;
            // if we need to further expand node properties in the summary
            if (Config_1.default.dumpNodeInfo) {
                ret += stringifyNode(node, ret);
            }
        }
        if (edge) {
            if (Utils_1.default.isWeakMapEdgeToValue(edge)) {
                hasWeakMapEdge = true;
                weakMapEdgeIdx = edge.edgeIndex;
                weakMapKeyObjectId = Utils_1.default.getWeakMapEdgeKeyId(edge);
            }
            ret += edge ? summarizeEdge(edge, (_b = p.edgeRetainSize) !== null && _b !== void 0 ? _b : 0, options) : '';
        }
        p = p.next;
    }
    if (!Config_1.default.chaseWeakMapEdge || !hasWeakMapEdge || depth >= 1000) {
        return ret;
    }
    Console_1.default.midLevel(`depth: ${depth}`);
    // recursively dump the path for the key
    // but first make sure we do not dump the same WeakMap edge again
    if (weakMapKeyObjectId) {
        const keyNode = snapshot.getNodeById(weakMapKeyObjectId);
        excludeKeySet.add(weakMapKeyObjectId);
        const finder = new TraceFinder_1.default();
        let keyNodePath = finder.getPathToGCRoots(snapshot, keyNode);
        if (!keyNodePath) {
            return ret;
        }
        // if the shortest path contains the same WeakMap edge,
        // we need to exclude the edge and re-search the shortest path
        if (weakMapEdgeIdx !== void 0 &&
            Utils_1.default.pathHasEdgeWithIndex(keyNodePath, weakMapEdgeIdx)) {
            finder.annotateShortestPaths(snapshot, excludeKeySet);
            keyNodePath = finder.getPathToGCRoots(snapshot, keyNode);
            if (!keyNodePath) {
                return ret;
            }
        }
        const subPathSummary = summarizePath(keyNodePath, nodeIdInPaths, snapshot, Object.assign(Object.assign({}, options), { depth: depth + 1 }));
        const sep = '------';
        ret += `\n${sep} WeakMap key node path (depth: ${depth}) ${sep}\n`;
        ret += subPathSummary;
    }
    return ret;
}
exports.default = {
    JSONifyPath,
    summarizeEdgeName,
    summarizeNodeName,
    summarizeNodeShape,
    summarizePath,
    summarizeTabsOrder,
    summarizeUnboundedObjects,
    summarizeUnboundedObjectsToCSV,
};
