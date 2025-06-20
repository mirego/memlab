/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { ParsedArgs } from 'minimist';
import type { AnyRecord, MemLabConfig } from '@memlab/core';
import BaseCommand from './BaseCommand';
import CommandLoader from './CommandLoader';
type RunCommandOptions = {
    isPrerequisite?: boolean;
    commandIndex?: number;
    configFromOptions: AnyRecord;
};
type CommandDispatcherOptions = {
    commandLoader?: CommandLoader;
};
export declare class CommandDispatcher {
    private modules;
    private executedCommands;
    private executingCommandStack;
    constructor(options?: CommandDispatcherOptions);
    protected resetData(): void;
    dispatch(args: ParsedArgs): Promise<void>;
    parseOptions(command: BaseCommand, config: MemLabConfig, args: ParsedArgs): Promise<AnyRecord>;
    private mergeConfigFromOptions;
    private mergeArrays;
    private runCommand;
    runSubCommandIfAny(command: BaseCommand, args: ParsedArgs, runCmdOpt: RunCommandOptions): Promise<void>;
    private helper;
}
declare const _default: CommandDispatcher;
export default _default;
//# sourceMappingURL=Dispatcher.d.ts.map