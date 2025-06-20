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
const BaseMode_1 = __importDefault(require("./BaseMode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// mode for running quick measurement or experiments
class MeasureMode extends BaseMode_1.default {
    shouldTakeScreenShot() {
        return false;
    }
    shouldTakeHeapSnapshot() {
        return false;
    }
    shouldExtraWaitForTarget() {
        return false;
    }
    shouldExtraWaitForFinal() {
        return false;
    }
    shouldRunExtraTargetOperations() {
        return false;
    }
    getAdditionalMetrics(page) {
        return __awaiter(this, void 0, void 0, function* () {
            // number of DOM elements on the page
            const numDOMElements = yield page.evaluate(() => document.getElementsByTagName('*').length);
            return { numDOMElements };
        });
    }
    postProcessData(visitPlan) {
        const filename = `metrics-${Date.now()}-${process.pid}.json`;
        const filepath = path_1.default.join(this.config.metricsOutDir, filename);
        const content = JSON.stringify(visitPlan.tabsOrder, null, 2);
        fs_1.default.writeFileSync(filepath, content, 'UTF-8');
    }
}
exports.default = MeasureMode;
