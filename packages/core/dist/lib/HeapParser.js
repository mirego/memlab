/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @lightSyntaxTransform
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
const Config_1 = __importDefault(require("./Config"));
const Console_1 = __importDefault(require("./Console"));
const StringLoader_1 = __importDefault(require("./StringLoader"));
const HeapSnapshot_1 = __importDefault(require("./heap-data/HeapSnapshot"));
// ----------- utility and parsing functions -----------
function getSnapshotMetaData(content) {
    function getSignatureIndex(signature) {
        const idx = content.indexOf(signature);
        if (idx < 0) {
            throw 'heap parsing: meta data parsing error';
        }
        return idx;
    }
    const startSignature = '"snapshot":';
    const startIdx = getSignatureIndex(startSignature) + startSignature.length;
    const endSignature = '"nodes":';
    const endIdx = getSignatureIndex(endSignature);
    const metaContent = content.slice(startIdx, endIdx).trim().slice(0, -1);
    return JSON.parse(metaContent);
}
const nums = Object.create(null);
for (let i = 0; i < 10; i++) {
    nums[`${i}`] = i;
}
function loadSnapshotMetaDataFromFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield StringLoader_1.default.readFile(file, {
            startSignature: '"snapshot":',
            endSignature: '"nodes":',
            inclusive: true,
        });
        return getSnapshotMetaData(content);
    });
}
function getNodeIdsFromFile(file, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshotInfo = yield loadSnapshotMetaDataFromFile(file);
        const nodes = yield StringLoader_1.default.readFileAndExtractTypedArray(file, 'nodes');
        const ids = new Set();
        const nodeFields = snapshotInfo.meta.node_fields;
        const nodeFieldCount = nodeFields.length;
        const idOffset = nodeFields.indexOf('id');
        let valueIndex = 0;
        while (valueIndex < nodes.length) {
            ids.add(nodes[valueIndex + idOffset]);
            valueIndex += nodeFieldCount;
        }
        return ids;
    });
}
function parseFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const [nodes, edges, locations, content] = yield Promise.all([
            StringLoader_1.default.readFileAndExtractTypedArray(file, 'nodes'),
            StringLoader_1.default.readFileAndExtractTypedArray(file, 'edges'),
            StringLoader_1.default.readFileAndExtractTypedArray(file, 'locations'),
            StringLoader_1.default.readFileAndExcludeTypedArray(file, [
                'nodes',
                'edges',
                'locations',
            ]),
        ]);
        const snapshot = JSON.parse(content);
        snapshot.nodes = nodes;
        snapshot.edges = edges;
        snapshot.locations = locations;
        return snapshot;
    });
}
// auto detect and set JS snapshot's engine type
function identifyAndSetEngine(snapshot) {
    if (Config_1.default.specifiedEngine) {
        if (Config_1.default.verbose) {
            Console_1.default.lowLevel(`JS snapshot engine is manually set to be ${Config_1.default.jsEngine}`);
        }
        return; // skip if engine type is manually set
    }
    Console_1.default.overwrite('identifying snapshot engine...');
    let engine = 'V8';
    snapshot.nodes.forEach((node) => {
        if (node.type === 'object' && node.name.startsWith('Object(')) {
            engine = 'hermes';
            return false;
        }
    });
    if (Config_1.default.verbose) {
        Console_1.default.lowLevel(`detect and set JS snapshot engine: ${engine}`);
    }
    Config_1.default.jsEngine = engine;
}
function parse(file, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshot = yield parseFile(file);
        const ret = new HeapSnapshot_1.default(snapshot, options);
        identifyAndSetEngine(ret);
        return ret;
    });
}
exports.default = {
    getNodeIdsFromFile,
    parse,
};
