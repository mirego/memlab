"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const BaseCommand_1 = __importStar(require("../../BaseCommand"));
const JSEngineOption_1 = __importDefault(require("../../options/heap/JSEngineOption"));
const InitDirectoryCommand_1 = __importDefault(require("../InitDirectoryCommand"));
const OversizeThresholdOption_1 = __importDefault(require("../../options/heap/OversizeThresholdOption"));
const TraceAllObjectsOption_1 = __importDefault(require("../../options/heap/TraceAllObjectsOption"));
const LogTraceAsClusterOption_1 = __importDefault(require("../../options/heap/LogTraceAsClusterOption"));
const CleanLoggerDataCommand_1 = __importDefault(require("../CleanLoggerDataCommand"));
const LeakFilterFileOption_1 = __importDefault(require("../../options/heap/leak-filter/LeakFilterFileOption"));
const LeakClusterSizeThresholdOption_1 = __importDefault(require("../../options/heap/LeakClusterSizeThresholdOption"));
const MLClusteringOption_1 = __importDefault(require("../../options/MLClusteringOption"));
const MLClusteringLinkageMaxDistanceOption_1 = __importDefault(require("../../options/MLClusteringLinkageMaxDistanceOption"));
const MLClusteringMaxDFOption_1 = __importDefault(require("../../options/MLClusteringMaxDFOption"));
const SetControlWorkDirOption_1 = __importDefault(require("../../options/experiment/SetControlWorkDirOption"));
const SetTreatmentWorkDirOption_1 = __importDefault(require("../../options/experiment/SetTreatmentWorkDirOption"));
const SetMaxClusterSampleSizeOption_1 = __importDefault(require("../../options/SetMaxClusterSampleSizeOption"));
const SetTraceContainsFilterOption_1 = __importDefault(require("../../options/heap/SetTraceContainsFilterOption"));
const SetControlSnapshotOption_1 = __importDefault(require("../../options/experiment/SetControlSnapshotOption"));
const SetTreatmentSnapshotOption_1 = __importDefault(require("../../options/experiment/SetTreatmentSnapshotOption"));
const HeapParserDictFastStoreSizeOption_1 = __importDefault(require("../../options/heap/HeapParserDictFastStoreSizeOption"));
class CheckLeakCommand extends BaseCommand_1.default {
    useDefaultMLClusteringSetting(cliArgs) {
        if (!MLClusteringOption_1.default.hasOptionSet(cliArgs)) {
            core_1.config.isMLClustering = this.isMLClustering;
            this.isMLClusteringSettingCache = core_1.config.isMLClustering;
        }
    }
    restoreDefaultMLClusteringSetting(cliArgs) {
        if (!MLClusteringOption_1.default.hasOptionSet(cliArgs)) {
            core_1.config.isMLClustering = this.isMLClusteringSettingCache;
        }
    }
    constructor(options = {}) {
        super();
        this.isMLClustering = false;
        this.isMLClusteringSettingCache = false;
        this.isMLClustering = !!(options === null || options === void 0 ? void 0 : options.isMLClustering);
    }
    getCommandName() {
        return 'diff-leaks';
    }
    getDescription() {
        return 'find new memory leaks by diffing control and test heap snapshots';
    }
    getCategory() {
        return BaseCommand_1.CommandCategory.COMMON;
    }
    getPrerequisites() {
        return [new InitDirectoryCommand_1.default(), new CleanLoggerDataCommand_1.default()];
    }
    getOptions() {
        return [
            new SetControlSnapshotOption_1.default(),
            new SetControlWorkDirOption_1.default(),
            new SetTreatmentSnapshotOption_1.default(),
            new SetTreatmentWorkDirOption_1.default(),
            new JSEngineOption_1.default(),
            new LeakFilterFileOption_1.default(),
            new OversizeThresholdOption_1.default(),
            new LeakClusterSizeThresholdOption_1.default(),
            new TraceAllObjectsOption_1.default(),
            new LogTraceAsClusterOption_1.default(),
            new MLClusteringOption_1.default(),
            new MLClusteringLinkageMaxDistanceOption_1.default(),
            new MLClusteringMaxDFOption_1.default(),
            new SetMaxClusterSampleSizeOption_1.default(),
            new SetTraceContainsFilterOption_1.default(),
            new HeapParserDictFastStoreSizeOption_1.default(),
        ];
    }
    showWorkingDirErrorMessageAndHalt() {
        throw core_1.utils.haltOrThrow('No control or test working directory or snapshot location specified, ' +
            'please specify them via: \n' +
            ` --${new SetControlSnapshotOption_1.default().getOptionName()} and` +
            ` --${new SetTreatmentSnapshotOption_1.default().getOptionName()}\n` +
            'alternatively, you can also specify them via: \n' +
            ` --${new SetControlWorkDirOption_1.default().getOptionName()} and` +
            ` --${new SetTreatmentWorkDirOption_1.default().getOptionName()}`);
    }
    getWorkDirs(options) {
        var _a, _b;
        // double check parameters
        if (!((_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.controlWorkDirs) ||
            !((_b = options.configFromOptions) === null || _b === void 0 ? void 0 : _b.treatmentWorkDirs)) {
            this.showWorkingDirErrorMessageAndHalt();
        }
        // get parameters
        const controlWorkDirs = options.configFromOptions['controlWorkDirs'];
        const treatmentWorkDirs = options.configFromOptions['treatmentWorkDirs'];
        return {
            controlWorkDirs,
            treatmentWorkDirs,
        };
    }
    dumpVerboseInfo(controlWorkDirs, treatmentWorkDirs) {
        if (core_1.config.verbose) {
            core_1.info.lowLevel(`control working directories: ${controlWorkDirs.join(', ')}`);
            core_1.info.lowLevel(`treatment working directories: ${treatmentWorkDirs.join(', ')}`);
            core_1.info.lowLevel(`diffing working directory: ${treatmentWorkDirs[0]}`);
        }
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            core_1.config.chaseWeakMapEdge = false;
            const { controlWorkDirs, treatmentWorkDirs } = this.getWorkDirs(options);
            const { runMetaInfoManager } = core_1.runInfoUtils;
            runMetaInfoManager.setConfigFromRunMeta({
                workDir: treatmentWorkDirs[0],
                silentFail: true,
            });
            this.dumpVerboseInfo(controlWorkDirs, treatmentWorkDirs);
            // diff memory leaks
            this.useDefaultMLClusteringSetting(options.cliArgs);
            yield core_1.analysis.diffLeakByWorkDir({ controlWorkDirs, treatmentWorkDirs });
            this.restoreDefaultMLClusteringSetting(options.cliArgs);
        });
    }
}
exports.default = CheckLeakCommand;
