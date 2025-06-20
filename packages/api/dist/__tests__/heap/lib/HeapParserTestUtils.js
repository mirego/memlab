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
exports.isExpectedSnapshot = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const puppeteer = core_1.config.isFB
    ? require('puppeteer-core')
    : require('puppeteer');
function isExpectedSnapshot(leakInjector, checkSnapshotCb) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshot = yield getHeapSnapshot(leakInjector);
        expect(checkSnapshotCb(snapshot)).toBe(true);
    });
}
exports.isExpectedSnapshot = isExpectedSnapshot;
function getHeapDirPrefix() {
    const dir = path_1.default.join(core_1.config.dataBaseDir, 'gen-files');
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir);
    }
    return dir;
}
function saveSnapshotToFile(page, file) {
    return __awaiter(this, void 0, void 0, function* () {
        core_1.info.lowLevel(`saving heap snapshot to file ${file}`);
        let heap = '';
        const devtoolsProtocolClient = yield page.target().createCDPSession();
        devtoolsProtocolClient.on('HeapProfiler.addHeapSnapshotChunk', data => {
            heap += data.chunk;
        });
        yield devtoolsProtocolClient.send('HeapProfiler.takeHeapSnapshot', {
            reportProgress: false,
            captureNumericValue: true,
        });
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(file, heap, 'UTF-8', err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    });
}
const TEST_URL = 'about:blank';
function dumpHeap(snapshotFile, leakInjector) {
    return __awaiter(this, void 0, void 0, function* () {
        core_1.utils.tryToMutePuppeteerWarning();
        const browser = yield puppeteer.launch(core_1.config.puppeteerConfig);
        const page = yield browser.newPage();
        // set page size
        yield page.setViewport({
            width: 1680,
            height: 1050,
            deviceScaleFactor: 1,
        });
        // visit page
        yield page.goto(TEST_URL);
        // insert a memory leak object
        yield page.evaluate(leakInjector);
        // take a heap snapshot
        yield saveSnapshotToFile(page, snapshotFile);
        yield browser.close();
    });
}
let fileId = 0;
function getHeapSnapshot(leakInjector) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshotFile = path_1.default.join(getHeapDirPrefix(), `snapshot-${Date.now()}-${fileId++}.json`);
        yield dumpHeap(snapshotFile, leakInjector);
        // parse the heap
        const opt = { buildNodeIdIndex: true };
        const snapshot = yield core_1.utils.getSnapshotFromFile(snapshotFile, opt);
        return snapshot;
    });
}
