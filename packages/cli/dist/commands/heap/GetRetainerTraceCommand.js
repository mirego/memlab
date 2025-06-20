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
const fs_extra_1 = __importDefault(require("fs-extra"));
const BaseCommand_1 = __importStar(require("../../BaseCommand"));
const core_1 = require("@memlab/core");
const SnapshotFileOption_1 = __importDefault(require("../../options/heap/SnapshotFileOption"));
const JSEngineOption_1 = __importDefault(require("../../options/heap/JSEngineOption"));
const HeapNodeIdOption_1 = __importDefault(require("../../options/heap/HeapNodeIdOption"));
const SnapshotDirectoryOption_1 = __importDefault(require("../../options/heap/SnapshotDirectoryOption"));
const core_2 = require("@memlab/core");
const HeapParserDictFastStoreSizeOption_1 = __importDefault(require("../../options/heap/HeapParserDictFastStoreSizeOption"));
function calculateRetainerTrace() {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshotPath = core_1.utils.getSingleSnapshotFileForAnalysis();
        yield core_1.analysis.focus({ file: snapshotPath });
    });
}
class GetRetainerTraceCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'trace';
    }
    getDescription() {
        return 'report retainer trace of a specific node, use with --nodeId';
    }
    getCategory() {
        return BaseCommand_1.CommandCategory.COMMON;
    }
    getExamples() {
        return [
            '--node-id=<HEAP_OBJECT_ID>',
            '--node-id=@3123123',
            '--node-id=128127',
        ];
    }
    getOptions() {
        return [
            new SnapshotFileOption_1.default(),
            new SnapshotDirectoryOption_1.default(),
            new JSEngineOption_1.default(),
            new HeapNodeIdOption_1.default().required(),
            new HeapParserDictFastStoreSizeOption_1.default(),
        ];
    }
    run(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const workDir = (_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.workDir;
            const reportOutDir = core_2.fileManager.getReportOutDir({ workDir });
            fs_extra_1.default.emptyDirSync(reportOutDir);
            yield calculateRetainerTrace();
        });
    }
}
exports.default = GetRetainerTraceCommand;
