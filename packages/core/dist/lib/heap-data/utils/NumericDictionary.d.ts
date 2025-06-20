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
import { Nullable } from '../../Types';
export type NumericDictOptions = {
    fastStoreSize?: number;
};
export default class NumericDictionary {
    private useFastStore;
    private fastStore;
    private slowStore;
    private numberOfShards;
    private fastStoreSize;
    constructor(size: number, options?: NumericDictOptions);
    getNumOfShards(): number;
    getShard(key: number): number;
    has(key: number): boolean;
    get(key: number): Nullable<number>;
    set(key: number, value: number): void;
}
//# sourceMappingURL=NumericDictionary.d.ts.map