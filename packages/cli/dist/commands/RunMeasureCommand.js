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
const BaseCommand_1 = __importDefault(require("../BaseCommand"));
const InitDirectoryCommand_1 = __importDefault(require("./InitDirectoryCommand"));
const core_1 = require("@memlab/core");
const CleanRunDataCommand_1 = __importDefault(require("./CleanRunDataCommand"));
const Snapshot_1 = require("./snapshot/Snapshot");
const AppOption_1 = __importDefault(require("../options/e2e/AppOption"));
const FullExecutionOption_1 = __importDefault(require("../options/e2e/FullExecutionOption"));
const InteractionOption_1 = __importDefault(require("../options/e2e/InteractionOption"));
const SkipScreenshotOption_1 = __importDefault(require("../options/e2e/SkipScreenshotOption"));
const SkipSnapshotOption_1 = __importDefault(require("../options/e2e/SkipSnapshotOption"));
const SkipGCOption_1 = __importDefault(require("../options/e2e/SkipGCOption"));
const SkipScrollOption_1 = __importDefault(require("../options/e2e/SkipScrollOption"));
const SkipExtraOperationOption_1 = __importDefault(require("../options/e2e/SkipExtraOperationOption"));
const RunningModeOption_1 = __importDefault(require("../options/e2e/RunningModeOption"));
const RemoteBrowserDebugOption_1 = __importDefault(require("../options/e2e/RemoteBrowserDebugOption"));
const ScenarioFileOption_1 = __importDefault(require("../options/e2e/ScenarioFileOption"));
const SetDeviceOption_1 = __importDefault(require("../options/e2e/SetDeviceOption"));
const SetUserAgentOption_1 = __importDefault(require("../options/e2e/SetUserAgentOption"));
const DisableXvfbOption_1 = __importDefault(require("../options/e2e/DisableXvfbOption"));
const NumberOfRunsOption_1 = __importDefault(require("../options/NumberOfRunsOption"));
const HeadfulBrowserOption_1 = __importDefault(require("../options/e2e/HeadfulBrowserOption"));
const DisplayLeakOutlinesOptions_1 = __importDefault(require("../options/e2e/DisplayLeakOutlinesOptions"));
const DisableWebSecurityOption_1 = __importDefault(require("../options/e2e/DisableWebSecurityOption"));
const EnableJSRewriteOption_1 = __importDefault(require("../options/e2e/EnableJSRewriteOption"));
const EnableJSInterceptOption_1 = __importDefault(require("../options/e2e/EnableJSInterceptOption"));
const SetChromiumBinaryOption_1 = __importDefault(require("../options/e2e/SetChromiumBinaryOption"));
const SetChromiumProtocolTimeoutOption_1 = __importDefault(require("../options/e2e/SetChromiumProtocolTimeoutOption"));
class RunMeasureCommand extends BaseCommand_1.default {
    getCommandName() {
        return 'measure';
    }
    getDescription() {
        return 'Run test scenario in measure mode';
    }
    getPrerequisites() {
        return [new CleanRunDataCommand_1.default(), new InitDirectoryCommand_1.default()];
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
            new NumberOfRunsOption_1.default(),
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
        ];
    }
    getDocumentation() {
        return ('In some web apps, the heap size can show considerable variability' +
            ' across various runs. This fluctuation can often make it hard to' +
            ' understand the impact of memory leaks. The introduction of the measure' +
            ' mode aims to address this challenge by executing the same scenario' +
            ' repetitively, therefore getting multiple data points of JavaScript heap' +
            ' sizes. This can help understand if the heap size movements during' +
            ' specific runs come from memory-related issues or just noise.');
    }
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const numRuns = NumberOfRunsOption_1.default.getParsedOption(options.configFromOptions);
            core_1.config.runningMode = core_1.modes.get('measure', core_1.config);
            for (let i = 0; i < numRuns; ++i) {
                yield (0, Snapshot_1.runPageInteractionFromCLI)();
            }
        });
    }
}
exports.default = RunMeasureCommand;
