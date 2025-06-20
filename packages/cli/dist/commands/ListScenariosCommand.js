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
const e2e_1 = require("@memlab/e2e");
const core_1 = require("@memlab/core");
class ListScenariosCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'list';
    }
    getDescription() {
        return 'List all test scenarios';
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            const names = e2e_1.defaultTestPlanner.getAppNames();
            core_1.info.topLevel(`All available ${chalk_1.default.yellow('apps')} and ${chalk_1.default.green('interactions')}:`);
            for (const name of names) {
                const targets = e2e_1.defaultTestPlanner
                    .getTargetNames(name)
                    .map(name => chalk_1.default.green(name))
                    .join(chalk_1.default.grey(', '));
                core_1.info.topLevel(`\n${chalk_1.default.yellow(name)}: ${targets}`);
            }
            core_1.info.topLevel('');
        });
    }
}
exports.default = ListScenariosCommand;
