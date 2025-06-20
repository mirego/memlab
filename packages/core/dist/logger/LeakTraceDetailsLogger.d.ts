/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { IHeapSnapshot, ISerializedInfo, LeakTracePathItem, Nullable } from '../lib/Types';
declare class LeakTraceDetailsLogger {
    _wrapPathJSONInLoader(jsonContent: string): string;
    setTraceFileEmpty(filepath: string): void;
    logTrace(leakedIdSet: Set<number>, snapshot: IHeapSnapshot, nodeIdsInSnapshots: Array<Set<number>>, trace: LeakTracePathItem, filepath: string): Nullable<ISerializedInfo>;
    logTraces(leakedIdSet: Set<number>, snapshot: IHeapSnapshot, nodeIdsInSnapshots: Array<Set<number>>, traces: LeakTracePathItem[], outDir: string): Array<ISerializedInfo>;
}
declare const _default: LeakTraceDetailsLogger;
export default _default;
//# sourceMappingURL=LeakTraceDetailsLogger.d.ts.map