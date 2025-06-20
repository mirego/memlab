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
const Console_1 = __importDefault(require("./Console"));
const child_process_1 = __importDefault(require("child_process"));
const os_1 = __importDefault(require("os"));
const Utils_1 = __importDefault(require("./Utils"));
const DEFAULT_PROCESS_LIMIT = 1;
class ProcessManager {
    constructor() {
        this.procLimit = DEFAULT_PROCESS_LIMIT;
        this.nProc = 0;
    }
    // 1. periodically check for available free process
    // 2. start commands in process until all tasks are completed
    start(nextCommand, options = {}) {
        this.init(options);
        const timer = setInterval(() => {
            if (!this.hasFreeProcess()) {
                return;
            }
            const cmd = nextCommand();
            // if next command is empty, stop the loop
            if (!cmd) {
                return clearInterval(timer);
            }
            this.runInProcess(...cmd);
        }, 100);
    }
    init(options = {}) {
        this.procLimit = options.processLimit
            ? options.processLimit
            : (os_1.default.cpus().length / 9) | 0;
    }
    hasFreeProcess() {
        return this.nProc < this.procLimit;
    }
    freeProcess() {
        this.nProc--;
    }
    runInProcess(cmd, args, options = {}) {
        if (options.msg) {
            Console_1.default.lowLevel(options.msg);
        }
        const str = Utils_1.default.convertCLIArgsToReadableCommand([cmd, ...args]);
        this.nProc++;
        const proc = child_process_1.default.spawn(cmd, args);
        proc.on('exit', code => {
            Console_1.default.lowLevel(`done: ${str}`);
            if (code !== 0) {
                Console_1.default.error(`fail: ${str}`);
            }
            this.freeProcess();
        });
    }
}
exports.default = ProcessManager;
