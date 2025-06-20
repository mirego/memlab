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
exports.lastNodeFromTrace = exports.chunks = exports.randomChunks = void 0;
const ClusterUtilsHelper_1 = __importDefault(require("./ClusterUtilsHelper"));
const ClusteringHeuristics_1 = __importDefault(require("./ClusteringHeuristics"));
exports.default = ClusterUtilsHelper_1.default.initialize(ClusteringHeuristics_1.default);
/**
 * const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * randomChunks(elements, 3) -> [[4, 8, 3], [9, 5, 1], [2, 6, 7, 10]]
 * @internal
 */
const randomChunks = (items, n) => {
    const array = [...items];
    const size = Math.floor(array.length / n);
    const chunks = [];
    for (let i = 0; i < n - 1; i++) {
        const chunk = [];
        for (let j = 0; j < size; j++) {
            const idx = Math.floor(Math.random() * array.length);
            chunk[j] = array[idx];
            array.splice(idx, 1);
        }
        chunks.push(chunk);
    }
    chunks.push(array);
    return chunks;
};
exports.randomChunks = randomChunks;
/**
 * chunks(elements, 3) -> [[1, 2, 3], [4, 5, 6], [7, 8, 9, 10]]
 * @internal
 */
const chunks = (items, n) => {
    const array = [...items];
    const size = Math.floor(array.length / n);
    const chunks = [];
    for (let i = 0; i < n - 1; i++) {
        const chunk = array.splice(0, size);
        chunks.push(chunk);
    }
    chunks.push(array);
    return chunks;
};
exports.chunks = chunks;
/** @internal*/
const lastNodeFromTrace = (trace) => trace[trace.length - 1];
exports.lastNodeFromTrace = lastNodeFromTrace;
