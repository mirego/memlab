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
exports.FileManager = exports.joinAndProcessDir = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const Console_1 = __importDefault(require("./Console"));
const Constant_1 = __importDefault(require("./Constant"));
const Utils_1 = __importDefault(require("./Utils"));
/** @internal */
function joinAndProcessDir(options, ...args) {
    const filepath = path_1.default.join(...args);
    if (!fs_extra_1.default.existsSync(filepath)) {
        try {
            fs_extra_1.default.mkdirpSync(filepath);
        }
        catch (ex) {
            const err = Utils_1.default.getError(ex);
            if (!err.message.includes('already exists')) {
                Utils_1.default.haltOrThrow(err);
            }
        }
    }
    return filepath;
}
exports.joinAndProcessDir = joinAndProcessDir;
/** @internal */
class FileManager {
    constructor() {
        this.memlabConfigCache = null;
    }
    getDefaultWorkDir() {
        return path_1.default.join(this.getTmpDir(), 'memlab');
    }
    generateTmpHeapDir() {
        const dirPath = path_1.default.join(this.getTmpDir(), 'memlab-' + Utils_1.default.getUniqueID());
        if (!fs_extra_1.default.existsSync(dirPath)) {
            fs_extra_1.default.mkdirpSync(dirPath);
        }
        return dirPath;
    }
    getWorkDir(options = FileManager.defaultFileOption) {
        var _a;
        // workDir options supercedes all the other options
        if (options.workDir) {
            return path_1.default.resolve(options.workDir);
        }
        // transient options supercedes the other CLI options
        if (options.transient) {
            const idx = ++FileManager.transientInstanceIdx;
            const instanceId = `${process.pid}-${Date.now()}-${idx}`;
            const workDir = path_1.default.join(this.getTmpDir(), `memlab-${instanceId}`);
            return path_1.default.resolve(workDir);
        }
        // workDir from the CLI options
        const workDir = FileManager.defaultFileOption.workDir ||
            (
            // in case there is a transcient working directory generated
            (_a = this.memlabConfigCache) === null || _a === void 0 ? void 0 : _a.workDir) ||
            this.getDefaultWorkDir();
        return path_1.default.resolve(workDir);
    }
    getChromeBinaryZipFile() {
        return path_1.default.join(this.getDefaultWorkDir(), 'chrome.tar.gz');
    }
    getChromeBinaryTimeStampFile() {
        return path_1.default.join(this.getChromeBinaryDir(), 'memlab-success');
    }
    getChromeBinaryDir() {
        return path_1.default.join(this.getDefaultWorkDir(), 'chrome');
    }
    getDataBaseDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getWorkDir(options), 'data');
    }
    getCodeDataDir() {
        return path_1.default.join(this.getCoreProjectBaseDir(), 'static');
    }
    getClusterSampleDataDir() {
        return path_1.default.join(this.getCodeDataDir(), 'cluster');
    }
    getUserDataDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDataBaseDir(options), 'profile');
    }
    clearUserDataDir(options = FileManager.defaultFileOption) {
        const userDataDir = this.getUserDataDir(options);
        this.rmDir(userDataDir);
    }
    getCurDataDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDataBaseDir(options), 'cur');
    }
    getConsoleBackupFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getCurDataDir(options), 'console-log.txt');
    }
    getWebSourceDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getCurDataDir(options), 'code');
    }
    getWebSourceMetaFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getWebSourceDir(options), 'files.json');
    }
    getDebugDataDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDataBaseDir(options), 'debug');
    }
    getDebugSourceFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDebugDataDir(options), 'file.js');
    }
    getPersistDataDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDataBaseDir(options), 'persist');
    }
    getLoggerOutDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDataBaseDir(options), 'logger');
    }
    // all heap analysis results generated
    getHeapAnalysisLogDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getLoggerOutDir(options), 'heap-analysis');
    }
    // memlab save-heap result log file
    getHeapSaveLogJSONFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getHeapAnalysisLogDir(options), 'save-heap.json');
    }
    // all trace clusters generated from the current run
    getTraceClustersDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getLoggerOutDir(options), 'trace-clusters');
    }
    // stores JSON file (with heap object and reference details for visualization)
    // of all trace clusters (each cluster has a representative trace)
    getTraceJSONDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getLoggerOutDir(options), 'trace-jsons');
    }
    getUnclassifiedTraceClusterDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getLoggerOutDir(options), 'unclassified-clusters');
    }
    getUniqueTraceClusterDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getLoggerOutDir(options), 'unique-trace-clusters');
    }
    getNewUniqueTraceClusterDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getUniqueTraceClusterDir(options), 'add');
    }
    getStaleUniqueTraceClusterDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getUniqueTraceClusterDir(options), 'delete');
    }
    getAllClusterSummaryFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getUniqueTraceClusterDir(options), 'unique-clusters-summary.txt');
    }
    getExistingUniqueTraceClusterDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getUniqueTraceClusterDir(options), 'existing');
    }
    getAllFilesInDir(dir) {
        const files = fs_extra_1.default.readdirSync(dir);
        return files.map((file) => path_1.default.join(dir, file));
    }
    getDataOutDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDataBaseDir(options), 'out');
    }
    getCoreProjectBaseDir() {
        return path_1.default.join(__dirname, '..', '..');
    }
    getMonoRepoDir() {
        return path_1.default.join(this.getCoreProjectBaseDir(), '..', '..');
    }
    getDocDir() {
        return path_1.default.join(this.getMonoRepoDir(), 'website', 'docs');
    }
    getReportOutDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getPersistDataDir(options), 'reports');
    }
    getPreviewReportDir(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getPersistDataDir(options), 'report-preview');
    }
    getLeakSummaryFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getDataOutDir(options), 'leaks.txt');
    }
    getRunMetaFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getCurDataDir(options), 'run-meta.json');
    }
    getRunMetaExternalTemplateFile() {
        return path_1.default.join(this.getCodeDataDir(), 'run-meta.json');
    }
    getSnapshotSequenceMetaFile(options = FileManager.defaultFileOption) {
        return path_1.default.join(this.getCurDataDir(options), 'snap-seq.json');
    }
    getSnapshotSequenceExternalTemplateFile() {
        return path_1.default.join(this.getCodeDataDir(), 'visit-order.json');
    }
    getInputDataDir() {
        return path_1.default.join(this.getDefaultWorkDir(), 'input');
    }
    getAllFilesInSubDirs(dir) {
        let ret = [];
        if (!fs_extra_1.default.existsSync(dir)) {
            return ret;
        }
        const files = fs_extra_1.default.readdirSync(dir);
        for (const file of files) {
            const p = path_1.default.join(dir, file);
            if (fs_extra_1.default.lstatSync(p).isDirectory()) {
                ret = ret.concat(this.getAllFilesInSubDirs(p));
            }
            else {
                ret.push(p);
            }
        }
        return ret;
    }
    // system default tmp dir
    getTmpDir() {
        return os_1.default.tmpdir();
    }
    rmDir(dir) {
        if (fs_extra_1.default.existsSync(dir)) {
            fs_extra_1.default.removeSync(dir);
        }
    }
    getExperimentsDir() {
        return path_1.default.join(this.getTmpDir(), 'memlab-experiments');
    }
    initExperimentDir(experimentId) {
        const expsDir = joinAndProcessDir({}, this.getExperimentsDir());
        const expDir = joinAndProcessDir({}, expsDir, `exp-${experimentId}`);
        const controlWorkDir = joinAndProcessDir({}, expDir, 'control');
        const testWorkDir = joinAndProcessDir({}, expDir, 'test');
        return { controlWorkDir, testWorkDir };
    }
    // create a unique log file created for heap analysis output
    initNewHeapAnalysisLogFile(options = FileManager.defaultFileOption) {
        const dir = this.getHeapAnalysisLogDir(options);
        const file = path_1.default.join(dir, `analysis-${Utils_1.default.getUniqueID()}-out.log`);
        if (!fs_extra_1.default.existsSync(file)) {
            fs_extra_1.default.createFileSync(file);
        }
        return file;
    }
    getAndInitTSCompileIntermediateDir() {
        const dir = path_1.default.join(this.getTmpDir(), 'memlab-code');
        this.rmDir(dir);
        fs_extra_1.default.mkdirpSync(dir);
        return dir;
    }
    clearDataDirs(options = FileManager.defaultFileOption) {
        const curDataDir = this.getCurDataDir(options);
        if (!fs_extra_1.default.existsSync(curDataDir)) {
            return;
        }
        this.emptyDirIfExists(this.getWebSourceDir(options));
        this.emptyDirIfExists(this.getDebugDataDir(options));
        const dataSuffix = ['.heapsnapshot', '.json', '.png'];
        const files = fs_extra_1.default.readdirSync(curDataDir);
        for (const file of files) {
            inner: for (const suffix of dataSuffix) {
                if (file.endsWith(suffix)) {
                    const filepath = path_1.default.join(curDataDir, file);
                    fs_extra_1.default.unlinkSync(filepath);
                    break inner;
                }
            }
        }
    }
    removeSnapshotFiles(options = FileManager.defaultFileOption) {
        const curDataDir = this.getCurDataDir(options);
        if (!fs_extra_1.default.existsSync(curDataDir)) {
            return;
        }
        const dataSuffix = ['.heapsnapshot'];
        const files = fs_extra_1.default.readdirSync(curDataDir);
        for (const file of files) {
            inner: for (const suffix of dataSuffix) {
                if (file.endsWith(suffix)) {
                    const filepath = path_1.default.join(curDataDir, file);
                    fs_extra_1.default.unlinkSync(filepath);
                    break inner;
                }
            }
        }
    }
    emptyDirIfExists(dir) {
        if (this.isDirectory(dir)) {
            fs_extra_1.default.emptyDirSync(dir);
        }
    }
    emptyTraceLogDataDir(options = FileManager.defaultFileOption) {
        // all leak trace clusters
        this.emptyDirIfExists(this.getTraceClustersDir(options));
        // all JSON files for trace visualization
        this.emptyDirIfExists(this.getTraceJSONDir(options));
        // all unclassified clusters
        this.emptyDirIfExists(this.getUnclassifiedTraceClusterDir(options));
        // all unique cluster info
        this.emptyDirIfExists(this.getUniqueTraceClusterDir(options));
        // all heap analysis results
        this.emptyDirIfExists(this.getHeapAnalysisLogDir(options));
    }
    resetBrowserDir() {
        try {
            const browserDir = this.getChromeBinaryDir();
            const browserBinary = this.getChromeBinaryZipFile();
            if (fs_extra_1.default.existsSync(browserBinary)) {
                fs_extra_1.default.unlinkSync(browserBinary);
            }
            this.rmDir(browserDir);
            joinAndProcessDir({}, browserDir);
        }
        catch (e) {
            Console_1.default.error(Utils_1.default.getError(e).message);
        }
    }
    isDirectory(file) {
        if (!fs_extra_1.default.existsSync(file)) {
            return false;
        }
        const stats = fs_extra_1.default.statSync(file);
        return stats.isDirectory();
    }
    iterateAllFiles(dir, callback) {
        if (!this.isDirectory(dir)) {
            callback(dir);
            return;
        }
        const files = fs_extra_1.default.readdirSync(dir);
        files.forEach((file) => {
            const filepath = path_1.default.join(dir, file);
            this.iterateAllFiles(filepath, callback);
        });
    }
    rmWorkDir(options = FileManager.defaultFileOption) {
        try {
            this.rmDir(this.getWorkDir(options));
        }
        catch (e) {
            Console_1.default.error(Utils_1.default.getError(e).message);
        }
    }
    isWithinInternalDirectory(filePath) {
        const sep = path_1.default.sep;
        const internalDir = Constant_1.default.internalDir;
        return filePath.includes(`${sep}${internalDir}${sep}`);
    }
    createDefaultVisitOrderMetaFile(options = FileManager.defaultFileOption) {
        // if memlab/data/cur doesn't exist, return
        const curDataDir = this.getCurDataDir(options);
        if (!fs_extra_1.default.existsSync(curDataDir)) {
            return;
        }
        // if the snap-seq.json file exists, return
        const snapshotSeqMetaFile = this.getSnapshotSequenceMetaFile(options);
        if (fs_extra_1.default.existsSync(snapshotSeqMetaFile)) {
            return;
        }
        // if there is no .heapsnapshot file, return
        const files = fs_extra_1.default.readdirSync(curDataDir);
        const snapshotFile = files.find(file => file.endsWith('.heapsnapshot'));
        if (snapshotFile == null) {
            return;
        }
        // If there is at least one snapshot, create a snap-seq.json file.
        // First, get the meta file for leak detection in a single heap snapshot
        this.createDefaultVisitOrderMetaFileWithSingleSnapshot(options, snapshotFile);
    }
    // make sure the visit order meta file exists and points to a single
    // heap snapshot which may be outside of the working directory
    createOrOverrideVisitOrderMetaFileForExternalSnapshot(snapshotFile, options = FileManager.defaultFileOption) {
        // if memlab/data/cur doesn't exist, return
        const curDataDir = this.getCurDataDir(options);
        if (!fs_extra_1.default.existsSync(curDataDir)) {
            return;
        }
        // TODO: maybe remove the existing heap snapshot files
        // If there is at least one snapshot, create a snap-seq.json file.
        // First, get the meta file for leak detection in a single heap snapshot
        this.createDefaultVisitOrderMetaFileWithSingleSnapshot(options, snapshotFile);
    }
    createDefaultVisitOrderMetaFileWithSingleSnapshot(options = FileManager.defaultFileOption, snapshotFile) {
        const snapshotSeqMetaFile = this.getSnapshotSequenceMetaFile(options);
        const codeDataDir = this.getCodeDataDir();
        const singleSnapshotMetaFile = path_1.default.join(codeDataDir, 'visit-order-single-snapshot.json');
        const visitOrder = JSON.parse(fs_extra_1.default.readFileSync(singleSnapshotMetaFile, 'UTF-8'));
        // fill in snapshot file name for each entry with snapshot: true
        visitOrder.forEach(step => {
            if (step.snapshot === true) {
                step.snapshotFile = snapshotFile;
            }
        });
        // save the snapshot meta file
        fs_extra_1.default.writeFileSync(snapshotSeqMetaFile, JSON.stringify(visitOrder, null, 2), 'UTF-8');
    }
    /**
     * create visit order data structure based on specified
     * baseline, target, and final heap snapshots
     */
    createVisitOrderWithSnapshots(baselineSnapshot, targetSnapshot, finalSnapshot) {
        const snapshotTemplateFile = this.getSnapshotSequenceExternalTemplateFile();
        const visitOrder = JSON.parse(fs_extra_1.default.readFileSync(snapshotTemplateFile, 'UTF-8'));
        // fill in snapshot file name for each entry with snapshot: true
        visitOrder.forEach(step => {
            switch (step.name) {
                case 'baseline':
                    step.snapshotFile = baselineSnapshot;
                    break;
                case 'target':
                    step.snapshotFile = targetSnapshot;
                    break;
                case 'final':
                    step.snapshotFile = finalSnapshot;
                    break;
            }
        });
        return visitOrder;
    }
    initDirs(config, options = FileManager.defaultFileOption) {
        // cache the last processed memlab config instance
        // the instance should be a singleton
        this.memlabConfigCache = config;
        config.monoRepoDir = Constant_1.default.monoRepoDir;
        // make sure getWorkDir is called first before
        // any other get file or get dir calls
        const workDir = this.getWorkDir(options);
        // if errorWhenAbsent is set to true, make it
        // an error when the working directory does not exist
        if (options.errorWhenAbsent && !fs_extra_1.default.existsSync(workDir)) {
            throw Utils_1.default.haltOrThrow(`work dir does not exist: ${workDir}`);
        }
        // remember the current working directory
        // especially if this is a transcient working directory
        config.workDir = joinAndProcessDir(options, workDir);
        options = Object.assign(Object.assign({}, options), { workDir });
        config.dataBaseDir = joinAndProcessDir(options, this.getDataBaseDir(options));
        config.browserDir = joinAndProcessDir(options, this.getChromeBinaryDir());
        config.userDataDir = joinAndProcessDir(options, this.getUserDataDir(options));
        const outDir = joinAndProcessDir(options, this.getDataOutDir(options));
        config.curDataDir = joinAndProcessDir(options, this.getCurDataDir(options));
        config.webSourceDir = joinAndProcessDir(options, this.getWebSourceDir(options));
        config.debugDataDir = joinAndProcessDir(options, this.getDebugDataDir(options));
        config.dataBuilderDataDir = joinAndProcessDir(options, config.dataBaseDir, 'dataBuilder');
        config.persistentDataDir = joinAndProcessDir(options, this.getPersistDataDir(options));
        // register the default log file
        config.consoleLogFile = this.getConsoleBackupFile(options);
        Console_1.default.registerLogFile(config.consoleLogFile);
        config.runMetaFile = this.getRunMetaFile(options);
        config.snapshotSequenceFile = this.getSnapshotSequenceMetaFile(options);
        config.browserInfoSummary = path_1.default.join(config.curDataDir, 'browser-info.txt');
        config.exploreResultFile = this.getLeakSummaryFile(options);
        config.singleReportSummary = path_1.default.join(outDir, 'report.txt');
        config.unboundObjectCSV = path_1.default.join(outDir, 'unbound-object.csv');
        config.inputDataDir = joinAndProcessDir(options, this.getInputDataDir());
        config.reportOutDir = joinAndProcessDir(options, this.getReportOutDir(options));
        config.previewReportDir = joinAndProcessDir(options, this.getPreviewReportDir(options));
        config.viewJsonFile = path_1.default.join(config.reportOutDir, 'js', 'gc-path.js');
        config.cookieSettingFile = path_1.default.join(config.persistentDataDir, 'cookie-setting.json');
        config.traceClusterFile = path_1.default.join(config.persistentDataDir, 'trace-cluster.json');
        const loggerOutDir = joinAndProcessDir(options, this.getLoggerOutDir(options));
        // trace cluster meta info
        config.traceClusterOutDir = joinAndProcessDir(options, this.getTraceClustersDir(options));
        // detailed trace json files for visualization
        config.traceJsonOutDir = joinAndProcessDir(options, this.getTraceJSONDir(options));
        // heap analysis results
        config.heapAnalysisLogDir = joinAndProcessDir(options, this.getHeapAnalysisLogDir(options));
        config.metricsOutDir = joinAndProcessDir(options, loggerOutDir, 'metrics');
        config.reportScreenshotFile = path_1.default.join(outDir, 'report.png');
        config.externalRunMetaTemplateFile = this.getRunMetaExternalTemplateFile();
        config.externalSnapshotVisitOrderFile =
            this.getSnapshotSequenceExternalTemplateFile();
        joinAndProcessDir(options, this.getUniqueTraceClusterDir(options));
        config.newUniqueClusterDir = joinAndProcessDir(options, this.getNewUniqueTraceClusterDir(options));
        config.staleUniqueClusterDir = joinAndProcessDir(options, this.getStaleUniqueTraceClusterDir(options));
        config.currentUniqueClusterDir = joinAndProcessDir(options, this.getExistingUniqueTraceClusterDir(options));
        config.unclassifiedClusterDir = joinAndProcessDir(options, this.getUnclassifiedTraceClusterDir(options));
        config.allClusterSummaryFile = this.getAllClusterSummaryFile(options);
        this.createDefaultVisitOrderMetaFile(options);
    }
}
exports.FileManager = FileManager;
FileManager.transientInstanceIdx = 0;
FileManager.defaultFileOption = {};
exports.default = new FileManager();
