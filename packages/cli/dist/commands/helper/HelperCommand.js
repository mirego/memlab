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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const string_width_1 = __importDefault(require("string-width"));
const core_1 = require("@memlab/core");
const heap_analysis_1 = require("@memlab/heap-analysis");
const DocUtils_1 = __importDefault(require("./lib/DocUtils"));
const CommandOrder_1 = __importDefault(require("./lib/CommandOrder"));
const BaseCommand_1 = __importStar(require("../../BaseCommand"));
const UniversalOptions_1 = __importDefault(require("../../options/lib/UniversalOptions"));
const CLIUtils_1 = require("../../lib/CLIUtils");
class HelperCommand extends BaseCommand_1.default {
    constructor() {
        super(...arguments);
        this.printedCommand = new Set();
        this.universalOptions = UniversalOptions_1.default;
    }
    // The following terminal command will initiate with this command
    // `memlab <command-name>`
    getCommandName() {
        return 'help';
    }
    // The description of this analysis will be printed by
    // `memlab` or `memlab help`
    getDescription() {
        return 'list all MemLab CLI commands or print helper text for a specific command';
    }
    getExamples() {
        return ['<COMMAND> [SUB-COMMANDS]'];
    }
    setUniversalOptions(options) {
        this.universalOptions = options;
    }
    printHeader(options) {
        var _a;
        const indent = (_a = options.indent) !== null && _a !== void 0 ? _a : '';
        core_1.info.topLevel(`\n${indent}memlab: memory leak detector for front-end JS\n`);
    }
    printCommandCategories(options) {
        for (const category in BaseCommand_1.CommandCategory) {
            const item = CommandOrder_1.default.find(item => item.category === category);
            const commandsToPrintFirst = heap_analysis_1.heapConfig.isCliInteractiveMode
                ? []
                : item
                    ? item.commands
                    : [];
            this.printCategory(category, commandsToPrintFirst, options);
        }
    }
    printCategoryHeader(category, options) {
        var _a;
        const indent = (_a = options.indent) !== null && _a !== void 0 ? _a : '  ';
        const categoryName = category.toUpperCase();
        core_1.info.topLevel(chalk_1.default.bold(`${indent}${categoryName} COMMANDS`));
        core_1.info.topLevel('');
    }
    printCategory(category, commandsToPrintFirst, options) {
        const commandsToPrint = [];
        for (const command of commandsToPrintFirst) {
            const name = command.getCommandName();
            if (this.printedCommand.has(name)) {
                continue;
            }
            commandsToPrint.push(command);
            this.printedCommand.add(name);
        }
        // print other commands in this category
        for (const moduleEntries of options.modules) {
            const command = moduleEntries[1];
            if (category !== command.getCategory()) {
                continue;
            }
            if (command.isInternalCommand() && !core_1.config.verbose) {
                continue;
            }
            const name = command.getCommandName();
            if (this.printedCommand.has(name)) {
                continue;
            }
            commandsToPrint.push(command);
            this.printedCommand.add(name);
        }
        if (commandsToPrint.length === 0) {
            return;
        }
        this.printCategoryHeader(category, options);
        for (const command of commandsToPrint) {
            this.printCommand(command, options.indent);
        }
        core_1.info.topLevel('');
    }
    getCommandOptionsSummary(command, indent = '') {
        const options = command.getFullOptionsFromPrerequisiteChain();
        if (options.length === 0) {
            return '';
        }
        const width = Math.min(CLIUtils_1.READABLE_CMD_FLAG_WIDTH, process.stdout.columns);
        let summary = '';
        let curLine = chalk_1.default.bold(`${indent}Options:`);
        for (const option of options) {
            const optionToAppend = ' --' + option.getOptionName();
            if ((0, string_width_1.default)(curLine + optionToAppend) > width) {
                summary += (summary.length > 0 ? '\n' : '') + curLine;
                curLine = indent + '        ';
            }
            curLine += optionToAppend;
        }
        return summary + (summary.length > 0 ? '\n' : '') + curLine;
    }
    printOptions(command, extraIndent = '') {
        const options = [
            ...command.getFullOptionsFromPrerequisiteChain(),
            ...this.universalOptions,
        ];
        if (options.length === 0) {
            return;
        }
        const indent = '  ' + extraIndent;
        core_1.info.topLevel('\n' + extraIndent + chalk_1.default.bold('COMMAND LINE OPTIONS'));
        const optionsText = [];
        for (const option of options) {
            let header = `--${option.getOptionName()}`;
            if (option.getOptionShortcut()) {
                header += `, -${option.getOptionShortcut()}`;
            }
            const desc = option.getDescription();
            optionsText.push({ header, desc });
        }
        const headerLength = optionsText.reduce((acc, cur) => Math.max(acc, cur.header.length), 0);
        for (const optionText of optionsText) {
            const msg = this.formatOptionText(optionText, indent, headerLength);
            core_1.info.topLevel(`\n${msg}`);
        }
    }
    formatOptionText(optionText, indent, headerLength) {
        const header = chalk_1.default.green(optionText.header);
        const prefix = (0, CLIUtils_1.getBlankSpaceString)(headerLength - optionText.header.length);
        const headerString = `${indent}${prefix}${header} `;
        const headerStringWidth = (0, string_width_1.default)(headerString);
        const maxWidth = Math.min(process.stdout.columns, CLIUtils_1.READABLE_TEXT_WIDTH);
        const descString = (0, CLIUtils_1.alignTextInBlock)(optionText.desc, {
            leftIndent: headerStringWidth,
            lineLength: maxWidth,
        });
        return `${headerString}${descString.substring(headerStringWidth)}`;
    }
    printCommand(command, extraIndent = '', options = {}) {
        var _a;
        const indent = '  ' + extraIndent;
        const name = command.getFullCommand();
        const desc = core_1.utils.upperCaseFirstCharacter(command.getDescription().trim());
        const cmdDoc = command.getDocumentation().trim();
        // get example
        const examples = command.getExamples();
        const example = (_a = examples[0]) !== null && _a !== void 0 ? _a : '';
        // write command synopsis
        const cmd = DocUtils_1.default.generateExampleCommand(name, example, {
            descriptionAsBashComment: false,
        });
        let msg = DocUtils_1.default.indentText(cmd, indent);
        msg += `\n${DocUtils_1.default.indentText(desc, indent)}`;
        if (options.printOptions && cmdDoc.length > 0) {
            const cmdDocBlock = (0, CLIUtils_1.alignTextInBlock)(cmdDoc, {
                leftIndent: indent.length + 2,
            });
            msg += `\n\n${chalk_1.default.grey(cmdDocBlock)}`;
        }
        core_1.info.topLevel(msg);
        // print options info
        if (options.printOptions) {
            // print full options description
            this.printOptions(command, indent);
        }
        else {
            // print options list summary
            const options = this.getCommandOptionsSummary(command, indent);
            if (options.length > 0) {
                core_1.info.topLevel(chalk_1.default.grey(`${options}`));
            }
        }
        core_1.info.topLevel('');
    }
    printHelperTextForCommand(command, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // print helper text for a specific command
            this.printCommand(command, options.indent, options);
            // print helper text for its subcommands
            const subcommands = (_a = command.getSubCommands()) !== null && _a !== void 0 ? _a : [];
            const subOptions = Object.assign({}, options);
            subOptions.indent = (subOptions.indent || '') + ' ';
            for (const subcommand of subcommands) {
                subOptions.command = subcommand;
                yield this.run(subOptions);
            }
        });
    }
    printFullHelperTextForCommand(args, modules) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // get the command to print
            let map = modules;
            let command;
            const commandNames = [...args._];
            while (commandNames.length > 0) {
                const name = commandNames.shift();
                if (!name) {
                    break;
                }
                command = map.get(name);
                if (!command) {
                    break;
                }
                const subCommands = (_a = command.getSubCommands()) !== null && _a !== void 0 ? _a : [];
                map = new Map(subCommands.map((cmd) => [cmd.getCommandName(), cmd]));
            }
            if (!command) {
                throw core_1.utils.haltOrThrow(`Could not find command: memlab ${args._.join(' ')}`);
            }
            // print the helper text of the command
            core_1.info.topLevel('');
            this.printCommand(command, '', { printOptions: true, printDoc: true });
            // print the helper text of the subcommands
            const subCommands = (_b = command.getSubCommands()) !== null && _b !== void 0 ? _b : [];
            if (subCommands.length > 0) {
                core_1.info.topLevel(chalk_1.default.bold('  SUB-COMMANDS\n'));
                for (const subCommand of subCommands) {
                    this.printCommand(subCommand, '  ');
                }
            }
        });
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.printedCommand.clear();
            if (options.command) {
                yield this.printHelperTextForCommand(options.command, options);
            }
            else if (options.cliArgs && options.cliArgs._.length > 0) {
                yield this.printFullHelperTextForCommand(options.cliArgs, options.modules);
            }
            else {
                // print helper text for all commands
                this.printHeader(options);
                this.printCommandCategories(options);
            }
        });
    }
}
exports.default = HelperCommand;
// add the helper command into the common commands
(_a = CommandOrder_1.default === null || CommandOrder_1.default === void 0 ? void 0 : CommandOrder_1.default.find(item => item.category === BaseCommand_1.CommandCategory.COMMON)) === null || _a === void 0 ? void 0 : _a.commands.push(new HelperCommand());
