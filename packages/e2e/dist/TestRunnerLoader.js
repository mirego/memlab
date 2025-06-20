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
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const BaseSynthesizer_1 = __importDefault(require("./BaseSynthesizer"));
class TestRunnerLoader {
    load() {
        const ret = [];
        const dir = path_1.default.join(__dirname, 'plugins');
        core_1.fileManager.iterateAllFiles(dir, (file) => {
            if (!file.endsWith('Synthesizer.js')) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const importedEntity = require(file);
            if (!importedEntity.default) {
                return;
            }
            const constructor = importedEntity.default;
            if (typeof constructor !== 'function' ||
                !(constructor.prototype instanceof BaseSynthesizer_1.default)) {
                return;
            }
            ret.push(constructor);
        });
        return ret;
    }
}
exports.default = new TestRunnerLoader();
