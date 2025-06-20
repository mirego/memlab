/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import BackOperation from './operations/BackOperation';
import RevertOperation from './operations/RevertOperation';
declare const _default: {
    backStep: {
        name: string;
        url: string;
        interactions: BackOperation[];
    };
    revertStep: {
        name: string;
        url: string;
        interactions: RevertOperation[];
    };
};
export default _default;
//# sourceMappingURL=SynthesisUtils.d.ts.map