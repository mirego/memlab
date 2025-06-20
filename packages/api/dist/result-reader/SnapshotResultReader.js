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
const core_1 = require("@memlab/core");
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_2 = require("@memlab/core");
const BaseResultReader_1 = __importDefault(require("./BaseResultReader"));
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
class SnapshotResultReader extends BaseResultReader_1.default {
    /**
     * build a result reader
     * @param workDir absolute path of the directory where the data
     * and generated files of the memlab run were stored
     */
    constructor(baselineSnapshot, targetSnapshot, finalSnapshot) {
        const fileManager = new core_2.FileManager();
        const workDir = fileManager.generateTmpHeapDir();
        fs_extra_1.default.ensureDirSync(workDir);
        super(workDir);
        this.baselineSnapshot = baselineSnapshot;
        this.targetSnapshot = targetSnapshot;
        this.finalSnapshot = finalSnapshot;
        this.checkSnapshotFiles();
        this.createMetaFilesOnDisk(fileManager, workDir);
    }
    createMetaFilesOnDisk(fileManager, workDir) {
        fileManager.initDirs(core_1.config, { workDir });
        const visitOrder = this.getInteractionSteps();
        const snapSeqFile = fileManager.getSnapshotSequenceMetaFile({ workDir });
        fs_extra_1.default.writeFileSync(snapSeqFile, JSON.stringify(visitOrder, null, 2), 'UTF-8');
    }
    checkSnapshotFiles() {
        if (!fs_extra_1.default.existsSync(this.baselineSnapshot) ||
            !fs_extra_1.default.existsSync(this.targetSnapshot) ||
            !fs_extra_1.default.existsSync(this.finalSnapshot)) {
            throw core_2.utils.haltOrThrow('invalid file path of baseline, target, or final heap snapshots');
        }
    }
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
    static fromSnapshots(baselineSnapshot, targetSnapshot, finalSnapshot) {
        return new SnapshotResultReader(baselineSnapshot, targetSnapshot, finalSnapshot);
    }
    /**
     * @internal
     */
    static from(workDir = '') {
        throw core_2.utils.haltOrThrow('SnapshotResultReader.from is not supported');
        return new BaseResultReader_1.default(workDir);
    }
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
    getSnapshotFiles() {
        return [this.baselineSnapshot, this.targetSnapshot, this.finalSnapshot];
    }
    /**
     * @internal
     */
    getSnapshotFileDir() {
        throw core_2.utils.haltOrThrow('SnapshotResultReader getSnapshotFileDir() method is not supported');
        return '';
    }
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
    getInteractionSteps() {
        return this.fileManager.createVisitOrderWithSnapshots(this.baselineSnapshot, this.targetSnapshot, this.finalSnapshot);
    }
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
    getRunMetaInfo() {
        return new core_2.RunMetaInfoManager().loadRunMetaExternalTemplate();
    }
    /**
     * @internal
     */
    cleanup() {
        // do nothing
    }
}
exports.default = SnapshotResultReader;
