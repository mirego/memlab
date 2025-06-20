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
const fs_1 = __importDefault(require("fs"));
const worker_threads_1 = require("worker_threads");
const core_1 = require("@memlab/core");
const e2e_1 = require("@memlab/e2e");
if (!worker_threads_1.isMainThread) {
    try {
        displaySourceCode();
    }
    catch (ex) {
        // do nothing
    }
}
function displaySourceCode() {
    return __awaiter(this, void 0, void 0, function* () {
        const scriptManager = new e2e_1.ScriptManager();
        scriptManager.loadFromFiles();
        const { url, closureVars } = worker_threads_1.workerData;
        const code = scriptManager.loadCodeForUrl(url);
        const scope = scriptManager.getClosureScopeTreeForUrl(url);
        if (!code || !scope) {
            return;
        }
        const file = core_1.fileManager.getDebugSourceFile();
        fs_1.default.writeFileSync(file, code, 'UTF-8');
        iterateClosures(scope, closureScope => {
            const varSet = new Set(closureScope.variablesDefined);
            const found = closureVars.reduce((acc, v) => varSet.has(v) && acc, true);
            if (found && closureScope.loc) {
                const startLine = closureScope.loc.start.line;
                core_1.utils.runShell(`code -g ${file}:${startLine}`, { disconnectStdio: true });
            }
            return found;
        });
    });
}
function iterateClosures(scope, callback) {
    if (callback(scope)) {
        return true;
    }
    for (const subScope of scope.nestedClosures) {
        if (iterateClosures(subScope, callback)) {
            return true;
        }
    }
    return false;
}
