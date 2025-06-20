/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { CLIOptions, CommandOptionExample, Nullable, Optional } from '@memlab/core';
import { BaseOption } from '@memlab/core';
export declare enum CommandCategory {
    COMMON = "COMMON",
    DEV = "DEV",
    MISC = "MISC"
}
declare abstract class Command {
    getCommandName(): string;
    private parentCommand;
    setParentCommand(parent: BaseCommand): void;
    getParentCommand(): Nullable<BaseCommand>;
    getFullCommand(): string;
    getFullOptionsFromPrerequisiteChain(): BaseOption[];
}
export default class BaseCommand extends Command {
    getCommandName(): string;
    getExamples(): CommandOptionExample[];
    getCategory(): CommandCategory;
    getDescription(): string;
    getDocumentation(): string;
    getPrerequisites(): BaseCommand[];
    isInternalCommand(): boolean;
    getOptions(): BaseOption[];
    getExcludedOptions(): BaseOption[];
    getSubCommands(): Optional<BaseCommand[]>;
    run(_options: CLIOptions): Promise<void>;
}
export {};
//# sourceMappingURL=BaseCommand.d.ts.map