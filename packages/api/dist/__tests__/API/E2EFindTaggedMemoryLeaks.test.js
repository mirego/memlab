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
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const index_1 = require("../../index");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
beforeEach(E2ETestSettings_1.testSetup);
function tagObjectsAsLeaks() {
    // this class definition must be defined within `tagObjectsAsLeaks`
    // since this function will be serialized and executed in browser context
    class MemLabTracker {
        constructor() {
            this.memlabIdentifier = 'MemLabObjectTracker';
            this.tagToTrackedObjectsMap = new Map();
        }
        tag(target, useCaseId = 'MEMLAB_TAGGED') {
            let trackedItems = this.tagToTrackedObjectsMap.get(useCaseId);
            if (!trackedItems) {
                trackedItems = {
                    useCaseId,
                    taggedObjects: new WeakSet(),
                };
                this.tagToTrackedObjectsMap.set(useCaseId, trackedItems);
            }
            trackedItems.taggedObjects.add(target);
        }
    }
    // @ts-ignore
    window.injectHookForLink4 = () => {
        // @ts-ignore
        const tracker = (window._memlabTrack = new MemLabTracker());
        const leaks = [];
        // @ts-ignore
        window._taggedLeaks = leaks;
        for (let i = 0; i < 11; ++i) {
            leaks.push({ x: i });
        }
        leaks.forEach(item => {
            tracker.tag(item);
        });
    };
}
test('tagged leak objects can be identified as leaks', () => __awaiter(void 0, void 0, void 0, function* () {
    const selfDefinedScenario = {
        app: () => 'test-spa',
        url: () => '',
        action: (page) => __awaiter(void 0, void 0, void 0, function* () { return yield page.click('[data-testid="link-4"]'); }),
    };
    const workDir = path_1.default.join(os_1.default.tmpdir(), 'memlab-api-test', `${process.pid}`);
    fs_extra_1.default.mkdirsSync(workDir);
    const result = yield (0, index_1.run)({
        scenario: selfDefinedScenario,
        evalInBrowserAfterInitLoad: tagObjectsAsLeaks,
        workDir,
    });
    // tagged objects should be detected as leaks
    expect(result.leaks.length).toBe(1);
    // expect all traces are found
    expect(result.leaks.some(leak => JSON.stringify(leak).includes('_taggedLeaks')));
}), E2ETestSettings_1.testTimeout);
