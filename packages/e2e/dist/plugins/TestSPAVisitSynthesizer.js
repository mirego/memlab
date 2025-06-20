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
const path_1 = __importDefault(require("path"));
const BaseSynthesizer_1 = __importDefault(require("../BaseSynthesizer"));
const ClickOperation_1 = __importDefault(require("../lib/operations/ClickOperation"));
const InteractionUtils_1 = __importDefault(require("../lib/operations/InteractionUtils"));
class TestSPAVisitSynthesizer extends BaseSynthesizer_1.default {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getBaseURL(_options = {}) {
        const indexFile = path_1.default.join(__dirname, '..', '..', 'static', 'links', 'index.html');
        return `file://${indexFile}`;
    }
    getAppName() {
        return 'test-spa';
    }
    getNumberOfWarmup() {
        return 1;
    }
    getCookieFile() {
        return null;
    }
    getDomain() {
        return 'test.com';
    }
    getAvailableSteps() {
        const steps = [];
        for (let i = 1; i <= 8; ++i) {
            steps.push({
                name: `link-${i}`,
                url: '',
                interactions: [new ClickOperation_1.default(`[data-testid="link-${i}"]`)],
            });
        }
        return steps;
    }
    getDefaultStartStepName() {
        return 'link-1';
    }
    getAvailableVisitPlans() {
        const plans = [this.synthesis('link-2', 'link-3', ['link-4'])];
        return plans;
    }
    getPageLoadChecker() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (_page) => __awaiter(this, void 0, void 0, function* () {
            yield InteractionUtils_1.default.waitFor(200);
            return true;
        });
    }
}
exports.default = TestSPAVisitSynthesizer;
