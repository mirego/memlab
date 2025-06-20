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
const core_1 = require("@memlab/core");
const BaseAnalysis_1 = __importDefault(require("../BaseAnalysis"));
const PluginUtils_1 = __importDefault(require("../PluginUtils"));
const HeapAnalysisSnapshotFileOption_1 = __importDefault(require("../options/HeapAnalysisSnapshotFileOption"));
const HeapAnalysisOutputOption_1 = __importDefault(require("../options/HeapAnalysisOutputOption"));
class ObjectSizeRankAnalysis extends BaseAnalysis_1.default {
    getCommandName() {
        return 'object-size';
    }
    /** @internal */
    getDescription() {
        return 'Get the largest objects in heap';
    }
    /** @internal */
    getOptions() {
        return [new HeapAnalysisSnapshotFileOption_1.default(), new HeapAnalysisOutputOption_1.default()];
    }
    /** @internal */
    analyzeSnapshotsInDirectory(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const d = directory;
            throw core_1.utils.haltOrThrow(`${this.constructor.name} does not support analyzeSnapshotsInDirectory`);
        });
    }
    /** @internal */
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield PluginUtils_1.default.loadHeapSnapshot(options);
            const largeObjects = PluginUtils_1.default.filterOutLargestObjects(snapshot, PluginUtils_1.default.isNodeWorthInspecting);
            PluginUtils_1.default.printNodeListInTerminal(largeObjects);
        });
    }
}
exports.default = ObjectSizeRankAnalysis;
