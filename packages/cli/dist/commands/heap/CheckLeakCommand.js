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
const BaseCommand_1 = __importStar(require("../../BaseCommand"));
const core_1 = require("@memlab/core");
const BaselineFileOption_1 = __importDefault(require("../../options/heap/BaselineFileOption"));
const FinalFileOption_1 = __importDefault(require("../../options/heap/FinalFileOption"));
const JSEngineOption_1 = __importDefault(require("../../options/heap/JSEngineOption"));
const SnapshotDirectoryOption_1 = __importDefault(require("../../options/heap/SnapshotDirectoryOption"));
const TargetFileOption_1 = __importDefault(require("../../options/heap/TargetFileOption"));
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
const CleanupSnapshotOption_1 = __importDefault(require("../../options/heap/CleanupSnapshotOption"));
const SetWorkingDirectoryOption_1 = __importDefault(require("../../options/SetWorkingDirectoryOption"));
const OptionConstant_1 = __importDefault(require("../../options/lib/OptionConstant"));
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
        return 'find-leaks';
    }
    getExamples() {
        const optionNames = OptionConstant_1.default.optionNames;
        const workDirOption = `--${optionNames.WORK_DIR}`;
        const snapshotDirOption = `--${optionNames.SNAPSHOT_DIR}`;
        const baselineOption = `--${optionNames.BASELINE}`;
        const targetOption = `--${optionNames.TARGET}`;
        const finalOption = `--${optionNames.FINAL}`;
        return [
            {
                description: 'check memory leaks in the default working directory generated by\n' +
                    `memlab run (without setting the ${workDirOption} option)`,
                cliOptionExample: '', // default empty command options
            },
            {
                description: 'specify the baseline, target, and final heap snapshot file path separately',
                cliOptionExample: `${baselineOption} /tmp/baseline.heapsnapshot ${targetOption} /tmp/target.heapsnapshot ${finalOption} /tmp/final.heapsnapshot`,
            },
            {
                description: 'specifies the directory that contains all three heap snapshot files',
                cliOptionExample: `${snapshotDirOption} /dir/containing/heapsnapshot/files/`,
            },
            {
                description: 'specifies the output working directory of the `memlab run` or the `memlab snapshot` command',
                cliOptionExample: `${workDirOption} /memlab/working/dir/generated/by/memlab/`,
            },
        ];
    }
    getDescription() {
        return 'find memory leaks in heap snapshots';
    }
    getDocumentation() {
        const optionNames = OptionConstant_1.default.optionNames;
        const workDirOption = `--${optionNames.WORK_DIR}`;
        const snapshotDirOption = `--${optionNames.SNAPSHOT_DIR}`;
        const baselineOption = `--${optionNames.BASELINE}`;
        const targetOption = `--${optionNames.TARGET}`;
        const finalOption = `--${optionNames.FINAL}`;
        return `There are three ways to specify inputs for the \`memlab ${this.getCommandName()}\` command:
 1. \`${baselineOption}\`, \`${targetOption}\`, \`${finalOption}\` specifies each heap snapshot input individually;
 2. \`${snapshotDirOption}\` specifies the directory that contains all three heap snapshot files (MemLab will assign baseline, target, and final based on alphabetic order of the file);
 3. \`${workDirOption}\` specifies the output working directory of the \`memlab run\` or the \`memlab snapshot\` command;

Please only use one of the three ways to specify the input.

You can also manually take heap snapshots in Chrome Devtools, save them to disk.
Then process them using this command with the CLI flags (either option 1
or option 2 mentioned above).
`;
    }
    getCategory() {
        return BaseCommand_1.CommandCategory.COMMON;
    }
    getPrerequisites() {
        return [new InitDirectoryCommand_1.default(), new CleanLoggerDataCommand_1.default()];
    }
    getOptions() {
        return [
            new BaselineFileOption_1.default(),
            new TargetFileOption_1.default(),
            new FinalFileOption_1.default(),
            new SnapshotDirectoryOption_1.default(),
            new JSEngineOption_1.default(),
            new LeakFilterFileOption_1.default(),
            new OversizeThresholdOption_1.default(),
            new LeakClusterSizeThresholdOption_1.default(),
            new TraceAllObjectsOption_1.default(),
            new LogTraceAsClusterOption_1.default(),
            new MLClusteringOption_1.default(),
            new MLClusteringLinkageMaxDistanceOption_1.default(),
            new MLClusteringMaxDFOption_1.default(),
            new CleanupSnapshotOption_1.default(),
            new SetWorkingDirectoryOption_1.default(),
            new HeapParserDictFastStoreSizeOption_1.default(),
        ];
    }
    run(options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const workDir = (_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.workDir;
            core_1.fileManager.initDirs(core_1.config, { workDir });
            const { runMetaInfoManager } = core_1.runInfoUtils;
            runMetaInfoManager.setConfigFromRunMeta({
                workDir,
                silentFail: true,
            });
            core_1.config.chaseWeakMapEdge = false;
            this.useDefaultMLClusteringSetting(options.cliArgs);
            yield core_1.analysis.checkLeak();
            this.restoreDefaultMLClusteringSetting(options.cliArgs);
            const configFromOptions = (_b = options.configFromOptions) !== null && _b !== void 0 ? _b : {};
            if (configFromOptions['cleanUpSnapshot']) {
                core_1.fileManager.removeSnapshotFiles();
            }
        });
    }
}
exports.default = CheckLeakCommand;
