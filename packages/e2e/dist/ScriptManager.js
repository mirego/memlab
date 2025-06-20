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
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const Script_1 = __importDefault(require("./code-analysis/Script"));
const ScriptRewriteManager_1 = __importDefault(require("./instrumentation/ScriptRewriteManager"));
class ScriptManager {
    constructor() {
        this.fileId = 0;
        this.metaFileWriteTimeout = null;
        this.init();
    }
    init() {
        this.urlToScriptMap = new Map();
        this.scriptInfos = [];
        this.scriptRewriteManager = new ScriptRewriteManager_1.default();
    }
    loadFromFiles() {
        this.init();
        const webSourceMetaFile = core_1.fileManager.getWebSourceMetaFile();
        const webSourceDir = core_1.fileManager.getWebSourceDir();
        if (!fs_1.default.existsSync(webSourceMetaFile) || !fs_1.default.existsSync(webSourceDir)) {
            return false;
        }
        try {
            const metaContent = fs_1.default.readFileSync(webSourceMetaFile, 'UTF-8');
            this.scriptInfos = JSON.parse(metaContent);
            for (const scriptInfo of this.scriptInfos) {
                this.urlToScriptMap.set(scriptInfo.url, scriptInfo);
            }
        }
        catch (_a) {
            return false;
        }
        return true;
    }
    loadCodeForUrl(url) {
        var _a;
        if (!this.urlToScriptMap.has(url)) {
            return null;
        }
        const scriptInfo = this.urlToScriptMap.get(url);
        if (scriptInfo.code) {
            return scriptInfo.code;
        }
        try {
            scriptInfo.code = fs_1.default.readFileSync(scriptInfo.codePath, 'UTF-8');
        }
        catch (_b) {
            // do nothing
        }
        return (_a = scriptInfo.code) !== null && _a !== void 0 ? _a : null;
    }
    getClosureScopeTreeForUrl(url) {
        const code = this.loadCodeForUrl(url);
        if (code == null) {
            return null;
        }
        try {
            const script = new Script_1.default(code);
            return script.getClosureScopeTree();
        }
        catch (_a) {
            // do nothing
        }
        return null;
    }
    rewriteScript(code, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!core_1.config.instrumentJS) {
                return code;
            }
            const newCode = yield this.scriptRewriteManager.rewriteScript(code, options);
            return newCode;
        });
    }
    resourceTypeToSuffix(resourceType) {
        switch (resourceType) {
            case 'Script':
                return '.js';
            case 'Stylesheet':
                return '.css';
            case 'Document':
                return '.html';
            default:
                return '.unknown';
        }
    }
    logScript(url, code, resourceType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.urlToScriptMap.has(url)) {
                return;
            }
            const metaFile = core_1.fileManager.getWebSourceMetaFile();
            const file = path_1.default.join(core_1.fileManager.getWebSourceDir(), `${++this.fileId}${this.resourceTypeToSuffix(resourceType)}`);
            const scriptInfo = {
                url,
                fileId: this.fileId,
                codePath: file,
                resourceType,
            };
            this.urlToScriptMap.set(url, scriptInfo);
            this.scriptInfos.push(scriptInfo);
            fs_1.default.writeFile(file, code, 'UTF-8', () => {
                // async write, do nothing here
            });
            // only write the latest version of the meta file state
            this.debounce(() => {
                fs_1.default.writeFileSync(metaFile, JSON.stringify(this.scriptInfos, void 0, 2), 'UTF-8');
            }, 1000);
        });
    }
    debounce(callback, timeout) {
        if (this.metaFileWriteTimeout) {
            clearTimeout(this.metaFileWriteTimeout);
            this.metaFileWriteTimeout = null;
        }
        this.metaFileWriteTimeout = setTimeout(() => {
            callback();
            this.metaFileWriteTimeout = null;
        }, timeout);
    }
}
exports.default = ScriptManager;
