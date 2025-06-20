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
const child_process_1 = __importDefault(require("child_process"));
const BaseCommand_1 = __importDefault(require("../../BaseCommand"));
const core_1 = require("@memlab/core");
class CheckXvfbSupportCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'check-xvfb';
    }
    getDescription() {
        return 'if Xvfb is installed on the machine, enable it';
    }
    isInternalCommand() {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ret = child_process_1.default.execSync('command -v xvfb-run').toString();
                if (ret) {
                    core_1.config.machineSupportsXVFB = true;
                }
            }
            catch (_a) {
                // the env doesn't support XVFB, no need to do anything;
            }
            if (core_1.config.verbose) {
                core_1.info.lowLevel(`Xvfb supports: ${core_1.config.machineSupportsXVFB}`);
            }
        });
    }
}
exports.default = CheckXvfbSupportCommand;
