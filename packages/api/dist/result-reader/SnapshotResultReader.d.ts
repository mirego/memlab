/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { E2EStepInfo, RunMetaInfo } from '@memlab/core';
import BaseResultReader from './BaseResultReader';
/**
 * A utility entity to read all MemLab files generated from
 * baseline, target and final heap snapshots.
 *
 * The most useful feature of this class is when you have
 * three separate snapshots (baseline, target, and final)
 * that are not taken from MemLab, but you still would
 * like to use the `findLeaks` to detect memory leaks:
 *
 * ```javascript
 * const {SnapshotResultReader, findLeaks} = require('@memlab/api');
 *
 * // baseline, target, and final are file paths of heap snapshot files
 * const reader = SnapshotResultReader.fromSnapshots(baseline, target, final);
 * const leaks = await findLeaks(reader);
 * ```
 */
export default class SnapshotResultReader extends BaseResultReader {
    private baselineSnapshot;
    private targetSnapshot;
    private finalSnapshot;
    /**
     * build a result reader
     * @param workDir absolute path of the directory where the data
     * and generated files of the memlab run were stored
     */
    protected constructor(baselineSnapshot: string, targetSnapshot: string, finalSnapshot: string);
    private createMetaFilesOnDisk;
    private checkSnapshotFiles;
    /**
     * Build a result reader from baseline, target, and final heap snapshot files.
     * The three snapshot files do not have to be in the same directory.
     * @param baselineSnapshot file path of the baseline heap snapshot
     * @param targetSnapshot file path of the target heap snapshot
     * @param finalSnapshot file path of the final heap snapshot
     * @returns the ResultReader instance
     *
     * * **Examples**:
     * ```javascript
     * const {SnapshotResultReader, findLeaks} = require('@memlab/api');
     *
     * // baseline, target, and final are file paths of heap snapshot files
     * const reader = SnapshotResultReader.fromSnapshots(baseline, target, final);
     * const leaks = await findLeaks(reader);
     * ```
     */
    static fromSnapshots(baselineSnapshot: string, targetSnapshot: string, finalSnapshot: string): SnapshotResultReader;
    /**
     * @internal
     */
    static from(workDir?: string): BaseResultReader;
    /**
     * get all snapshot files related to this SnapshotResultReader
     * @returns an array of snapshot file's absolute path
     *
     * * **Examples**:
     * ```javascript
     * const {SnapshotResultReader} = require('@memlab/api');
     *
     * // baseline, target, and final are file paths of heap snapshot files
     * const reader = SnapshotResultReader.fromSnapshots(baseline, target, final);
     * const paths = reader.getSnapshotFiles();
     * ```
     */
    getSnapshotFiles(): string[];
    /**
     * @internal
     */
    getSnapshotFileDir(): string;
    /**
     * browser interaction step sequence
     * @returns an array of browser interaction step information
     *
     * * **Examples**:
     * ```javascript
     * const {SnapshotResultReader} = require('@memlab/api');
     *
     * // baseline, target, and final are file paths of heap snapshot files
     * const reader = SnapshotResultReader.fromSnapshots(baseline, target, final);
     * const paths = reader.getInteractionSteps();
     * ```
     */
    getInteractionSteps(): E2EStepInfo[];
    /**
     * @internal
     * general meta data of the browser interaction run
     * @returns meta data about the entire browser interaction
     *
     * * **Examples**:
     * ```javascript
     * const {SnapshotResultReader} = require('@memlab/api');
     *
     * // baseline, target, and final are file paths of heap snapshot files
     * const reader = SnapshotResultReader.fromSnapshots(baseline, target, final);
     * const metaInfo = reader.getRunMetaInfo();
     * ```
     */
    getRunMetaInfo(): RunMetaInfo;
    /**
     * @internal
     */
    cleanup(): void;
}
//# sourceMappingURL=SnapshotResultReader.d.ts.map