/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { MemLabConfig } from './Config';
import type { AnyValue, E2EStepInfo, FileOption } from './Types';
/** @internal */
export declare function joinAndProcessDir(options: FileOption, ...args: AnyValue[]): string;
/** @internal */
export declare class FileManager {
    private memlabConfigCache;
    getDefaultWorkDir(): string;
    generateTmpHeapDir(): string;
    private static transientInstanceIdx;
    static defaultFileOption: FileOption;
    getWorkDir(options?: FileOption): string;
    getChromeBinaryZipFile(): string;
    getChromeBinaryTimeStampFile(): string;
    getChromeBinaryDir(): string;
    getDataBaseDir(options?: FileOption): string;
    getCodeDataDir(): string;
    getClusterSampleDataDir(): string;
    getUserDataDir(options?: FileOption): string;
    clearUserDataDir(options?: FileOption): void;
    getCurDataDir(options?: FileOption): string;
    getConsoleBackupFile(options?: FileOption): string;
    getWebSourceDir(options?: FileOption): string;
    getWebSourceMetaFile(options?: FileOption): string;
    getDebugDataDir(options?: FileOption): string;
    getDebugSourceFile(options?: FileOption): string;
    getPersistDataDir(options?: FileOption): string;
    getLoggerOutDir(options?: FileOption): string;
    getHeapAnalysisLogDir(options?: FileOption): string;
    getHeapSaveLogJSONFile(options?: FileOption): string;
    getTraceClustersDir(options?: FileOption): string;
    getTraceJSONDir(options?: FileOption): string;
    getUnclassifiedTraceClusterDir(options?: FileOption): string;
    getUniqueTraceClusterDir(options?: FileOption): string;
    getNewUniqueTraceClusterDir(options?: FileOption): string;
    getStaleUniqueTraceClusterDir(options?: FileOption): string;
    getAllClusterSummaryFile(options?: FileOption): string;
    getExistingUniqueTraceClusterDir(options?: FileOption): string;
    getAllFilesInDir(dir: string): string[];
    getDataOutDir(options?: FileOption): string;
    getCoreProjectBaseDir(): string;
    getMonoRepoDir(): string;
    getDocDir(): string;
    getReportOutDir(options?: FileOption): string;
    getPreviewReportDir(options?: FileOption): string;
    getLeakSummaryFile(options?: FileOption): string;
    getRunMetaFile(options?: FileOption): string;
    getRunMetaExternalTemplateFile(): string;
    getSnapshotSequenceMetaFile(options?: FileOption): string;
    getSnapshotSequenceExternalTemplateFile(): string;
    getInputDataDir(): string;
    getAllFilesInSubDirs(dir: string): string[];
    getTmpDir(): string;
    rmDir(dir: string): void;
    getExperimentsDir(): string;
    initExperimentDir(experimentId: string): {
        controlWorkDir: string;
        testWorkDir: string;
    };
    initNewHeapAnalysisLogFile(options?: FileOption): string;
    getAndInitTSCompileIntermediateDir(): string;
    clearDataDirs(options?: FileOption): void;
    removeSnapshotFiles(options?: FileOption): void;
    emptyDirIfExists(dir: string): void;
    emptyTraceLogDataDir(options?: FileOption): void;
    resetBrowserDir(): void;
    isDirectory(file: string): boolean;
    iterateAllFiles(dir: string, callback: (filepath: string) => AnyValue): void;
    rmWorkDir(options?: FileOption): void;
    isWithinInternalDirectory(filePath: string): boolean;
    createDefaultVisitOrderMetaFile(options?: FileOption): void;
    createOrOverrideVisitOrderMetaFileForExternalSnapshot(snapshotFile: string, options?: FileOption): void;
    createDefaultVisitOrderMetaFileWithSingleSnapshot(options: FileOption | undefined, snapshotFile: string): void;
    /**
     * create visit order data structure based on specified
     * baseline, target, and final heap snapshots
     */
    createVisitOrderWithSnapshots(baselineSnapshot: string, targetSnapshot: string, finalSnapshot: string): E2EStepInfo[];
    initDirs(config: MemLabConfig, options?: FileOption): void;
}
declare const _default: FileManager;
export default _default;
//# sourceMappingURL=FileManager.d.ts.map