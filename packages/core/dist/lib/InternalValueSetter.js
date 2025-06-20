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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setInternalValue = exports.InternalValueSetter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/** @internal */
class InternalValueSetter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fillIn(_module) {
        throw new Error('InternalValueSetter.fillIn is not implemented');
    }
}
exports.InternalValueSetter = InternalValueSetter;
/** @internal */
function setInternalValue(value, callerFilePath, internalFolderName) {
    const callerDir = path_1.default.dirname(callerFilePath);
    const callerFile = path_1.default.basename(callerFilePath);
    const internalDir = path_1.default.join(callerDir, internalFolderName);
    const internalModulePath = path_1.default.join(internalDir, callerFile);
    if (!fs_1.default.existsSync(internalModulePath)) {
        return value;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(internalModulePath);
    const Constructor = typeof module.default === 'function' ? module.default : module;
    const setter = new Constructor();
    if (typeof setter.fillIn !== 'function') {
        return value;
    }
    const valueSetter = setter;
    return valueSetter.fillIn(value);
}
exports.setInternalValue = setInternalValue;
