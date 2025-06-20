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
class ObjectFanoutAnalysis extends BaseAnalysis_1.default {
    getCommandName() {
        return 'object-fanout';
    }
    /** @internal */
    getDescription() {
        return 'Get objects with the most out-going references in heap';
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
            const list = this.getObjectsWithHighFanout(snapshot, options.args);
            PluginUtils_1.default.printNodeListInTerminal(list);
        });
    }
    getObjectsWithHighFanout(snapshot, args) {
        // rank heap objects based on fanout
        let ret = [];
        const listSize = args.listSize || 20;
        snapshot.nodes.forEach(node => {
            if (!PluginUtils_1.default.isNodeWorthInspecting(node)) {
                return;
            }
            const count = PluginUtils_1.default.getObjectOutgoingEdgeCount(node);
            let i;
            for (i = ret.length - 1; i >= 0; --i) {
                const curCnt = PluginUtils_1.default.getObjectOutgoingEdgeCount(ret[i]);
                if (curCnt >= count) {
                    ret.splice(i + 1, 0, node);
                    break;
                }
            }
            if (i < 0) {
                ret.unshift(node);
            }
            ret = ret.slice(0, listSize);
        });
        return ret;
    }
}
exports.default = ObjectFanoutAnalysis;
