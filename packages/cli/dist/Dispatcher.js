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
exports.CommandDispatcher = void 0;
const core_1 = require("@memlab/core");
const HelperCommand_1 = __importDefault(require("./commands/helper/HelperCommand"));
const UniversalOptions_1 = __importDefault(require("./options/lib/UniversalOptions"));
const CommandLoader_1 = __importDefault(require("./CommandLoader"));
const helperCommand = new HelperCommand_1.default();
class CommandDispatcher {
    constructor(options = {}) {
        var _a;
        this.resetData();
        // auto load all command modules
        const commandLoader = (_a = options.commandLoader) !== null && _a !== void 0 ? _a : new CommandLoader_1.default();
        this.modules = commandLoader.getModules();
    }
    resetData() {
        this.executedCommands = new Set();
        this.executingCommandStack = [];
    }
    dispatch(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.resetData();
            // triggered by `memlab` (without specific command)
            if (!args._ || !(args._.length >= 1)) {
                core_1.info.error('\n  command argument missing');
                yield this.helper(args);
                return;
            }
            const command = args._[0];
            // invalid command, e.g., `memlab xyz`
            if (!this.modules.has(command)) {
                yield this.helper(args);
                return;
            }
            // `memlab <COMMAND> <SUB-COMMAND> -h`
            if (args.h || args.help) {
                yield this.helper(args);
                return;
            }
            // `memlab help <COMMAND> <SUB-COMMAND>`
            if (command === helperCommand.getCommandName()) {
                yield this.helper(Object.assign(Object.assign({}, args), { _: args._.slice(1) }));
                return;
            }
            const module = this.modules.get(command);
            this.executedCommands = new Set();
            this.executingCommandStack = [];
            yield this.runCommand(module, args);
        });
    }
    parseOptions(command, config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = [...UniversalOptions_1.default, ...command.getOptions()];
            const configFromOptions = Object.create(null);
            for (const option of options) {
                const ret = yield option.run(config, args);
                if (ret) {
                    this.mergeConfigFromOptions(configFromOptions, ret);
                }
            }
            return configFromOptions;
        });
    }
    mergeConfigFromOptions(to, from) {
        for (const key in from) {
            if (Array.isArray(to[key]) && Array.isArray(from[key])) {
                // both are arrays, merge them
                this.mergeArrays(to[key], from[key]);
            }
            else if (from[key] == null || to[key] == null) {
                // one of them is null, use the other one
                to[key] = to[key] || from[key];
            }
            else {
                // both have existing values, first one wins
                core_1.info.warning(`Merge conflict CLI options key: ${key}`);
            }
        }
        return to;
    }
    mergeArrays(arr1, arr2) {
        if (arr1 == null) {
            return arr2;
        }
        if (arr2 == null) {
            return arr1;
        }
        for (const v of arr2) {
            arr1.push(v);
        }
        return arr1;
    }
    runCommand(command, args, runCmdOpt = { configFromOptions: {} }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const commandName = command.getCommandName();
            // make sure commands on the prerequisite are only executed once
            if (this.executedCommands.has(commandName)) {
                return;
            }
            this.executingCommandStack.push(commandName);
            // execute prerequisites
            const prerequisites = command.getPrerequisites();
            for (const prereq of prerequisites) {
                const prereqName = prereq.getCommandName();
                if (this.executingCommandStack.indexOf(prereqName) > 0) {
                    throw new Error(`circular prerequisite reference: ${commandName} <--> ${prereqName}`);
                }
                yield this.runCommand(prereq, args, Object.assign({ isPrerequisite: true }, runCmdOpt));
            }
            // parse command line options
            const c = yield this.parseOptions(command, core_1.config, args);
            Object.assign(runCmdOpt.configFromOptions, c);
            const { configFromOptions } = runCmdOpt;
            // execute command
            yield command.run({ cliArgs: args, configFromOptions });
            // recommand CLI command and flags
            core_1.config.setRunInfo('command', process.argv.slice(2).join(' '));
            if (runCmdOpt.isPrerequisite !== true) {
                // execute subcommands
                const commandIndex = ((_a = runCmdOpt.commandIndex) !== null && _a !== void 0 ? _a : 0) + 1;
                const runSubCmdOpt = Object.assign(Object.assign({}, runCmdOpt), { commandIndex });
                yield this.runSubCommandIfAny(command, args, runSubCmdOpt);
            }
            this.executingCommandStack.pop();
            this.executedCommands.add(commandName);
        });
    }
    runSubCommandIfAny(command, args, runCmdOpt) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const subCommandIndex = (_a = runCmdOpt.commandIndex) !== null && _a !== void 0 ? _a : 0;
            if (args._.length <= subCommandIndex) {
                return;
            }
            const subCommands = command.getSubCommands();
            // if the command will handle the sub-commands by itself
            if (subCommands == null) {
                return;
            }
            for (const subCommand of subCommands) {
                if (subCommand.getCommandName() === args._[subCommandIndex]) {
                    yield this.runCommand(subCommand, args, runCmdOpt);
                    return;
                }
            }
            core_1.info.error(`Invalid sub-command \`${args._[subCommandIndex]}\` of \`${command.getCommandName()}\`\n`);
            yield this.helper(args, command);
        });
    }
    helper(cliArgs, command = null) {
        return __awaiter(this, void 0, void 0, function* () {
            yield helperCommand.run({
                modules: this.modules,
                command,
                cliArgs,
                indent: '  ',
            });
        });
    }
}
exports.CommandDispatcher = CommandDispatcher;
exports.default = new CommandDispatcher();
