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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
class HeapAnalysisLoader {
    constructor() {
        this.modules = new Map();
    }
    loadAllAnalysis(options = {}) {
        if (this.modules.size === 0) {
            // auto load all analysis modules
            this.modules = new Map();
            this.registerAnalyses(options);
        }
        return this.modules;
    }
    registerAnalyses(options = {}) {
        const modulesDir = path_1.default.resolve(__dirname, 'plugins');
        this.registerAnalysesFromDir(modulesDir);
        // register external analysis
        if (options.heapAnalysisPlugin != null) {
            const file = path_1.default.resolve(options.heapAnalysisPlugin);
            this.registerAnalysisFromFile(file, options);
        }
    }
    registerAnalysesFromDir(modulesDir, options = {}) {
        const moduleFiles = fs_1.default.readdirSync(modulesDir);
        for (const moduleFile of moduleFiles) {
            const modulePath = path_1.default.join(modulesDir, moduleFile);
            this.registerAnalysisFromFile(modulePath, options);
        }
    }
    registerAnalysisFromFile(modulePath, options = {}) {
        // recursively import modules from subdirectories
        if (fs_1.default.lstatSync(modulePath).isDirectory()) {
            this.registerAnalysesFromDir(modulePath, options);
            return;
        }
        // only import modules files ends with with Analysis.js
        if (!modulePath.endsWith('Analysis.js')) {
            if (options.errorWhenPluginFailed) {
                const fileName = path_1.default.basename(modulePath);
                throw core_1.utils.haltOrThrow(`Analysis plugin file (${fileName}) must end with \`Analysis.js\``);
            }
            return;
        }
        let commandName = null;
        let moduleInstance = null;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const module = require(modulePath);
            const moduleConstructor = typeof module.default === 'function' ? module.default : module;
            moduleInstance = new moduleConstructor();
            commandName = moduleInstance.getCommandName();
        }
        catch (err) {
            core_1.info.error('Failed to load analysis plugin: ' + modulePath);
            throw core_1.utils.haltOrThrow(core_1.utils.getError(err));
        }
        if (commandName != null) {
            if (this.modules.has(commandName)) {
                core_1.utils.haltOrThrow(`heap command ${commandName} is already registered`);
            }
            this.modules.set(commandName, moduleInstance);
        }
    }
}
exports.default = new HeapAnalysisLoader();
