/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @lightSyntaxTransform
 * @oncall memory_lab
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// if the number is larger than this, we will use the slow store
const DEFAULT_FAST_STORE_SIZE = 5000000;
// maxmimum fast store size allowed to set to NumericDictionary,
// if the store size is bigger than this, it will cause exceptions
// in JS engines on some platforms
const MAX_FAST_STORE_SIZE = 10000000;
class NumericDictionary {
    constructor(size, options = {}) {
        this.useFastStore = true;
        this.fastStore = null;
        this.slowStore = null;
        this.numberOfShards = 1;
        this.fastStoreSize = DEFAULT_FAST_STORE_SIZE;
        if (options.fastStoreSize != null) {
            if (options.fastStoreSize > 0 &&
                options.fastStoreSize <= MAX_FAST_STORE_SIZE) {
                this.fastStoreSize = options.fastStoreSize;
            }
        }
        this.useFastStore = size <= this.fastStoreSize;
        if (this.useFastStore) {
            this.fastStore = new Map();
        }
        else {
            this.numberOfShards = Math.ceil(size / this.fastStoreSize);
            this.slowStore = new Map();
        }
    }
    getNumOfShards() {
        return this.numberOfShards;
    }
    getShard(key) {
        return Math.floor(key / this.fastStoreSize);
    }
    has(key) {
        var _a, _b, _c, _d;
        if (this.useFastStore) {
            return (_b = (_a = this.fastStore) === null || _a === void 0 ? void 0 : _a.has(key)) !== null && _b !== void 0 ? _b : false;
        }
        else {
            const shard = this.getShard(key);
            const map = (_c = this.slowStore) === null || _c === void 0 ? void 0 : _c.get(shard);
            return (_d = map === null || map === void 0 ? void 0 : map.has(key)) !== null && _d !== void 0 ? _d : false;
        }
    }
    get(key) {
        var _a, _b, _c, _d;
        if (this.useFastStore) {
            return (_b = (_a = this.fastStore) === null || _a === void 0 ? void 0 : _a.get(key)) !== null && _b !== void 0 ? _b : null;
        }
        else {
            const shard = this.getShard(key);
            const map = (_c = this.slowStore) === null || _c === void 0 ? void 0 : _c.get(shard);
            return (_d = map === null || map === void 0 ? void 0 : map.get(key)) !== null && _d !== void 0 ? _d : null;
        }
    }
    set(key, value) {
        var _a, _b, _c;
        if (this.useFastStore) {
            (_a = this.fastStore) === null || _a === void 0 ? void 0 : _a.set(key, value);
        }
        else {
            const shard = this.getShard(key);
            let map = (_b = this.slowStore) === null || _b === void 0 ? void 0 : _b.get(shard);
            if (!map) {
                map = new Map();
                (_c = this.slowStore) === null || _c === void 0 ? void 0 : _c.set(shard, map);
            }
            map.set(key, value);
        }
    }
}
exports.default = NumericDictionary;
