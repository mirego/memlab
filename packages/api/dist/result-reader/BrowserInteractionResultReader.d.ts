/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { E2EStepInfo, RunMetaInfo } from '@memlab/core';
import BaseResultReader from './BaseResultReader';
/**
 * A utility entity to read all generated files from
 * the directory holding the data and results from the
 * last MemLab browser interaction run
 */
export default class BrowserInteractionResultReader extends BaseResultReader {
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
    static from(workDir?: string): BrowserInteractionResultReader;
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
    getSnapshotFiles(): string[];
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
    getSnapshotFileDir(): string;
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
    getInteractionSteps(): E2EStepInfo[];
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
    getRunMetaInfo(): RunMetaInfo;
}
//# sourceMappingURL=BrowserInteractionResultReader.d.ts.map