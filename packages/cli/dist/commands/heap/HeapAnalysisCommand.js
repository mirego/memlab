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
const core_1 = require("@memlab/core");
const BaseCommand_1 = __importStar(require("../../BaseCommand"));
const heap_analysis_1 = require("@memlab/heap-analysis");
const HeapAnalysisSubCommandWrapper_1 = __importDefault(require("./HeapAnalysisSubCommandWrapper"));
const HelperCommand_1 = __importDefault(require("../helper/HelperCommand"));
const InitDirectoryCommand_1 = __importDefault(require("../InitDirectoryCommand"));
const HeapAnalysisPluginOption_1 = __importDefault(require("../../options/heap/HeapAnalysisPluginOption"));
const HeapParserDictFastStoreSizeOption_1 = __importDefault(require("../../options/heap/HeapParserDictFastStoreSizeOption"));
class RunHeapAnalysisCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'analyze';
    }
    getDescription() {
        return 'Run heap analysis on heap snapshots.\n';
    }
    getCategory() {
        return BaseCommand_1.CommandCategory.COMMON;
    }
    getPrerequisites() {
        return [new InitDirectoryCommand_1.default()];
    }
    getOptions() {
        return [
            new HeapAnalysisPluginOption_1.default(),
            new HeapParserDictFastStoreSizeOption_1.default(),
        ];
    }
    getSubCommands() {
        const analyses = [...heap_analysis_1.heapAnalysisLoader.loadAllAnalysis().values()];
        return analyses.map((analysis) => {
            const ret = new HeapAnalysisSubCommandWrapper_1.default(analysis);
            // TODO: move this logic to command dispatcher
            ret.setParentCommand(this);
            return ret;
        });
    }
    getExamples() {
        return ['<PLUGIN_NAME> [PLUGIN_OPTIONS]'];
    }
    errorIfNoSubCommand(args, analysisMap) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args && args._.length >= 2 && analysisMap.has(args._[1])) {
                return;
            }
            const helper = new HelperCommand_1.default();
            const modules = new Map();
            for (const subCommand of this.getSubCommands()) {
                modules.set(subCommand.getCommandName(), subCommand);
            }
            const errMsg = args && args._.length < 2
                ? `\n  Heap analysis plugin name missing\n`
                : `\n  Invalid command \`memlab ${this.getCommandName()} ${args === null || args === void 0 ? void 0 : args._[1]}\`\n`;
            core_1.info.error(errMsg);
            yield helper.run({ cliArgs: args, modules, command: this });
            core_1.utils.haltOrThrow(errMsg, { printErrorBeforeHalting: false });
        });
    }
    run(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // process command line arguments and load analysis modules
            const args = options.cliArgs;
            let plugin = (_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.heapAnalysisPlugin;
            if (plugin != null) {
                plugin = `${plugin}`;
            }
            const analysisMap = heap_analysis_1.heapAnalysisLoader.loadAllAnalysis({
                heapAnalysisPlugin: plugin,
                errorWhenPluginFailed: true,
            });
            yield this.errorIfNoSubCommand(args, analysisMap);
        });
    }
}
exports.default = RunHeapAnalysisCommand;
