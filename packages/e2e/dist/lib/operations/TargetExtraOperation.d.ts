/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import BaseOperation from './BaseOperation';
import CompoundOperation from './CompoundOperation';
declare class TargetExtraOperation extends CompoundOperation {
    kind: string;
    operations: BaseOperation[];
    constructor(operations?: never[]);
}
export default TargetExtraOperation;
//# sourceMappingURL=TargetExtraOperation.d.ts.map