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
const Config_1 = __importDefault(require("../lib/Config"));
// the regular mode for conventional MemLab runs
class BaseMode {
    constructor() {
        this.config = Config_1.default;
    }
    setConfig(config) {
        this.config = config;
    }
    beforeRunning(visitPlan) {
        this.visitPlan = visitPlan;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldGC(_tabInfo) {
        return !this.config.skipGC;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldScroll(_tabInfo) {
        return !this.config.skipScroll;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldGetMetrics(_tabInfo) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldUseConciseConsole(_tabInfo) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldTakeScreenShot(_tabInfo) {
        return !this.config.skipScreenshot;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldTakeHeapSnapshot(_tabInfo) {
        return !this.config.skipSnapshot;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldExtraWaitForTarget(_tabInfo) {
        if (this.visitPlan && this.visitPlan.type === 'repeat') {
            return false;
        }
        return !this.config.skipExtraOps;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldExtraWaitForFinal(_tabInfo) {
        if (this.visitPlan && this.visitPlan.type === 'repeat') {
            return false;
        }
        return !this.config.skipExtraOps;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldRunExtraTargetOperations(_tabInfo) {
        if (this.visitPlan && this.visitPlan.type === 'repeat') {
            return false;
        }
        return !this.config.skipExtraOps;
    }
    getAdditionalMetrics(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _page, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _tabInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    postProcessData(_visitPlan) {
        // for overriding
    }
}
exports.default = BaseMode;
