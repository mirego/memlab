/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import { Chalk } from 'chalk';
import { type MemLabConfig } from './Config';
import { AnyValue, ConsoleOutputAnnotation, ConsoleOutputOptions } from './Types';
interface MemlabConsoleStyles {
    top: (msg: string) => string;
    high: Chalk;
    mid: Chalk;
    low: Chalk;
    success: Chalk;
    error: Chalk;
    warning: Chalk;
}
declare class MemLabConsole {
    private config;
    private sections;
    private log;
    private logFileSet;
    private styles;
    private static singleton;
    annotations: {
        [key: string]: ConsoleOutputAnnotation;
    };
    protected constructor();
    static getInstance(): MemLabConsole;
    private get isTextOutput();
    private get outStream();
    private style;
    private init;
    private getLastSection;
    private getLastMsg;
    private logMsg;
    private tryFlush;
    private flushLog;
    private pushMsg;
    private clearPrevMsgInLastSection;
    private clearPrevMsgInSection;
    private clearPrevSection;
    private shouldBeConcise;
    private clearPrevOverwriteMsg;
    private printStr;
    writeOutput(output: string): void;
    registerLogFile(logFile: string): void;
    unregisterLogFile(logFile: string): void;
    beginSection(name: string): void;
    endSection(name: string): void;
    setConfig(config: MemLabConfig): void;
    table(...args: AnyValue[]): void;
    trace(): void;
    topLevel(msg: string): void;
    highLevel(msg: string): void;
    midLevel(msg: string): void;
    lowLevel(msg: string, options?: ConsoleOutputOptions): void;
    success(msg: string): void;
    criticalError(msg: string): void;
    error(msg: string): void;
    warning(msg: string): void;
    nextLine(): void;
    overwrite(msg: string, options?: {
        level?: keyof MemlabConsoleStyles;
    }): void;
    waitForConsole(query: string): Promise<string>;
    progress(cur: number, total: number, options?: {
        message?: string;
    }): void;
    flush(): void;
}
declare const _default: MemLabConsole;
export default _default;
//# sourceMappingURL=Console.d.ts.map