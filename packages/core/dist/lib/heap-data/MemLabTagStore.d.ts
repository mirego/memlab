/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { AnyValue, IHeapSnapshot } from '../Types';
type AnyObject = Record<AnyValue, AnyValue>;
/** @internal */
export default class MemLabTaggedStore {
    taggedObjects: Record<string, WeakSet<AnyObject>>;
    private constructor();
    private static instance;
    readonly id: string;
    static getInstance(): MemLabTaggedStore;
    static tagObject<T extends object>(o: T, tag: string): void;
    static hasObjectWithTag(heap: IHeapSnapshot, tag: string): boolean;
}
export {};
//# sourceMappingURL=MemLabTagStore.d.ts.map