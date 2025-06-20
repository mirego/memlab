/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { CLIOptions } from '@memlab/core';
import BaseCommand from '../../BaseCommand';
export default class GenerateCLIDocCommand extends BaseCommand {
    private modules;
    private generatedCommandInIndex;
    private universalOptions;
    getCommandName(): string;
    getDescription(): string;
    isInternalCommand(): boolean;
    setModulesMap(modules: Map<string, BaseCommand>): void;
    run(options: CLIOptions): Promise<void>;
    private generateDocs;
    private writeCommandCategories;
    private writeCategory;
    private writeCategoryHeader;
    private writeCommand;
    private writeTextWithNewLine;
    private touchFile;
    private writeCodeBlock;
    private writeCommandOptions;
}
//# sourceMappingURL=GenerateCLIDocCommand.d.ts.map