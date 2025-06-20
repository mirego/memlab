"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alignTextInBlock = exports.getBlankSpaceString = exports.argsToString = exports.filterAndGetUndefinedArgs = exports.READABLE_TEXT_WIDTH = exports.READABLE_CMD_FLAG_WIDTH = void 0;
const string_width_1 = __importDefault(require("string-width"));
const core_1 = require("@memlab/core");
const OptionConstant_1 = __importDefault(require("../options/lib/OptionConstant"));
const breakableSymbolOnRight = new Set([
    ' ',
    '\t',
    ',',
    '.',
    ':',
    ';',
    '!',
    '?',
    ')',
    ']',
    '}',
    '>',
]);
const breakableSymbolOnLeft = new Set([' ', '\t', '(', '[', '{', '<']);
exports.READABLE_CMD_FLAG_WIDTH = 70;
exports.READABLE_TEXT_WIDTH = 150;
function filterAndGetUndefinedArgs(cliArgs) {
    const ret = Object.create(null);
    const memlabFBOptionNames = new Set(Object.values(Object.assign({}, OptionConstant_1.default.optionNames)));
    for (const optionName of Object.keys(cliArgs)) {
        if (optionName === '_') {
            continue;
        }
        if (memlabFBOptionNames.has(optionName)) {
            continue;
        }
        ret[optionName] = cliArgs[optionName];
    }
    return ret;
}
exports.filterAndGetUndefinedArgs = filterAndGetUndefinedArgs;
function quoteIfNecessary(v) {
    if (typeof v !== 'string') {
        return v;
    }
    // if the string contains any whitespace character
    if (/\s/.test(v)) {
        // escape any existing " character
        v = v.replace(/"/g, '\\"');
        // wrap the string with "
        v = `"${v}"`;
    }
    return v;
}
function argsToString(args) {
    let ret = '';
    for (const optionName of Object.keys(args)) {
        if (optionName === '_') {
            continue;
        }
        const value = args[optionName];
        if (value === true) {
            ret += `--${optionName} `;
        }
        else if (Array.isArray(value)) {
            value.forEach(v => {
                ret += `--${optionName}=${quoteIfNecessary(v)} `;
            });
        }
        else {
            ret += `--${optionName}=${quoteIfNecessary(value)} `;
        }
    }
    return ret.trim();
}
exports.argsToString = argsToString;
function getBlankSpaceString(length) {
    let ret = '';
    for (let i = 0; i < length; ++i) {
        ret += ' ';
    }
    return ret;
}
exports.getBlankSpaceString = getBlankSpaceString;
function alignTextInBlock(text, options) {
    var _a, _b;
    const indent = (_a = options.leftIndent) !== null && _a !== void 0 ? _a : 0;
    const maxLineWidth = Math.min(exports.READABLE_TEXT_WIDTH, (_b = options.lineLength) !== null && _b !== void 0 ? _b : process.stdout.columns);
    if (indent < 0 || maxLineWidth <= 0 || indent >= maxLineWidth) {
        throw core_1.utils.haltOrThrow('invalid indent or maximum line width');
    }
    const indentString = getBlankSpaceString(indent);
    const inputLines = text.split('\n');
    const outputLines = [];
    while (inputLines.length > 0) {
        const line = inputLines.shift();
        // if the current line can fit in cmd row
        if ((0, string_width_1.default)(indentString + line) <= maxLineWidth) {
            outputLines.push(indentString + line);
            continue;
        }
        // otherwise split the current line
        const intendedSplitPoint = maxLineWidth - indent;
        const splitLines = splitIntoReadableSubstrings(line, intendedSplitPoint);
        const [firstLine, restLine] = splitLines;
        outputLines.push(indentString + firstLine);
        inputLines.unshift(restLine);
    }
    return outputLines.join('\n');
}
exports.alignTextInBlock = alignTextInBlock;
function splitIntoReadableSubstrings(text, intendedSplitPoint) {
    if (intendedSplitPoint >= text.length) {
        return [text];
    }
    let splitPoint = intendedSplitPoint;
    while (splitPoint > 0) {
        const ch = text[splitPoint];
        if (breakableSymbolOnLeft.has(ch)) {
            break;
        }
        if (splitPoint - 1 > 0 &&
            breakableSymbolOnRight.has(text[splitPoint - 1])) {
            break;
        }
        --splitPoint;
    }
    if (splitPoint <= 0) {
        splitPoint = intendedSplitPoint;
    }
    // if the second line starts with a ' ',
    // skip the empty space
    const firstLine = text.substring(0, splitPoint);
    let secondLine = text.substring(splitPoint);
    if (secondLine.startsWith(' ')) {
        secondLine = secondLine.substring(1);
    }
    if (secondLine.length === 0) {
        return [firstLine];
    }
    return [firstLine, secondLine];
}
