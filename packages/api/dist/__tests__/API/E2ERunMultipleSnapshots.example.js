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
const index_1 = require("../../index");
const scenario = {
    app: () => 'test-spa',
    url: () => '',
    action: (page) => __awaiter(void 0, void 0, void 0, function* () { return yield page.click('[data-testid="link-4"]'); }),
    repeat: () => 4,
};
function inject() {
    // @ts-ignore
    window.injectHookForLink4 = () => {
        class LeakObject {
            constructor() {
                this.value = `value: ${Math.random()}`;
            }
        }
        // @ts-ignore
        const leak = (window.__injectedValue = window.__injectedValue || []);
        for (let i = 0; i < 10000; ++i) {
            leak.push(new LeakObject());
        }
    };
}
const promise = (0, index_1.run)({
    scenario,
    evalInBrowserAfterInitLoad: inject,
    snapshotForEachStep: true,
});
promise.then(() => {
    // test analysis from auto loading
    const analysis = new index_1.ShapeUnboundGrowthAnalysis();
    analysis.run();
});
