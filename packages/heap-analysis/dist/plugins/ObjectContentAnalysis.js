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
const chalk_1 = __importDefault(require("chalk"));
const core_1 = require("@memlab/core");
const HeapAnalysisNodeIdOption_1 = __importDefault(require("../options/HeapAnalysisNodeIdOption"));
const HeapAnalysisSnapshotFileOption_1 = __importDefault(require("../options/HeapAnalysisSnapshotFileOption"));
const BaseAnalysis_1 = __importDefault(require("../BaseAnalysis"));
const PluginUtils_1 = __importDefault(require("../PluginUtils"));
const HeapAnalysisOutputOption_1 = __importDefault(require("../options/HeapAnalysisOutputOption"));
class ObjectContentAnalysis extends BaseAnalysis_1.default {
    getCommandName() {
        return 'object';
    }
    /** @internal */
    getDescription() {
        return 'Get properties inside an object';
    }
    /** @internal */
    getOptions() {
        return [new HeapAnalysisSnapshotFileOption_1.default(), new HeapAnalysisNodeIdOption_1.default(), new HeapAnalysisOutputOption_1.default()];
    }
    /** @internal */
    process(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeId = core_1.config.focusFiberNodeId;
            if (nodeId < 0) {
                core_1.utils.haltOrThrow('Specify an object by --node-id');
                return;
            }
            const snapshot = yield PluginUtils_1.default.loadHeapSnapshot(options);
            const node = snapshot.getNodeById(nodeId);
            if (!node) {
                core_1.utils.haltOrThrow(`Object @${nodeId} is not found.`);
                return;
            }
            if (core_1.config.outputFormat === core_1.OutputFormat.Json) {
                PluginUtils_1.default.printNodeInTerminal(node);
            }
            else {
                this.print(node, snapshot);
            }
        });
    }
    print(node, snapshot) {
        const id = chalk_1.default.grey(`@${node.id}`);
        core_1.info.topLevel(`Heap node (${node.type}) ${id}`);
        const name = chalk_1.default.grey(`${node.name}`);
        core_1.info.topLevel(` name: ${name}`);
        const numReferences = chalk_1.default.grey(`${node.edge_count}`);
        core_1.info.topLevel(` # of references: ${numReferences}`);
        const numReferrers = chalk_1.default.grey(`${node.referrers.length}`);
        core_1.info.topLevel(` # of referrers: ${numReferrers}`);
        const selfSize = chalk_1.default.grey(`${node.self_size}`);
        core_1.info.topLevel(` shallow size: ${selfSize}`);
        const retainedSize = chalk_1.default.grey(`${node.retainedSize}`);
        core_1.info.topLevel(` retained size: ${retainedSize}`);
        const dominatorNode = node.dominatorNode;
        if (dominatorNode) {
            const dominatorNodeId = chalk_1.default.grey(`@${dominatorNode.id}`);
            core_1.info.topLevel(` dominator node: ${dominatorNodeId}`);
        }
        // print object references
        core_1.info.topLevel('\n' + chalk_1.default.bold('REFERENCES:'));
        let list = this.getObjectProperties(snapshot, node);
        PluginUtils_1.default.printReferencesInTerminal(list);
        core_1.info.topLevel('\n' + chalk_1.default.bold('REFERRERS:'));
        // print object referrers
        list = this.getObjectReferrerEdges(snapshot, node);
        PluginUtils_1.default.printReferrersInTerminal(list);
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
    getObjectProperties(snapshot, node) {
        const ret = [];
        const refs = node.references;
        for (const edge of refs) {
            ret.push(edge);
        }
        return ret;
    }
    /** @internal */
    getObjectReferrerEdges(snapshot, node) {
        const ret = [];
        const refs = node.referrers;
        for (const edge of refs) {
            ret.push(edge);
        }
        return ret;
    }
}
exports.default = ObjectContentAnalysis;
