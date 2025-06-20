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
const chalk_1 = __importDefault(require("chalk"));
const BaseCommand_1 = __importDefault(require("../BaseCommand"));
const core_1 = require("@memlab/core");
const api_1 = require("@memlab/api");
const core_2 = require("@memlab/core");
const heap_analysis_1 = require("@memlab/heap-analysis");
const e2e_1 = require("@memlab/e2e");
class GetVersionCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'version';
    }
    getDescription() {
        return 'Show the versions of all memlab packages installed';
    }
    loadDepencyPackageInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            // require all sub-packages to register package information
            // memlab and cli packages already registered in the bin file
            // the following sub-packages are registered here lazily to
            // avoid too many file operations
            return Promise.all([
                (0, api_1.registerPackage)(),
                (0, core_2.registerPackage)(),
                (0, heap_analysis_1.registerPackage)(),
                (0, e2e_1.registerPackage)(),
            ]);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadDepencyPackageInfo();
            const packages = [...core_1.config.packageInfo].sort((p1, p2) => p1.name < p2.name ? 1 : -1);
            core_1.info.topLevel('');
            for (const pkg of packages) {
                const version = chalk_1.default.grey(`@${pkg.version}`);
                core_1.info.topLevel(` ${pkg.name}${version}`);
                if (core_1.config.verbose && pkg.packageLocation) {
                    core_1.info.lowLevel(`  ${pkg.packageLocation}`);
                }
            }
            core_1.info.topLevel('');
        });
    }
}
exports.default = GetVersionCommand;
