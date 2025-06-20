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
const Utils_1 = __importDefault(require("./Utils"));
class Option {
    constructor() {
        this.optionalFlag = true;
    }
    // option long name, e.g., --verbose
    getOptionName() {
        const className = this.constructor.name;
        throw new Error(`${className}.getOptionName is not implemented`);
    }
    // option shortcut, e.g., -v
    getOptionShortcut() {
        const className = this.constructor.name;
        throw new Error(`${className}.getOptionShortcut is not implemented`);
    }
    parse(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = this.constructor.name;
            throw new Error(`${className}.parse is not implemented`);
        });
    }
    // DO NOT OVERRIDE
    run(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            // check presence of required flag
            if (!this.optionalFlag) {
                const keys = new Set(Object.keys(args));
                if (!keys.has(this.getOptionName())) {
                    const shortcut = this.getOptionShortcut();
                    if (!shortcut || !keys.has(shortcut)) {
                        Utils_1.default.haltOrThrow(`command line argument --${this.getOptionName()} is required`);
                    }
                }
            }
            return yield this.parse(config, args);
        });
    }
    optional() {
        this.optionalFlag = true;
        return this;
    }
    required() {
        this.optionalFlag = false;
        return this;
    }
    isOptional() {
        return this.optionalFlag;
    }
}
class BaseOption extends Option {
    // option long name, e.g., --verbose
    getOptionName() {
        const className = this.constructor.name;
        throw Utils_1.default.haltOrThrow(`${className}.getCommandName is not implemented`);
    }
    // option shortcut, e.g., -v
    getOptionShortcut() {
        return null;
    }
    // get a list of example values
    // examples will be displayed in helper text
    getExampleValues() {
        return [];
    }
    // description of this option (printed in helper text)
    getDescription() {
        const className = this.constructor.name;
        throw new Error(`${className}.getDescription is not implemented`);
    }
    // Do the memory analysis and print results in this callback
    parse(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _args) {
        return __awaiter(this, void 0, void 0, function* () {
            const className = this.constructor.name;
            throw new Error(`${className}.parse is not implemented`);
        });
    }
}
exports.default = BaseOption;
