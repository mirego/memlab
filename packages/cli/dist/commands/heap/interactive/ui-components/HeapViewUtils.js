"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = exports.substringWithColor = exports.getHeapObjectAt = exports.throwIfNodesEmpty = exports.ComponentData = exports.ComponentDataItem = void 0;
const chalk_1 = __importDefault(require("chalk"));
const core_1 = require("@memlab/core");
const lessUsefulEdgeTypeForDebugging = new Set([
    'internal',
    'hidden',
    'shortcut',
    'weak',
]);
const reactEdgeNames = new Set([
    'alternate',
    'firstEffect',
    'lastEffect',
    'concurrentQueues',
    'child',
    'return',
    'sibling',
]);
function isUsefulEdgeForDebugging(edge) {
    if (lessUsefulEdgeTypeForDebugging.has(edge.type)) {
        return false;
    }
    const edgeStr = `${edge.name_or_index}`;
    if (reactEdgeNames.has(edgeStr)) {
        if (core_1.utils.isFiberNode(edge.fromNode) || core_1.utils.isFiberNode(edge.toNode)) {
            return false;
        }
    }
    if (edgeStr.startsWith('__reactProps$')) {
        return false;
    }
    return true;
}
const lessUsefulObjectTypeForDebugging = new Set([
    'native',
    'hidden',
    'array',
    'code',
    'synthetic',
]);
function isUsefulObjectForDebugging(object) {
    if (lessUsefulObjectTypeForDebugging.has(object.type)) {
        return false;
    }
    return !core_1.utils.isFiberNode(object);
}
class ComponentDataItem {
    static getTextForDisplay(data) {
        const content = ComponentDataItem.getTextContent(data);
        if (data.referrerEdge && isUsefulEdgeForDebugging(data.referrerEdge)) {
            return content;
        }
        if (data.referenceEdge && isUsefulEdgeForDebugging(data.referenceEdge)) {
            return content;
        }
        if (data.heapObject && isUsefulObjectForDebugging(data.heapObject)) {
            return content;
        }
        if (!data.referenceEdge && !data.heapObject && !data.referrerEdge) {
            return content;
        }
        return chalk_1.default.grey(content);
    }
    static getHeapObjectTextContent(node) {
        const objectType = chalk_1.default.grey(`(${node.type})`);
        const objectId = chalk_1.default.grey(` @${node.id}`);
        const size = core_1.utils.getReadableBytes(node.retainedSize);
        const sizeInfo = chalk_1.default.grey(' [') + chalk_1.default.bold(chalk_1.default.blue(size)) + chalk_1.default.grey(']');
        const objectTitle = node.isString ? '<string>' : node.name;
        return (chalk_1.default.green('[') +
            (isUsefulObjectForDebugging(node)
                ? chalk_1.default.green(objectTitle)
                : chalk_1.default.bold(chalk_1.default.grey(objectTitle))) +
            chalk_1.default.green(']') +
            objectType +
            objectId +
            sizeInfo);
    }
    static getHeapEdgeTextContent(edge) {
        const arrowPrefix = chalk_1.default.grey('--');
        const arrowSuffix = chalk_1.default.grey('---') + '>';
        const edgeType = chalk_1.default.grey(`(${edge.type})`);
        const edgeName = edge.name_or_index;
        return `${arrowPrefix}${edgeName}${edgeType}${arrowSuffix} `;
    }
    static getTextContent(data) {
        let ret = '';
        if (data.tag) {
            ret += `[${data.tag}] `;
        }
        if (data.stringContent) {
            ret += data.stringContent;
        }
        if (data.referrerEdge) {
            ret += this.getHeapEdgeTextContent(data.referrerEdge);
        }
        if (data.heapObject) {
            ret += this.getHeapObjectTextContent(data.heapObject);
        }
        if (data.referenceEdge) {
            ret += this.getHeapEdgeTextContent(data.referenceEdge);
        }
        return ret === '' ? chalk_1.default.grey('<undefined>') : ret;
    }
}
exports.ComponentDataItem = ComponentDataItem;
class ComponentData {
    constructor() {
        this.selectedIdx = -1;
        this.items = [];
    }
}
exports.ComponentData = ComponentData;
function throwIfNodesEmpty(nodes) {
    if (nodes.length === 0) {
        throw core_1.utils.haltOrThrow('no heap node specified');
    }
    for (let i = 0; i < nodes.length; ++i) {
        if (!nodes[i].heapObject) {
            throw core_1.utils.haltOrThrow('heap node missing in ComponentDataItem[]');
        }
    }
    return true;
}
exports.throwIfNodesEmpty = throwIfNodesEmpty;
function getHeapObjectAt(nodes, index) {
    throwIfNodesEmpty(nodes);
    if (index < 0 || index >= nodes.length) {
        throw core_1.utils.haltOrThrow('index is outside of nodes range');
    }
    return nodes[index].heapObject;
}
exports.getHeapObjectAt = getHeapObjectAt;
// eslint-disable-next-line no-control-regex
const colorBegin = /^\u001b\[(\d+)m/;
// eslint-disable-next-line no-control-regex
const colorEnd = /^\u001b\](\d+)m/;
function stripColorCodeIfAny(input) {
    const matchBegin = input.match(colorBegin);
    const matchEnd = input.match(colorEnd);
    const match = matchBegin || matchEnd;
    if (!match) {
        return { str: input, code: -1, isBegin: false };
    }
    const isBegin = !!matchBegin;
    const code = parseInt(match[1], 10);
    const str = input.substring(match[0].length);
    return { str, code, isBegin };
}
function toColorControlChar(code, isBegin) {
    const colorSpecialChar = '\u001b';
    return colorSpecialChar + (isBegin ? '[' : ']') + code + 'm';
}
function substringWithColor(input, begin) {
    const codeQueue = [];
    let curIndex = 0;
    let curStr = input;
    while (curIndex < begin) {
        // enqueue all control characters
        let strip;
        do {
            strip = stripColorCodeIfAny(curStr);
            curStr = strip.str;
            if (strip.code >= 0) {
                // pop if control begin meets control ends
                const last = codeQueue[codeQueue.length - 1];
                if (!last ||
                    last.code !== strip.code ||
                    strip.isBegin === true ||
                    last.isBegin === false) {
                    codeQueue.push({ code: strip.code, isBegin: strip.isBegin });
                }
                else {
                    codeQueue.pop();
                }
            }
        } while (strip.code >= 0);
        // strip one actual content character
        curStr = curStr.substring(1);
        ++curIndex;
    }
    // prepend control characters
    while (codeQueue.length > 0) {
        const last = codeQueue.pop();
        if (last) {
            curStr = toColorControlChar(last === null || last === void 0 ? void 0 : last.code, last === null || last === void 0 ? void 0 : last.isBegin) + curStr;
        }
    }
    return curStr;
}
exports.substringWithColor = substringWithColor;
function debounce(timeInMs) {
    let id = null;
    return (callback) => {
        if (id) {
            clearTimeout(id);
        }
        id = setTimeout(() => {
            callback();
            id = null;
        }, timeInMs);
    };
}
exports.debounce = debounce;
