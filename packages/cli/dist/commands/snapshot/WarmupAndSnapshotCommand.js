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
const BaseCommand_1 = __importDefault(require("../../BaseCommand"));
const SetWorkingDirectoryOption_1 = __importDefault(require("../../options/SetWorkingDirectoryOption"));
const InitDirectoryCommand_1 = __importDefault(require("../InitDirectoryCommand"));
const WarmupAppCommand_1 = __importDefault(require("../WarmupAppCommand"));
const TakeSnapshotCommand_1 = __importDefault(require("./TakeSnapshotCommand"));
class WarmupAndSnapshotCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'warmup-and-snapshot';
    }
    getDescription() {
        return 'Warm up server and take heap snapshots';
    }
    getDocumentation() {
        const warmupCommand = new WarmupAppCommand_1.default();
        const warmupCLI = `memlab ${warmupCommand.getCommandName()}`;
        const takeSnapshotCommand = new TakeSnapshotCommand_1.default();
        const snapshotCLI = `memlab ${takeSnapshotCommand.getCommandName()}`;
        return ('This is equivalent to running ' +
            `\`${warmupCLI}\` and \`${snapshotCLI}\`.`);
    }
    getExamples() {
        return [
            {
                description: 'specify a test scenario file, memlab will ' +
                    'warm up the server and take heap snapshots',
                cliOptionExample: '--scenario <TEST_SCENARIO_FILE>',
            },
            '--scenario /tmp/test-scenario.js',
            {
                description: new SetWorkingDirectoryOption_1.default().getDescription(),
                cliOptionExample: '--scenario /tmp/test-scenario.js --work-dir /tmp/test-1/',
            },
        ];
    }
    getPrerequisites() {
        return [
            new InitDirectoryCommand_1.default(),
            new WarmupAppCommand_1.default(),
            new TakeSnapshotCommand_1.default(),
        ];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            // do nothing
        });
    }
}
exports.default = WarmupAndSnapshotCommand;
