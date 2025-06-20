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
const core_1 = require("@memlab/core");
const puppeteer = core_1.constant.isFRL
    ? {}
    : core_1.constant.isFB
        ? require('puppeteer-core')
        : require('puppeteer');
function getBrowser(options = {}) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const runConfig = (_a = options.config) !== null && _a !== void 0 ? _a : core_1.config;
        let browser;
        core_1.utils.tryToMutePuppeteerWarning();
        if (runConfig.isLocalPuppeteer && !options.warmup) {
            try {
                browser = yield puppeteer.connect(Object.assign({ browserURL: `http://localhost:${runConfig.localBrowserPort}` }, runConfig.puppeteerConfig));
            }
            catch (e) {
                throw core_1.utils.haltOrThrow(core_1.utils.getError(e), {
                    primaryMessageToPrint: 'Failed to connect to local browser. Ensure that the local-puppeteer script is running.',
                });
            }
        }
        else {
            browser = yield puppeteer.launch(runConfig.puppeteerConfig);
        }
        return browser;
    });
}
exports.default = {
    getBrowser,
};
