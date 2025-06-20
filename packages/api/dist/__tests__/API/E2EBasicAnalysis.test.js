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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/ban-ts-comment */
const index_1 = require("../../index");
const heap_analysis_1 = require("@memlab/heap-analysis");
const E2ETestSettings_1 = require("./lib/E2ETestSettings");
beforeEach(E2ETestSettings_1.testSetup);
function inject() {
    // @ts-ignore
    window.injectHookForLink3 = () => {
        // @ts-ignore
        window.__injectedValue3 = {};
    };
    // @ts-ignore
    window.injectHookForLink4 = () => {
        // @ts-ignore
        window.__injectedValue4 = {};
        const __injectedTimeoutValue1 = { v: 0 };
        setTimeout(() => {
            __injectedTimeoutValue1.v = 1;
        }, 1);
    };
}
test('E2E SPA test hooks work as expected', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, index_1.run)({ scenario: E2ETestSettings_1.scenario, evalInBrowserAfterInitLoad: inject });
    const snapshot = yield heap_analysis_1.PluginUtils.loadHeapSnapshot(E2ETestSettings_1.defaultAnalysisArgs);
    let foundInjectedValueForLink3 = false;
    let foundInjectedValueForLink4 = false;
    let foundInjectedTimeoutValue1 = false;
    snapshot.edges.forEach(e => {
        if (e.name_or_index === '__injectedValue3') {
            foundInjectedValueForLink3 = true;
        }
        if (e.name_or_index === '__injectedValue4') {
            foundInjectedValueForLink4 = true;
        }
        if (e.name_or_index === '__injectedTimeoutValue1') {
            foundInjectedTimeoutValue1 = true;
        }
    });
    // link-3 is not clicked, so injectHookForLink3 is not executed
    expect(foundInjectedValueForLink3).toBe(false);
    // link-4 is clicked, so injectHookForLink3 should be executed
    expect(foundInjectedValueForLink4).toBe(true);
    // __injectedValue is a local variable, which should not be retained
    expect(foundInjectedTimeoutValue1).toBe(false);
}), E2ETestSettings_1.testTimeout);
