"use strict";
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
exports.PackageInfoLoader = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Config_1 = __importDefault(require("./Config"));
const Utils_1 = __importDefault(require("./Utils"));
/** @internal */
class PackageInfoLoader {
    static loadFrom(packageDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            let exists = yield fs_extra_1.default.pathExists(packageDirectory);
            if (!exists) {
                throw Utils_1.default.haltOrThrow(`package directory doesn't exist: ${packageDirectory}`);
            }
            let packageJSONFile = path_1.default.join(packageDirectory, 'package-oss.json');
            exists = yield fs_extra_1.default.pathExists(packageJSONFile);
            if (!exists) {
                packageJSONFile = path_1.default.join(packageDirectory, 'package.json');
            }
            exists = yield fs_extra_1.default.pathExists(packageJSONFile);
            if (!exists) {
                throw Utils_1.default.haltOrThrow(`package.json doesn't exist: ${packageJSONFile}`);
            }
            try {
                const metaData = yield fs_extra_1.default.readJSON(packageJSONFile, 'UTF-8');
                return Object.assign(Object.assign({}, metaData), { packageLocation: packageDirectory });
            }
            catch (ex) {
                throw Utils_1.default.haltOrThrow(Utils_1.default.getError(ex));
            }
        });
    }
    static registerPackage(packageDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!PackageInfoLoader.registeredPackages.has(packageDirectory)) {
                PackageInfoLoader.registeredPackages.add(packageDirectory);
                const packageInfo = yield PackageInfoLoader.loadFrom(packageDirectory);
                Config_1.default.packageInfo.push(packageInfo);
            }
        });
    }
}
exports.PackageInfoLoader = PackageInfoLoader;
PackageInfoLoader.registeredPackages = new Set();
