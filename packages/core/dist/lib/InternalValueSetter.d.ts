/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
/** @internal */
export declare abstract class InternalValueSetter<T> {
    fillIn(_module: T): T;
}
/** @internal */
export declare function setInternalValue<T>(value: T, callerFilePath: string, internalFolderName: string): T;
//# sourceMappingURL=InternalValueSetter.d.ts.map