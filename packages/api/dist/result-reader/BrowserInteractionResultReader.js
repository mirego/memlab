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
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const BaseResultReader_1 = __importDefault(require("./BaseResultReader"));
/**
 * A utility entity to read all generated files from
 * the directory holding the data and results from the
 * last MemLab browser interaction run
 */
class BrowserInteractionResultReader extends BaseResultReader_1.default {
    /**
     * build a result reader from a data directory where the data
     * and generated files of a memlab run were stored
     * @param workDir absolute path of the data directory
     * @returns the ResultReader instance
     *
     * * **Examples**:
     * ```javascript
     * const {BrowserInteractionResultReader} = require('@memlab/api');
     *
     * const dataDir = '/tmp/memlab'; // where the last memlab run stores results
     * const reader = BrowserInteractionResultReader.from(dataDir);
     * reader.cleanup(); // clean up the results
     * ```
     */
    static from(workDir = '') {
        return new BrowserInteractionResultReader(workDir);
    }
    /**
     * get all snapshot files generated from last memlab browser interaction
     * @returns an array of snapshot file's absolute path
     * * **Examples**:
     * ```javascript
     * const {takeSnapshots} = require('@memlab/api');
     *
     * (async function () {
     *   const scenario = { url: () => 'https://www.npmjs.com'};
     *   const result = await takeSnapshots({scenario});
     *
     *   // get absolute paths of all snapshot files
     *   const files = result.getSnapshotFiles();
     * })();
     * ```
     */
    getSnapshotFiles() {
        this.check();
        const dataDir = this.fileManager.getCurDataDir({ workDir: this.workDir });
        return fs_extra_1.default
            .readdirSync(dataDir)
            .filter(file => file.endsWith('heapsnapshot'))
            .map(file => path_1.default.join(dataDir, file));
    }
    /**
     * get the directory holding all snapshot files
     * @returns the absolute path of the directory
     * * **Examples**:
     * ```javascript
     * const {takeSnapshots} = require('@memlab/api');
     *
     * (async function () {
     *   const scenario = { url: () => 'https://www.npmjs.com'};
     *   const result = await takeSnapshots({scenario});
     *
     *   // get the absolute path the directory holding all snapshot files
     *   const files = result.getSnapshotFileDir();
     * })();
     * ```
     */
    getSnapshotFileDir() {
        this.check();
        return this.fileManager.getCurDataDir({ workDir: this.workDir });
    }
    /**
     * browser interaction step sequence
     * @returns an array of browser interaction step information
     * * **Examples**:
     * ```javascript
     * const {takeSnapshots} = require('@memlab/api');
     *
     * (async function () {
     *   const scenario = { url: () => 'https://www.npmjs.com'};
     *   const result = await takeSnapshots({scenario});
     *
     *   const steps = result.getInteractionSteps();
     *   // print each browser interaction's name and JavaScript heap size (in bytes)
     *   steps.forEach(step => console.log(step.name, step.JSHeapUsedSize))
     * })();
     * ```
     */
    getInteractionSteps() {
        this.check();
        const metaFile = this.fileManager.getSnapshotSequenceMetaFile({
            workDir: this.workDir,
        });
        return core_1.utils.loadTabsOrder(metaFile);
    }
    /**
     * general meta data of the browser interaction run
     * @returns meta data about the entire browser interaction
     * * **Examples**:
     * ```javascript
     * const {takeSnapshots} = require('@memlab/api');
     *
     * (async function () {
     *   const scenario = { url: () => 'https://www.npmjs.com'};
     *   const result = await takeSnapshots({scenario});
     *
     *   const metaInfo = result.getRunMetaInfo();
     *   // print all browser web console output
     *   console.log(metaInfo.browserInfo._consoleMessages.join('\n'));
     * })();
     * ```
     */
    getRunMetaInfo() {
        this.check();
        return core_1.runInfoUtils.runMetaInfoManager.loadRunMetaInfo({
            workDir: this.workDir,
        });
    }
}
exports.default = BrowserInteractionResultReader;
