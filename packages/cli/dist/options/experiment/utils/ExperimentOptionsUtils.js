"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransientWorkDirFromSingleHeapSnapshot = exports.validateHeapSnapshotFileOrThrow = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
const core_1 = require("@memlab/core");
const fs_extra_1 = require("fs-extra");
function validateHeapSnapshotFileOrThrow(file) {
    if (typeof file !== 'string') {
        throw core_1.utils.haltOrThrow(`Heap snapshot file must be a string, but got ${typeof file}`);
    }
    if (!file.endsWith('.heapsnapshot')) {
        throw core_1.utils.haltOrThrow(`Heap snapshot file must end with .heapsnapshot, but got ${file}`);
    }
    if (!(0, fs_extra_1.existsSync)(file)) {
        throw core_1.utils.haltOrThrow(`Heap snapshot file ${file} does not exist`);
    }
    return file;
}
exports.validateHeapSnapshotFileOrThrow = validateHeapSnapshotFileOrThrow;
function createTransientWorkDirFromSingleHeapSnapshot(file) {
    const config = core_1.MemLabConfig.resetConfigWithTransientDir();
    core_1.fileManager.createOrOverrideVisitOrderMetaFileForExternalSnapshot(file);
    return config.workDir;
}
exports.createTransientWorkDirFromSingleHeapSnapshot = createTransientWorkDirFromSingleHeapSnapshot;
