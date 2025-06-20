/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { IHeapNode, IHeapSnapshot, ISerializationHelper, ISerializedInfo, JSONifyArgs, JSONifyOptions, Nullable } from './Types';
export declare class SerializationHelper implements ISerializationHelper {
    protected snapshot: Nullable<IHeapSnapshot>;
    setSnapshot(snapshot: IHeapSnapshot): void;
    createOrMergeWrapper(info: ISerializedInfo, _node: IHeapNode, _args: JSONifyArgs, _options: JSONifyOptions): ISerializedInfo;
}
declare const _default: typeof SerializationHelper;
export default _default;
//# sourceMappingURL=SerializationHelper.d.ts.map