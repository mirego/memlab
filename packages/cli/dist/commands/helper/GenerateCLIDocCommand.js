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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const DocUtils_1 = __importDefault(require("./lib/DocUtils"));
const BaseCommand_1 = __importStar(require("../../BaseCommand"));
const core_1 = require("@memlab/core");
const UniversalOptions_1 = __importDefault(require("../../options/lib/UniversalOptions"));
class GenerateCLIDocCommand extends BaseCommand_1.default {
    constructor() {
        super(...arguments);
        this.modules = new Map();
        this.generatedCommandInIndex = new Set();
        this.universalOptions = UniversalOptions_1.default;
    }
    getCommandName() {
        return 'gen-cli-doc';
    }
    getDescription() {
        return 'generate CLI markdown documentations';
    }
    isInternalCommand() {
        return true;
    }
    setModulesMap(modules) {
        this.modules = modules;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const docsDir = core_1.fileManager.getDocDir();
            const cliDocsDir = path_1.default.join(docsDir, 'cli');
            this.generateDocs(cliDocsDir);
        });
    }
    generateDocs(cliDocsDir) {
        // first clean up the dir
        fs_extra_1.default.removeSync(cliDocsDir);
        fs_extra_1.default.mkdirSync(cliDocsDir);
        // create index markdown file
        const indexFile = path_1.default.join(cliDocsDir, 'CLI-commands.md');
        this.writeCommandCategories(indexFile);
    }
    writeCommandCategories(docFile) {
        this.writeTextWithNewLine(docFile, '# Command Line Interface');
        this.writeTextWithNewLine(docFile, `Install the memlab command line tool with npm:
\`\`\`bash
npm install -g memlab
\`\`\``);
        for (const category in BaseCommand_1.CommandCategory) {
            const commandsToPrintFirst = [];
            this.writeCategory(docFile, category, commandsToPrintFirst);
        }
    }
    writeCategory(docFile, category, commandsToPrintFirst) {
        // commands defined in commandsToPrintFirst
        const commands = [];
        for (const command of commandsToPrintFirst) {
            const name = command.getCommandName();
            if (this.generatedCommandInIndex.has(name)) {
                continue;
            }
            commands.push(command);
        }
        // other commands in this category
        for (const moduleEntries of this.modules) {
            const command = moduleEntries[1];
            if (category !== command.getCategory()) {
                continue;
            }
            if (command.isInternalCommand() && !core_1.config.verbose) {
                continue;
            }
            const name = command.getCommandName();
            if (this.generatedCommandInIndex.has(name)) {
                continue;
            }
            commands.push(command);
        }
        if (commands.length === 0) {
            return;
        }
        this.writeCategoryHeader(docFile, category);
        for (const command of commands) {
            this.writeCommand(docFile, command);
            this.generatedCommandInIndex.add(command.getCommandName());
        }
        this.writeTextWithNewLine(docFile, '');
    }
    writeCategoryHeader(docFile, category) {
        const categoryName = category.toUpperCase();
        this.writeTextWithNewLine(docFile, `\n## ${categoryName} Commands\n`);
    }
    writeCommand(docFile, command, indent = '') {
        var _a, _b;
        const name = command.getFullCommand();
        const desc = core_1.utils.upperCaseFirstCharacter(command.getDescription().trim());
        const cmdDoc = command.getDocumentation().trim();
        // write command title
        this.writeTextWithNewLine(docFile, `\n###${indent} memlab ${name}\n`);
        // write description
        this.writeTextWithNewLine(docFile, `${desc}\n`);
        // write detailed command documentation
        if (cmdDoc.length > 0) {
            this.writeTextWithNewLine(docFile, `${cmdDoc}\n`);
        }
        // get example
        const examples = command.getExamples();
        const example = (_a = examples[0]) !== null && _a !== void 0 ? _a : '';
        // write command synopsis
        const cmd = DocUtils_1.default.generateExampleCommand(name, example);
        this.writeCodeBlock(docFile, cmd, 'bash');
        // write command examples if there is any
        const exampleBlock = examples
            .slice(1)
            .map(example => DocUtils_1.default.generateExampleCommand(name, example))
            .join('\n');
        if (exampleBlock.length > 0) {
            this.writeTextWithNewLine(docFile, '\n#### examples\n');
            this.writeCodeBlock(docFile, exampleBlock, 'bash');
        }
        // write options
        this.writeCommandOptions(docFile, command);
        const subCommands = (_b = command.getSubCommands()) !== null && _b !== void 0 ? _b : [];
        for (const subCommand of subCommands) {
            this.writeCommand(docFile, subCommand, indent + '#');
        }
    }
    writeTextWithNewLine(docFile, content) {
        this.touchFile(docFile);
        fs_extra_1.default.appendFileSync(docFile, `${content}\n`, 'UTF-8');
    }
    touchFile(docFile) {
        if (!fs_extra_1.default.existsSync(docFile)) {
            fs_extra_1.default.writeFileSync(docFile, '', 'UTF-8');
        }
    }
    writeCodeBlock(docFile, code, codeType = '') {
        let normalizedCode = code;
        while (normalizedCode.endsWith('\n')) {
            normalizedCode = normalizedCode.slice(0, normalizedCode.length - 1);
        }
        this.touchFile(docFile);
        fs_extra_1.default.appendFileSync(docFile, '```' + codeType + '\n' + normalizedCode + '\n```\n', 'UTF-8');
    }
    writeCommandOptions(docFile, command) {
        const options = [
            ...command.getFullOptionsFromPrerequisiteChain(),
            ...this.universalOptions,
        ];
        if (options.length === 0) {
            return;
        }
        this.writeTextWithNewLine(docFile, '\n**Options**:');
        const optionsText = [];
        for (const option of options) {
            let header = `**\`--${option.getOptionName()}\`**`;
            if (option.getOptionShortcut()) {
                header += `, **\`-${option.getOptionShortcut()}\`**`;
            }
            const desc = option.getDescription();
            optionsText.push({ header, desc });
        }
        for (const optionText of optionsText) {
            const header = optionText.header;
            const msg = ` * ${header}: ${optionText.desc}`;
            this.writeTextWithNewLine(docFile, msg);
        }
    }
}
exports.default = GenerateCLIDocCommand;
