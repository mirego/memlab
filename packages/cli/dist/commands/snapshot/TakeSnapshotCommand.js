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
const Snapshot_1 = require("./Snapshot");
const CleanRunDataCommand_1 = __importDefault(require("../CleanRunDataCommand"));
const FullExecutionOption_1 = __importDefault(require("../../options/e2e/FullExecutionOption"));
const AppOption_1 = __importDefault(require("../../options/e2e/AppOption"));
const InteractionOption_1 = __importDefault(require("../../options/e2e/InteractionOption"));
const SkipSnapshotOption_1 = __importDefault(require("../../options/e2e/SkipSnapshotOption"));
const SkipScreenshotOption_1 = __importDefault(require("../../options/e2e/SkipScreenshotOption"));
const SkipGCOption_1 = __importDefault(require("../../options/e2e/SkipGCOption"));
const SkipScrollOption_1 = __importDefault(require("../../options/e2e/SkipScrollOption"));
const SkipExtraOperationOption_1 = __importDefault(require("../../options/e2e/SkipExtraOperationOption"));
const RunningModeOption_1 = __importDefault(require("../../options/e2e/RunningModeOption"));
const RemoteBrowserDebugOption_1 = __importDefault(require("../../options/e2e/RemoteBrowserDebugOption"));
const ScenarioFileOption_1 = __importDefault(require("../../options/e2e/ScenarioFileOption"));
const SetDeviceOption_1 = __importDefault(require("../../options/e2e/SetDeviceOption"));
const DisableXvfbOption_1 = __importDefault(require("../../options/e2e/DisableXvfbOption"));
const InitDirectoryCommand_1 = __importDefault(require("../InitDirectoryCommand"));
const CheckXvfbSupportCommand_1 = __importDefault(require("./CheckXvfbSupportCommand"));
const HeadfulBrowserOption_1 = __importDefault(require("../../options/e2e/HeadfulBrowserOption"));
const DisplayLeakOutlinesOptions_1 = __importDefault(require("../../options/e2e/DisplayLeakOutlinesOptions"));
const SetUserAgentOption_1 = __importDefault(require("../../options/e2e/SetUserAgentOption"));
const DisableWebSecurityOption_1 = __importDefault(require("../../options/e2e/DisableWebSecurityOption"));
const EnableJSRewriteOption_1 = __importDefault(require("../../options/e2e/EnableJSRewriteOption"));
const EnableJSInterceptOption_1 = __importDefault(require("../../options/e2e/EnableJSInterceptOption"));
const TargetWorkerOption_1 = __importDefault(require("../../options/e2e/TargetWorkerOption"));
const SetChromiumBinaryOption_1 = __importDefault(require("../../options/e2e/SetChromiumBinaryOption"));
const SetChromiumProtocolTimeoutOption_1 = __importDefault(require("../../options/e2e/SetChromiumProtocolTimeoutOption"));
class TakeSnapshotCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'snapshot';
    }
    getDescription() {
        return 'interact with web app and take heap snapshots';
    }
    getPrerequisites() {
        return [
            new InitDirectoryCommand_1.default(),
            new CleanRunDataCommand_1.default(),
            new CheckXvfbSupportCommand_1.default(),
        ];
    }
    getExamples() {
        return [
            '--scenario <TEST_SCENARIO_FILE>',
            '--scenario /tmp/test-scenario.js',
            '--scenario /tmp/test-scenario.js --work-dir /tmp/test-1/',
        ];
    }
    getOptions() {
        return [
            new HeadfulBrowserOption_1.default(),
            new DisplayLeakOutlinesOptions_1.default(),
            new AppOption_1.default(),
            new InteractionOption_1.default(),
            new FullExecutionOption_1.default(),
            new SkipSnapshotOption_1.default(),
            new SkipScreenshotOption_1.default(),
            new SkipGCOption_1.default(),
            new SkipScrollOption_1.default(),
            new SkipExtraOperationOption_1.default(),
            new RunningModeOption_1.default(),
            new RemoteBrowserDebugOption_1.default(),
            new ScenarioFileOption_1.default(),
            new SetChromiumBinaryOption_1.default(),
            new SetChromiumProtocolTimeoutOption_1.default(),
            new SetDeviceOption_1.default(),
            new SetUserAgentOption_1.default(),
            new DisableXvfbOption_1.default(),
            new DisableWebSecurityOption_1.default(),
            new EnableJSRewriteOption_1.default(),
            new EnableJSInterceptOption_1.default(),
            new TargetWorkerOption_1.default(),
        ];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(_options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, Snapshot_1.runPageInteractionFromCLI)();
        });
    }
}
exports.default = TakeSnapshotCommand;
