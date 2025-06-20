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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const BaseCommand_1 = __importStar(require("../BaseCommand"));
const CheckLeakCommand_1 = __importDefault(require("./heap/CheckLeakCommand"));
const InitDirectoryCommand_1 = __importDefault(require("./InitDirectoryCommand"));
const TakeSnapshotCommand_1 = __importDefault(require("./snapshot/TakeSnapshotCommand"));
const SetWorkingDirectoryOption_1 = __importDefault(require("../options/SetWorkingDirectoryOption"));
const AppOption_1 = __importDefault(require("../options/e2e/AppOption"));
const InteractionOption_1 = __importDefault(require("../options/e2e/InteractionOption"));
const SkipSnapshotOption_1 = __importDefault(require("../options/e2e/SkipSnapshotOption"));
const RunningModeOption_1 = __importDefault(require("../options/e2e/RunningModeOption"));
const BaselineFileOption_1 = __importDefault(require("../options/heap/BaselineFileOption"));
const TargetFileOption_1 = __importDefault(require("../options/heap/TargetFileOption"));
const FinalFileOption_1 = __importDefault(require("../options/heap/FinalFileOption"));
const SnapshotDirectoryOption_1 = __importDefault(require("../options/heap/SnapshotDirectoryOption"));
const JSEngineOption_1 = __importDefault(require("../options/heap/JSEngineOption"));
const HeapParserDictFastStoreSizeOption_1 = __importDefault(require("../options/heap/HeapParserDictFastStoreSizeOption"));
class MemLabRunCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'run';
    }
    getDescription() {
        return 'find memory leaks in web apps';
    }
    getExamples() {
        return [
            '--scenario <TEST_SCENARIO_FILE>',
            '--scenario /tmp/test-scenario.js',
            '--scenario /tmp/test-scenario.js --work-dir /tmp/test-1/',
        ];
    }
    getPrerequisites() {
        return [
            new InitDirectoryCommand_1.default(),
            new TakeSnapshotCommand_1.default(),
            new CheckLeakCommand_1.default(),
        ];
    }
    getOptions() {
        return [new SetWorkingDirectoryOption_1.default()];
    }
    getExcludedOptions() {
        return [
            new AppOption_1.default(),
            new InteractionOption_1.default(),
            new SkipSnapshotOption_1.default(),
            new RunningModeOption_1.default(),
            new BaselineFileOption_1.default(),
            new TargetFileOption_1.default(),
            new FinalFileOption_1.default(),
            new SnapshotDirectoryOption_1.default(),
            new JSEngineOption_1.default(),
            new HeapParserDictFastStoreSizeOption_1.default(),
        ];
    }
    getCategory() {
        return BaseCommand_1.CommandCategory.COMMON;
    }
    run(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // move leaks.txt file
            const workDir = (_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.workDir;
            const outDir = core_1.fileManager.getDataOutDir({ workDir });
            const leakSrcFile = path_1.default.join(outDir, 'leaks.txt');
            const content = fs_1.default.readFileSync(leakSrcFile, 'UTF-8');
            const curDataDir = core_1.fileManager.getCurDataDir({ workDir });
            const leakDestFile = path_1.default.join(curDataDir, 'leaks.txt');
            fs_1.default.writeFileSync(leakDestFile, content, 'UTF-8');
        });
    }
}
exports.default = MemLabRunCommand;
