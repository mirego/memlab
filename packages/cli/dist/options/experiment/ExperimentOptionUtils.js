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
exports.extractAndCheckWorkDirs = void 0;
const fs_1 = __importDefault(require("fs"));
const core_1 = require("@memlab/core");
function extractAndCheckWorkDirs(optionName, args) {
    let dirs = [];
    const flagValue = args[optionName];
    if (!flagValue) {
        return null;
    }
    if (Array.isArray(flagValue)) {
        dirs = flagValue;
    }
    else {
        dirs = [flagValue];
    }
    for (const dir of dirs) {
        if (fs_1.default.existsSync(dir)) {
            core_1.fileManager.createDefaultVisitOrderMetaFile({
                workDir: dir,
            });
        }
    }
    return dirs;
}
exports.extractAndCheckWorkDirs = extractAndCheckWorkDirs;
