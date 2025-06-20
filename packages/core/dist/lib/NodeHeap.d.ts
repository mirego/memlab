/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { IHeapSnapshot } from './Types';
/**
 * Tags a string marker to an object instance, which can later be checked by
 * {@link hasObjectWithTag}. This API does not modify the object instance in
 * any way (e.g., no additional or hidden properties added to the tagged
 * object).
 *
 * @param o specify the object instance you want to tag, you cannot tag a
 * [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
 * @param tag marker name to tag on the object instance
 * @returns returns the tagged object instance (same reference as
 * the input argument `o`)
 * * **Examples**:
 * ```typescript
 * import type {IHeapSnapshot, AnyValue} from '@memlab/core';
 * import {config, takeNodeMinimalHeap, tagObject} from '@memlab/core';
 *
 * test('memory test', async () => {
 *   config.muteConsole = true;
 *   const o1: AnyValue = {};
 *   let o2: AnyValue = {};
 *
 *   // tag o1 with marker: "memlab-mark-1", does not modify o1 in any way
 *   tagObject(o1, 'memlab-mark-1');
 *   // tag o2 with marker: "memlab-mark-2", does not modify o2 in any way
 *   tagObject(o2, 'memlab-mark-2');
 *
 *   o2 = null;
 *
 *   const heap: IHeapSnapshot = await takeNodeMinimalHeap();
 *
 *   // expect object with marker "memlab-mark-1" exists
 *   expect(heap.hasObjectWithTag('memlab-mark-1')).toBe(true);
 *
 *   // expect object with marker "memlab-mark-2" can be GCed
 *   expect(heap.hasObjectWithTag('memlab-mark-2')).toBe(false);
 *
 * }, 30000);
 * ```
 */
export declare function tagObject<T extends object>(o: T, tag: string): T;
/**
 * Take a heap snapshot of the current program state and save it as a
 * `.heapsnapshot` file under a randomly generated folder inside the system's
 * temp folder.
 *
 * **Note**: All `.heapsnapshot` files could also be loaded by Chrome DevTools.
 * @returns the absolute file path to the saved `.heapsnapshot` file.
 *
 * * **Examples**:
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import {dumpNodeHeapSnapshot} from '@memlab/core';
 * import {getFullHeapFromFile} from '@memlab/heap-analysis';
 *
 * (async function () {
 *   const heapFile = dumpNodeHeapSnapshot();
 *   const heap: IHeapSnapshot = await getFullHeapFromFile(heapFile);
 * })();
 * ```
 */
export declare function dumpNodeHeapSnapshot(): string;
/**
 * Take a heap snapshot of the current program state
 * and parse it as {@link IHeapSnapshot}. Notice that
 * this API does not calculate some heap analysis meta data
 * for heap analysis. But this also means faster heap parsing.
 *
 * @returns heap representation without heap analysis meta data.
 *
 * @deprecated
 * @internal
 *
 * If you need to get the heap snapshot with heap analysis meta data, please
 * use {@link takeNodeFullHeap}.
 * For example:
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import {takeNodeFullHeap} from '@memlab/heap-analysis';
 *
 * (async function () {
 *   const heap: IHeapSnapshot = await takeNodeFullHeap();
 * })();
 * ```
 */
export declare function getNodeInnocentHeap(): Promise<IHeapSnapshot>;
/**
 * Take a heap snapshot of the current program state
 * and parse it as {@link IHeapSnapshot}. Notice that
 * this API does not calculate some heap analysis meta data
 * for heap analysis. But this also means faster heap parsing.
 *
 * @returns heap representation without heap analysis meta data.
 *
 * * **Examples:**
 * ```typescript
 * import type {IHeapSnapshot} from '@memlab/core';
 * import {takeNodeMinimalHeap} from '@memlab/core';
 *
 * (async function () {
 *   const heap: IHeapSnapshot = await takeNodeMinimalHeap();
 * })();
 * ```
 *
 * If you need to get the heap snapshot with heap analysis meta data, please
 * use {@link getFullHeapFromFile}.
 */
export declare function takeNodeMinimalHeap(): Promise<IHeapSnapshot>;
//# sourceMappingURL=NodeHeap.d.ts.map