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
Object.defineProperty(exports, "__esModule", { value: true });
const InternalValueSetter_1 = require("./InternalValueSetter");
const constants = {
    isFB: false,
    isFRL: false,
    defaultEngine: 'V8',
    supportedEngines: ['V8', 'hermes'],
    supportedBrowsers: Object.create(null),
    internalDir: 'fb-internal',
    monoRepoDir: '',
    defaultUserAgent: 'default',
    defaultProtocolTimeout: 5 * 60 * 1000,
    V8SyntheticRoots: [
        '(GC roots)',
        '(Internalized strings)',
        '(External strings)',
        '(Read-only roots)',
        '(Strong roots)',
        '(Smi roots)',
        '(Bootstrapper)',
        '(Stack roots)',
        '(Relocatable)',
        '(Debugger)',
        '(Compilation cache)',
        '(Handle scope)',
        '(Builtins)',
        '(Global handles)',
        '(Eternal handles)',
        '(Thread manager)',
        '(Strong roots)',
        '(Extensions)',
        '(Code flusher)',
        '(Startup object cache)',
        '(Read-only object cache)',
        '(Weak collections)',
        '(Wrapper tracing)',
        '(Write barrier)',
        '(Retain maps)',
        '(Unknown)',
        '<Synthetic>',
    ],
    namePrefixForScenarioFromFile: '',
    unset: 'UNSET',
};
Object.assign(constants.supportedBrowsers, {
    chromium: 'chrome',
    chrome: 'google-chrome',
});
exports.default = (0, InternalValueSetter_1.setInternalValue)(constants, __filename, constants.internalDir);
