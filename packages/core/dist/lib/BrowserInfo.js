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
const Config_1 = __importDefault(require("./Config"));
const Console_1 = __importDefault(require("./Console"));
const Constant_1 = __importDefault(require("./Constant"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
class BrowserInfo {
    constructor() {
        this._browserVersion = Constant_1.default.unset;
        this._puppeteerConfig = {};
        this._consoleMessages = [];
    }
    clear() {
        this._consoleMessages = [];
    }
    recordBrowserVersion(version) {
        this._browserVersion = version;
    }
    recordPuppeteerConfig(puppeteerConfig) {
        this._puppeteerConfig = puppeteerConfig;
    }
    load(browserInfo) {
        this._browserVersion = browserInfo._browserVersion;
        this._puppeteerConfig = browserInfo._puppeteerConfig;
        this._consoleMessages = browserInfo._consoleMessages;
    }
    formatConsoleMessage(message, options = {}) {
        if (!message) {
            return [];
        }
        const type = `${message.type()}`;
        if (type === 'startGroup' ||
            type === 'endGroup' ||
            type === 'groupStart' ||
            type === 'groupEnd') {
            return [];
        }
        const text = message.text();
        return text.split('\n').map(line => {
            let consoleInfo = `[console.${type}]`;
            consoleInfo = options.color ? chalk_1.default.blue(consoleInfo) : consoleInfo;
            return `${consoleInfo}: ${line}`;
        });
    }
    formatDialogMessage(dialog, options = {}) {
        if (!dialog || !dialog.message()) {
            return '';
        }
        let typeInfo = `[dialog ${dialog.type()}]`;
        typeInfo = options.color ? chalk_1.default.blue(typeInfo) : typeInfo;
        return `${typeInfo}: ${dialog.message()}`;
    }
    addMarker(marker) {
        this._consoleMessages.push(marker);
    }
    summarizeConsoleMessage() {
        return this._consoleMessages.join('\n');
    }
    dump() {
        const file = Config_1.default.browserInfoSummary;
        const consoleSummary = this.summarizeConsoleMessage();
        const summary = `Web Console Output:\n${consoleSummary}`;
        fs_1.default.writeFileSync(file, summary, 'utf-8');
    }
    monitorWebConsole(page) {
        page.on('console', message => {
            let msgList = this.formatConsoleMessage(message);
            this._consoleMessages = this._consoleMessages.concat(msgList);
            if (Config_1.default.verbose || Config_1.default.dumpWebConsole) {
                msgList = this.formatConsoleMessage(message, { color: true });
                if (msgList.length > 0) {
                    Console_1.default.highLevel(msgList.join('\n'));
                }
            }
            message.args().forEach(handle => handle.dispose());
        });
        const handleError = (err) => {
            this._consoleMessages.push(err.toString());
            Console_1.default.error(err.message);
        };
        page.on('pageerror', handleError);
        page.on('error', handleError);
        page.on('dialog', (dialog) => __awaiter(this, void 0, void 0, function* () {
            let msg = this.formatDialogMessage(dialog);
            this._consoleMessages.push(msg);
            if (Config_1.default.verbose || Config_1.default.dumpWebConsole) {
                msg = this.formatDialogMessage(dialog, { color: true });
                Console_1.default.highLevel(msg);
            }
            // dialog will be auto accepted or dismissed in setupPage
        }));
    }
}
exports.default = new BrowserInfo();
