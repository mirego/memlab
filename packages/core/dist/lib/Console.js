/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const string_width_1 = __importDefault(require("string-width"));
const Config_1 = require("./Config");
const TABLE_MAX_WIDTH = 50;
const LOG_BUFFER_LENGTH = 100;
const prevLine = '\x1b[F';
const eraseLine = '\x1b[K';
const barComplete = chalk_1.default.green('\u2588');
const barIncomplete = chalk_1.default.grey('\u2591');
function formatTableArg(arg) {
    if (!Array.isArray(arg)) {
        return arg;
    }
    arg.forEach(obj => {
        if (typeof obj !== 'object') {
            return;
        }
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (typeof value !== 'string') {
                continue;
            }
            if (value.length <= TABLE_MAX_WIDTH) {
                continue;
            }
            obj[key] = value.substring(0, TABLE_MAX_WIDTH) + '...';
        }
    });
}
function registerExitCleanup(inst, exitHandler) {
    const p = process;
    // normal exit
    p.on('exit', exitHandler.bind(null, { cleanup: true }));
    // ctrl + c event
    p.on('SIGINT', exitHandler.bind(null, { exit: true }));
    // kill pid
    p.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
    p.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
}
class MemLabConsole {
    constructor() {
        this.config = {};
        this.log = [];
        this.logFileSet = new Set();
        this.styles = {
            top: (msg) => msg,
            high: chalk_1.default.dim.bind(chalk_1.default),
            mid: chalk_1.default.yellow.bind(chalk_1.default),
            low: chalk_1.default.grey.bind(chalk_1.default),
            success: chalk_1.default.green.bind(chalk_1.default),
            error: chalk_1.default.red.bind(chalk_1.default),
            warning: chalk_1.default.yellow.bind(chalk_1.default),
        };
        this.annotations = {
            STACK_TRACE: 'stack-trace',
        };
        this.sections = {
            dict: Object.create(null),
            arr: [{ name: 'header', msgs: [] }],
        };
        this.init();
    }
    static getInstance() {
        if (MemLabConsole.singleton) {
            return MemLabConsole.singleton;
        }
        const inst = new MemLabConsole();
        MemLabConsole.singleton = inst;
        const exitHandler = (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _options, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _exitCode) => {
            inst.flushLog({ sync: true });
            inst.clearPrevOverwriteMsg();
        };
        registerExitCleanup(inst, exitHandler);
        return inst;
    }
    get isTextOutput() {
        return this.config.outputFormat === Config_1.OutputFormat.Text;
    }
    get outStream() {
        return this.isTextOutput ? process.stdout : process.stderr;
    }
    style(msg, name) {
        if (Object.prototype.hasOwnProperty.call(this.styles, name)) {
            return this.styles[name](msg);
        }
        return this.styles.low(msg);
    }
    init() {
        this.beginSection('main-section-DO-NOT-USE');
    }
    getLastSection() {
        const list = this.sections.arr;
        return list[list.length - 1];
    }
    getLastMsg() {
        const lastSection = this.getLastSection();
        if (!lastSection || !lastSection.msgs) {
            return null;
        }
        const msgs = lastSection.msgs;
        return msgs.length === 0 ? null : msgs[msgs.length - 1];
    }
    logMsg(msg) {
        if (typeof msg !== 'string') {
            return;
        }
        // remove control characters
        const lines = msg.split('\n').map(line => line
            // eslint-disable-next-line no-control-regex
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\[\d{1,3}m/g, ''));
        this.log.push(...lines);
        this.tryFlush();
    }
    tryFlush() {
        if (this.log.length > LOG_BUFFER_LENGTH) {
            this.flushLog({ sync: true });
        }
    }
    flushLog(options = {}) {
        const str = this.log.join('\n');
        this.log = [];
        if (str.length === 0) {
            return;
        }
        // synchronous logging
        if (options.sync) {
            for (const logFile of this.logFileSet) {
                try {
                    fs_1.default.appendFileSync(logFile, str + '\n', 'UTF-8');
                }
                catch (_a) {
                    // fail silently
                }
            }
        }
        else {
            // async logging
            const emptyCallback = () => {
                // no op
            };
            for (const logFile of this.logFileSet) {
                try {
                    fs_1.default.appendFile(logFile, str + '\n', 'UTF-8', emptyCallback);
                }
                catch (_b) {
                    // fail silently
                }
            }
        }
    }
    pushMsg(msg, options = {}) {
        if (this.sections.arr.length === 0) {
            return;
        }
        // calculate each line's visible width
        const lines = msg.split('\n').map(line => (0, string_width_1.default)(line));
        const section = this.getLastSection();
        section === null || section === void 0 ? void 0 : section.msgs.push({ lines, options });
    }
    clearPrevMsgInLastSection() {
        const lastSection = this.getLastSection();
        this.clearPrevMsgInSection(lastSection);
    }
    clearPrevMsgInSection(section) {
        var _a;
        if (this.config.isContinuousTest) {
            return;
        }
        if (!section || section.msgs.length === 0) {
            return;
        }
        if (!this.config.muteConsole) {
            this.outStream.write(eraseLine);
        }
        const msg = section.msgs.pop();
        if (!msg) {
            return;
        }
        const lines = msg.lines;
        while (lines.length > 0) {
            const line = (_a = lines.pop()) !== null && _a !== void 0 ? _a : 0;
            const width = this.outStream.columns;
            let n = line === 0 ? 1 : Math.ceil(line / width);
            if (!this.config.muteConsole && !this.config.isTest) {
                while (n-- > 0) {
                    this.outStream.write(prevLine + eraseLine);
                }
            }
        }
    }
    clearPrevSection() {
        var _a;
        if (this.config.isContinuousTest) {
            return;
        }
        const lastSection = this.getLastSection();
        if (!lastSection) {
            return;
        }
        while (((_a = lastSection === null || lastSection === void 0 ? void 0 : lastSection.msgs) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            this.clearPrevMsgInSection(lastSection);
        }
        this.sections.arr.pop();
        delete this.sections.dict[lastSection.name];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldBeConcise(_msgType) {
        if (!this.config || !this.config.runningMode) {
            return false;
        }
        return this.config.runningMode.shouldUseConciseConsole();
    }
    clearPrevOverwriteMsg() {
        var _a;
        if (this.config.isContinuousTest) {
            return;
        }
        const lastMsg = this.getLastMsg();
        if (!lastMsg || !((_a = lastMsg.options) === null || _a === void 0 ? void 0 : _a.isOverwrite)) {
            return;
        }
        this.clearPrevMsgInLastSection();
    }
    printStr(msg, options = {}) {
        this.pushMsg(msg, options);
        if (this.config.isTest) {
            return;
        }
        if (this.config.isContinuousTest || !this.config.muteConsole) {
            if (this.isTextOutput) {
                console.log(msg);
            }
            else {
                this.outStream.write(msg);
                this.outStream.write('\n');
            }
        }
    }
    writeOutput(output) {
        var _a;
        this.log.push(output);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteOutput) {
            return;
        }
        process.stdout.write(output);
        this.tryFlush();
    }
    registerLogFile(logFile) {
        this.flushLog({ sync: true });
        this.logFileSet.add(path_1.default.resolve(logFile));
    }
    unregisterLogFile(logFile) {
        this.flushLog({ sync: true });
        this.logFileSet.delete(path_1.default.resolve(logFile));
    }
    beginSection(name) {
        if (this.config.isContinuousTest) {
            return;
        }
        this.clearPrevOverwriteMsg();
        if (this.sections.dict[name]) {
            this.endSection(name);
        }
        const section = { name, msgs: [] };
        this.sections.dict[name] = section;
        this.sections.arr.push(section);
    }
    endSection(name) {
        if (this.config.isContinuousTest || this.sections.arr.length === 0) {
            return;
        }
        if (!this.sections.dict[name]) {
            return;
        }
        let section;
        do {
            section = this.getLastSection();
            this.clearPrevSection();
        } while ((section === null || section === void 0 ? void 0 : section.name) !== name);
    }
    setConfig(config) {
        this.config = config;
    }
    table(...args) {
        var _a;
        if (this.shouldBeConcise('table') ||
            this.config.isTest ||
            this.config.muteConsole ||
            ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteTable)) {
            return;
        }
        this.clearPrevOverwriteMsg();
        // make sure the values are not too big
        formatTableArg(args[0]);
        if (args[0].length === 0) {
            return;
        }
        console.table(...args);
    }
    trace() {
        var _a;
        if (this.config.isTest ||
            this.config.muteConsole ||
            ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteTrace)) {
            return;
        }
        console.trace();
    }
    topLevel(msg) {
        var _a;
        if (this.shouldBeConcise('topLevel')) {
            return this.overwrite(msg);
        }
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteTopLevel) {
            return;
        }
        this.clearPrevOverwriteMsg();
        this.printStr(this.style(msg, 'top'));
    }
    highLevel(msg) {
        var _a;
        if (this.shouldBeConcise('highLevel')) {
            return this.overwrite(msg);
        }
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteHighLevel) {
            return;
        }
        this.clearPrevOverwriteMsg();
        this.printStr(this.style(msg, 'high'));
    }
    midLevel(msg) {
        var _a;
        if (this.shouldBeConcise('midLevel')) {
            return this.overwrite(msg);
        }
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteMidLevel) {
            return;
        }
        this.clearPrevOverwriteMsg();
        this.printStr(this.style(msg, 'mid'));
    }
    lowLevel(msg, options = {}) {
        var _a, _b;
        if (this.shouldBeConcise('lowLevel')) {
            return this.overwrite(msg);
        }
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteLowLevel) {
            if (options.annotation !== this.annotations.STACK_TRACE ||
                ((_b = this.config.muteConfig) === null || _b === void 0 ? void 0 : _b.muteError)) {
                return;
            }
        }
        this.clearPrevOverwriteMsg();
        this.printStr(this.style(msg, 'low'));
    }
    success(msg) {
        var _a;
        if (this.shouldBeConcise('success')) {
            return this.overwrite(msg);
        }
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteSuccess) {
            return;
        }
        this.clearPrevOverwriteMsg();
        this.printStr(this.style(msg, 'success'));
    }
    // top level error, only used before halting the execution
    criticalError(msg) {
        this.clearPrevOverwriteMsg();
        this.logMsg(msg);
        console.error(msg);
    }
    error(msg) {
        var _a;
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteError) {
            return;
        }
        this.clearPrevOverwriteMsg();
        this.printStr(this.style(msg, 'error'));
    }
    warning(msg) {
        var _a;
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteWarning) {
            return;
        }
        this.clearPrevOverwriteMsg();
        this.printStr(this.style(msg, 'warning'));
    }
    nextLine() {
        if (this.shouldBeConcise('nextLine')) {
            return this.overwrite('');
        }
        this.logMsg('');
        this.clearPrevOverwriteMsg();
        this.printStr('');
    }
    overwrite(msg, options = {}) {
        var _a;
        this.logMsg(msg);
        if ((_a = this.config.muteConfig) === null || _a === void 0 ? void 0 : _a.muteLowLevel) {
            return;
        }
        const str = this.style(msg, options.level || 'low');
        if (this.config.isContinuousTest) {
            this.printStr(msg, { isOverwrite: false });
            return;
        }
        if (this.config.isTest || this.config.muteConsole) {
            this.printStr(str, { isOverwrite: true });
            return;
        }
        this.clearPrevOverwriteMsg();
        this.printStr(str, { isOverwrite: true });
    }
    waitForConsole(query) {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: this.outStream,
        });
        this.pushMsg(query);
        this.logMsg(query);
        return new Promise(resolve => rl.question(query, ans => {
            rl.close();
            resolve(ans);
        }));
    }
    progress(cur, total, options = {}) {
        let width = Math.floor(this.outStream.columns * 0.8);
        width = Math.min(width, 80);
        const messageMaxWidth = Math.floor(width * 0.3);
        let message = options.message || '';
        const messageWidth = Math.min(message.length, messageMaxWidth);
        message = message.substring(0, messageWidth);
        // calculate progress bar
        const barWidth = width - messageWidth - 1;
        const barBodyWidth = barWidth - 2;
        const changeIndex = Math.floor((cur / total) * barBodyWidth);
        let bar = '';
        for (let i = 0; i < barBodyWidth; ++i) {
            bar += i < changeIndex ? barComplete : barIncomplete;
        }
        const percent = Math.floor((cur / total) * 100);
        const progress = `${message}: |${bar}| ${percent}/100`;
        this.overwrite(progress, { level: 'top' });
    }
    flush() {
        this.clearPrevOverwriteMsg();
    }
}
exports.default = MemLabConsole.getInstance();
