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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandCategory = void 0;
var CommandCategory;
(function (CommandCategory) {
    CommandCategory["COMMON"] = "COMMON";
    CommandCategory["DEV"] = "DEV";
    CommandCategory["MISC"] = "MISC";
})(CommandCategory = exports.CommandCategory || (exports.CommandCategory = {}));
class Command {
    constructor() {
        // If you are trying to add a new CLI command in MemLab,
        // DO NOT OVERRIDE any property or method in below in this class.
        // These methods are intended for internal orchestration
        // purposes. All commands should extend BaseCommand,
        // which contains the overridable hooks.
        this.parentCommand = null;
    }
    getCommandName() {
        const className = this.constructor.name;
        throw new Error(`${className}.getCommandName is not implemented`);
    }
    setParentCommand(parent) {
        this.parentCommand = parent;
    }
    getParentCommand() {
        return this.parentCommand;
    }
    getFullCommand() {
        const prefix = this.parentCommand
            ? this.parentCommand.getFullCommand() + ' '
            : '';
        return prefix + this.getCommandName();
    }
    getFullOptionsFromPrerequisiteChain() {
        const self = this;
        const uniqueOptions = new Map();
        const visitedCommands = new Set();
        const queue = [self];
        const excludedOptions = new Set(self.getExcludedOptions().map(option => option.getOptionName()));
        while (queue.length > 0) {
            const cur = queue.shift();
            const options = cur.getOptions();
            for (const option of options) {
                const optionName = option.getOptionName();
                if (excludedOptions.has(optionName)) {
                    continue;
                }
                if (!uniqueOptions.has(optionName)) {
                    uniqueOptions.set(optionName, option);
                }
            }
            visitedCommands.add(cur.getCommandName());
            for (const prereq of cur.getPrerequisites()) {
                if (!visitedCommands.has(prereq.getCommandName())) {
                    queue.push(prereq);
                }
            }
        }
        return [...uniqueOptions.values()];
    }
}
class BaseCommand extends Command {
    // The following terminal command will initiate with this command
    // `memlab <command-name>`
    getCommandName() {
        const className = this.constructor.name;
        throw new Error(`${className}.getCommandName is not implemented`);
    }
    // get a list of CLI option examples
    // examples will be displayed in helper text
    getExamples() {
        return [];
    }
    // get command's category, commands under the same category
    // are grouped together in helper text
    getCategory() {
        return CommandCategory.MISC;
    }
    // The description of this analysis will be printed by
    // `memlab` or `memlab help`
    getDescription() {
        const className = this.constructor.name;
        throw new Error(`${className}.getDescription is not implemented`);
    }
    // More detailed description or documentation about this command.
    // This will be printed as helper text in CLI for a specific command.
    // Documentation generator will also use the description returned here.
    getDocumentation() {
        return '';
    }
    // get a sequence of commands that must be executed before
    // running this command
    getPrerequisites() {
        return [];
    }
    // internal command will not be listed in helper
    isInternalCommand() {
        return false;
    }
    // get options supported by this command
    getOptions() {
        return [];
    }
    // commands from getPrerequisites may propagate
    // options that does not make sense for the
    // current command, this returns the list of
    // options that should be excluded from helper text
    getExcludedOptions() {
        return [];
    }
    // get subcommands of this command
    // for example command 'A' has two sub-commands 'B' and 'C'
    // CLI supports running in terminal: `memlab A B` or `memlab A C`
    // The parent command will be executed before its subcommands
    //
    // If this callback returns null or undefined, it means
    // the command will handle the dispatcher won't try to match and process
    // the subcommands (the command will handle sub-commands by itself).
    getSubCommands() {
        return [];
    }
    // Callback for `memlab <command-name>`
    // Do the memory analysis and print results in this callback
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = this.constructor.name;
            throw new Error(`${className}.run is not implemented`);
        });
    }
}
exports.default = BaseCommand;
