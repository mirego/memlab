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
// initial page load's url
function url() {
    return 'https://www.airbnb.com/?tab_id=home_tab';
}
// action where we want to detect memory leaks
function action(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const arr = yield page.$x("//button[contains(., 'Show map')]");
        if (arr[0]) {
            yield arr[0].click();
        }
        arr.forEach(elem => elem.dispose());
    });
}
// action where we want to go back to the step before
function back(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const arr = yield page.$x("//button[contains(., 'Show list')]");
        if (arr[0]) {
            yield arr[0].click();
        }
        arr.forEach(elem => elem.dispose());
    });
}
// specify the number of repeat for the action
function repeat() {
    return 15;
}
module.exports = { action, back, repeat, url };
