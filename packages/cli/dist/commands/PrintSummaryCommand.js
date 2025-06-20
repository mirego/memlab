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
const fs_extra_1 = __importDefault(require("fs-extra"));
const core_1 = require("@memlab/core");
const BaseCommand_1 = __importDefault(require("../BaseCommand"));
const core_2 = require("@memlab/core");
const SetWorkingDirectoryOption_1 = __importDefault(require("../options/SetWorkingDirectoryOption"));
class PrintSummaryCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'summary';
    }
    getDescription() {
        return 'Print summary of the last check leak run';
    }
    isInternalCommand() {
        return true;
    }
    getOptions() {
        return [new SetWorkingDirectoryOption_1.default()];
    }
    run(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const workDir = (_a = options.configFromOptions) === null || _a === void 0 ? void 0 : _a.workDir;
            const summaryFile = core_2.fileManager.getLeakSummaryFile({ workDir });
            if (!fs_extra_1.default.existsSync(summaryFile)) {
                core_1.utils.haltOrThrow('No MemLab leak summary found. Please make sure "memlab find-leaks" runs successfully first.');
            }
            const content = fs_extra_1.default.readFileSync(summaryFile, 'UTF-8');
            core_2.info.topLevel(content);
        });
    }
}
exports.default = PrintSummaryCommand;
