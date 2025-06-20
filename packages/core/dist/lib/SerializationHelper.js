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
exports.SerializationHelper = void 0;
const InternalValueSetter_1 = require("./InternalValueSetter");
const Constant_1 = __importDefault(require("./Constant"));
class SerializationHelper {
    constructor() {
        this.snapshot = null;
    }
    setSnapshot(snapshot) {
        this.snapshot = snapshot;
    }
    createOrMergeWrapper(info, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _node, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options) {
        return info;
    }
}
exports.SerializationHelper = SerializationHelper;
exports.default = (0, InternalValueSetter_1.setInternalValue)(SerializationHelper, __filename, Constant_1.default.internalDir);
