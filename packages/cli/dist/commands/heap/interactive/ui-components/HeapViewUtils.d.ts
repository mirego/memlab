/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { IHeapEdge, IHeapNode } from '@memlab/core';
export declare class ComponentDataItem {
    stringContent?: string;
    tag?: string;
    referrerEdge?: IHeapEdge;
    heapObject?: IHeapNode;
    referenceEdge?: IHeapEdge;
    type?: string;
    details?: Map<string, string>;
    static getTextForDisplay(data: ComponentDataItem): string;
    private static getHeapObjectTextContent;
    private static getHeapEdgeTextContent;
    private static getTextContent;
}
export declare class ComponentData {
    selectedIdx: number;
    items: ComponentDataItem[];
}
export declare function throwIfNodesEmpty(nodes: ComponentDataItem[]): boolean;
export declare function getHeapObjectAt(nodes: ComponentDataItem[], index: number): IHeapNode;
export declare function substringWithColor(input: string, begin: number): string;
export type DebounceCallback = () => void;
export type DebounceFunction = (callback: DebounceCallback) => void;
export declare function debounce(timeInMs: number): DebounceFunction;
//# sourceMappingURL=HeapViewUtils.d.ts.map