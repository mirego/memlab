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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.ScriptManager = exports.E2EUtils = exports.BaseSynthesizer = exports.E2EInteractionManager = exports.Xvfb = exports.defaultTestPlanner = exports.registerPackage = void 0;
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
/** @internal */
function registerPackage() {
    return __awaiter(this, void 0, void 0, function* () {
        return core_1.PackageInfoLoader.registerPackage(path_1.default.join(__dirname, '..'));
    });
}
exports.registerPackage = registerPackage;
var TestPlanner_1 = require("./lib/operations/TestPlanner");
Object.defineProperty(exports, "defaultTestPlanner", { enumerable: true, get: function () { return __importDefault(TestPlanner_1).default; } });
__exportStar(require("./lib/operations/TestPlanner"), exports);
var XVirtualFrameBuffer_1 = require("./lib/operations/XVirtualFrameBuffer");
Object.defineProperty(exports, "Xvfb", { enumerable: true, get: function () { return __importDefault(XVirtualFrameBuffer_1).default; } });
var E2EInteractionManager_1 = require("./E2EInteractionManager");
Object.defineProperty(exports, "E2EInteractionManager", { enumerable: true, get: function () { return __importDefault(E2EInteractionManager_1).default; } });
var BaseSynthesizer_1 = require("./BaseSynthesizer");
Object.defineProperty(exports, "BaseSynthesizer", { enumerable: true, get: function () { return __importDefault(BaseSynthesizer_1).default; } });
var E2EUtils_1 = require("./lib/E2EUtils");
Object.defineProperty(exports, "E2EUtils", { enumerable: true, get: function () { return __importDefault(E2EUtils_1).default; } });
/** @internal */
var ScriptManager_1 = require("./ScriptManager");
Object.defineProperty(exports, "ScriptManager", { enumerable: true, get: function () { return __importDefault(ScriptManager_1).default; } });
