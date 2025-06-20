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
const core_1 = require("@memlab/core");
const BaseCommand_1 = require("../../../BaseCommand");
const MemLabRunCommand_1 = __importDefault(require("../../MemLabRunCommand"));
const ListScenariosCommand_1 = __importDefault(require("../../ListScenariosCommand"));
const CheckLeakCommand_1 = __importDefault(require("../../heap/CheckLeakCommand"));
const GetRetainerTraceCommand_1 = __importDefault(require("../../heap/GetRetainerTraceCommand"));
const HeapAnalysisCommand_1 = __importDefault(require("../../heap/HeapAnalysisCommand"));
const commandOrder = [
    {
        category: BaseCommand_1.CommandCategory.COMMON,
        commands: [
            new MemLabRunCommand_1.default(),
            new ListScenariosCommand_1.default(),
            new GetRetainerTraceCommand_1.default(),
            new CheckLeakCommand_1.default(),
            new HeapAnalysisCommand_1.default(),
        ],
    },
    {
        category: BaseCommand_1.CommandCategory.DEV,
        commands: [],
    },
    {
        category: BaseCommand_1.CommandCategory.MISC,
        commands: [],
    },
];
exports.default = (0, core_1.setInternalValue)(commandOrder, __filename, core_1.constant.internalDir);
