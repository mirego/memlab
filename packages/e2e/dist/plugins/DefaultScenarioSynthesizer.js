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
const BaseSynthesizer_1 = __importDefault(require("../BaseSynthesizer"));
const InteractionUtils_1 = __importDefault(require("../lib/operations/InteractionUtils"));
const E2EUtils_1 = __importDefault(require("../lib/E2EUtils"));
class DefaultScenarioSynthesizer extends BaseSynthesizer_1.default {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getBaseURL(_options = {}) {
        return '';
    }
    getAppName() {
        return E2EUtils_1.default.getScenarioAppName();
    }
    getNumberOfWarmup() {
        return 1;
    }
    getCookieFile() {
        return null;
    }
    getDomain() {
        return '';
    }
    getAvailableSteps() {
        return [];
    }
    getDefaultStartStepName() {
        return '';
    }
    getAvailableVisitPlans() {
        return [];
    }
    getPageLoadChecker() {
        return (page) => __awaiter(this, void 0, void 0, function* () {
            yield InteractionUtils_1.default.waitFor(500);
            yield page.waitForNavigation({
                waitUntil: 'networkidle0',
                timeout: this.config.waitForNetworkInDefaultScenario,
            });
            return true;
        });
    }
}
exports.default = DefaultScenarioSynthesizer;
