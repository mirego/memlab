/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { IHeapSnapshot, Optional, IHeapConfig } from '@memlab/core';
declare class HeapConfig implements IHeapConfig {
    isCliInteractiveMode: boolean;
    currentHeapFile: Optional<string>;
    currentHeap: Optional<IHeapSnapshot>;
    private constructor();
    private static instance;
    static getInstance(): HeapConfig;
}
declare const heapConfig: HeapConfig;
export default heapConfig;
//# sourceMappingURL=HeapConfig.d.ts.map