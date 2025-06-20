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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const BaseCommand_1 = __importDefault(require("./BaseCommand"));
const GenerateCLIDocCommand_1 = __importDefault(require("./commands/helper/GenerateCLIDocCommand"));
class CommandLoader {
    constructor() {
        this.isLoaded = false;
        this.OSSModules = new Map();
        this.modules = new Map();
        this.modulePaths = new Map();
    }
    getModules() {
        if (!this.isLoaded) {
            this.registerCommands();
        }
        return this.modules;
    }
    getModulePaths() {
        if (!this.isLoaded) {
            this.registerCommands();
        }
        return this.modulePaths;
    }
    registerCommands() {
        const modulesDir = path_1.default.resolve(__dirname, 'commands');
        this.registerCommandsFromDir(modulesDir);
        this.postRegistration();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldRegisterCommand(command) {
        return true;
    }
    registerCommandsFromDir(modulesDir) {
        const moduleFiles = fs_1.default.readdirSync(modulesDir);
        for (const moduleFile of moduleFiles) {
            const modulePath = path_1.default.join(modulesDir, moduleFile);
            // recursively import modules from subdirectories
            if (fs_1.default.lstatSync(modulePath).isDirectory()) {
                this.registerCommandsFromDir(modulePath);
                continue;
            }
            // only import modules files ends with with Command.js
            if (!moduleFile.endsWith('Command.js')) {
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const module = require(modulePath);
            const moduleConstructor = typeof module.default === 'function' ? module.default : module;
            const moduleInstance = new moduleConstructor();
            if (!(moduleInstance instanceof BaseCommand_1.default)) {
                core_1.utils.haltOrThrow('loading a command that does not extend BaseCommand');
            }
            if (!this.shouldRegisterCommand(moduleInstance)) {
                continue;
            }
            const commandName = moduleInstance.getCommandName();
            const loadingOssCommand = !core_1.fileManager.isWithinInternalDirectory(modulePath);
            // register OSS commands
            if (loadingOssCommand) {
                this.OSSModules.set(commandName, moduleInstance);
            }
            // register all commands
            if (this.modules.has(commandName)) {
                // resolve conflict
                const ossCommandLoaded = !core_1.fileManager.isWithinInternalDirectory(this.modulePaths.get(commandName));
                if (ossCommandLoaded === loadingOssCommand) {
                    // when both commands are open source or neither are open source
                    core_1.info.midLevel(`MemLab command ${commandName} is already registered`);
                }
                else if (!ossCommandLoaded && loadingOssCommand) {
                    // when open source command tries to overwrite non-open source command
                    continue;
                }
            }
            this.modules.set(commandName, moduleInstance);
            this.modulePaths.set(commandName, modulePath);
        }
    }
    postRegistration() {
        const cliDocCommand = new GenerateCLIDocCommand_1.default();
        const instance = this.modules.get(cliDocCommand.getCommandName());
        if (instance) {
            instance.setModulesMap(this.OSSModules);
        }
    }
}
exports.default = CommandLoader;
