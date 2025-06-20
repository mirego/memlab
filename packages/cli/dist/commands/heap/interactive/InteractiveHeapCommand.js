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
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const minimist_1 = __importDefault(require("minimist"));
const BaseCommand_1 = __importStar(require("../../../BaseCommand"));
const core_2 = require("@memlab/core");
const SnapshotFileOption_1 = __importDefault(require("../../../options/heap/SnapshotFileOption"));
const JSEngineOption_1 = __importDefault(require("../../../options/heap/JSEngineOption"));
const core_3 = require("@memlab/core");
const heap_analysis_1 = require("@memlab/heap-analysis");
const Dispatcher_1 = require("../../../Dispatcher");
const InteractiveCommandLoader_1 = __importDefault(require("./InteractiveCommandLoader"));
const HeapParserDictFastStoreSizeOption_1 = __importDefault(require("../../../options/heap/HeapParserDictFastStoreSizeOption"));
class InteractiveHeapCommand extends BaseCommand_1.default {
    constructor() {
        super(...arguments);
        this.exitAttempt = 0;
    }
    getCommandName() {
        return 'heap';
    }
    getDescription() {
        return 'interactive command to explore a single heap snapshot';
    }
    getCategory() {
        return BaseCommand_1.CommandCategory.COMMON;
    }
    getExamples() {
        return ['--snapshot <HEAP_SNAPSHOT_FILE>'];
    }
    getOptions() {
        return [
            new SnapshotFileOption_1.default(),
            new JSEngineOption_1.default(),
            new HeapParserDictFastStoreSizeOption_1.default(),
        ];
    }
    printPromptInfo() {
        core_2.info.topLevel(`Heap Snapshot Loaded: ${chalk_1.default.grey(heap_analysis_1.heapConfig.currentHeapFile)}`);
    }
    quit(exitCode = 1) {
        this.exitAttempt = 0;
        core_2.info.topLevel('');
        process.exit(exitCode);
    }
    initPrompt() {
        return readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk_1.default.gray('[') + chalk_1.default.green('memlab') + chalk_1.default.gray(']') + '$ ',
        });
    }
    setupInterruptHandle(rl) {
        // exit when user type Ctrl + C
        rl.on('SIGINT', () => {
            if (this.exitAttempt > 0) {
                this.quit();
            }
            this.exitAttempt++;
            setTimeout(() => {
                this.exitAttempt--;
            }, 5000);
            core_2.info.topLevel('Type Ctrl + C again to exit');
            rl.prompt();
        });
    }
    setupCommandHandle(rl) {
        // the interactive cli only supports a subset of memlab commands
        const dispatcher = new Dispatcher_1.CommandDispatcher({
            commandLoader: new InteractiveCommandLoader_1.default(),
        });
        // do not halt execution when running the interactive command
        core_2.config.errorHandling = core_1.ErrorHandling.Throw;
        // start interpreting interactive commands
        rl.on('line', (line) => __awaiter(this, void 0, void 0, function* () {
            let command = '';
            try {
                // "memlab <command>" -> "<command>"
                command = line.trim().startsWith('memlab ')
                    ? line.substring('memlab '.length).trim()
                    : line.trim();
                if (command === 'exit' || command === 'quit') {
                    this.quit(0);
                }
                if (command.length > 0) {
                    const args = command.match(/("[^"]+")|('[^']+')|(\S+)/g);
                    const parsedArgs = (0, minimist_1.default)(args);
                    yield dispatcher.dispatch(parsedArgs);
                }
            }
            catch (ex) {
                const error = core_2.utils.getError(ex);
                core_2.info.topLevel(error.message);
            }
            if (command.length > 0) {
                core_2.info.topLevel('');
                this.printPromptInfo();
            }
            rl.prompt();
        }));
    }
    startInteractiveCLI() {
        // set up the interactive prompt
        const rl = this.initPrompt();
        this.setupInterruptHandle(rl);
        this.setupCommandHandle(rl);
        // start prompt
        this.printPromptInfo();
        rl.prompt();
    }
    run(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const workDir = (_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.workDir;
            const reportOutDir = core_3.fileManager.getReportOutDir({ workDir });
            fs_extra_1.default.emptyDirSync(reportOutDir);
            // load single heap snapshot
            heap_analysis_1.heapConfig.isCliInteractiveMode = true;
            yield (0, heap_analysis_1.loadHeapSnapshot)({ args: options.cliArgs });
            this.startInteractiveCLI();
        });
    }
}
exports.default = InteractiveHeapCommand;
