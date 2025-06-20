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
const Serializer_1 = __importDefault(require("../lib/Serializer"));
const Utils_1 = __importDefault(require("../lib/Utils"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Console_1 = __importDefault(require("../lib/Console"));
class LeakTraceDetailsLogger {
    _wrapPathJSONInLoader(jsonContent) {
        return `window.gcPath = ${jsonContent};`;
    }
    setTraceFileEmpty(filepath) {
        const content = this._wrapPathJSONInLoader('');
        fs_1.default.writeFile(filepath, content, 'UTF-8', () => {
            // noop
        });
    }
    logTrace(leakedIdSet, snapshot, nodeIdsInSnapshots, trace, filepath) {
        const options = { leakedIdSet, nodeIdsInSnapshots };
        const gcTrace = Serializer_1.default.JSONifyPath(trace, snapshot, options);
        try {
            const traceJSON = JSON.stringify(gcTrace, null, 2);
            const content = this._wrapPathJSONInLoader(traceJSON);
            fs_1.default.writeFile(filepath, content, 'UTF-8', () => {
                // noop
            });
        }
        catch (ex) {
            const error = Utils_1.default.getError(ex);
            if (error.message.includes('Invalid string length')) {
                Console_1.default.warning('Trace details JSON not saved because it exceeded the size limit.');
            }
            else {
                Utils_1.default.haltOrThrow(error);
            }
        }
        return gcTrace;
    }
    logTraces(leakedIdSet, snapshot, nodeIdsInSnapshots, traces, outDir) {
        const ret = [];
        for (const trace of traces) {
            const nodeId = Utils_1.default.getLastNodeId(trace);
            const file = path_1.default.join(outDir, `@${nodeId}.json`);
            const jsonTrace = this.logTrace(leakedIdSet, snapshot, nodeIdsInSnapshots, trace, file);
            if (jsonTrace != null) {
                ret.push(jsonTrace);
            }
        }
        return ret;
    }
}
exports.default = new LeakTraceDetailsLogger();
