/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { Widgets } from 'blessed';
import type HeapViewController from './HeapViewController';
export type ListComponentOption = {
    width: number;
    height: number;
    left: number;
    top: number;
    label?: string;
};
export type ListItemSelectInfo = {
    keyName: string;
};
export type LabelOption = {
    nextTick?: boolean;
};
export type ListCallbacks = {
    selectCallback?: (componentId: number, index: number, content: string[], selectInfo: ListItemSelectInfo) => void;
    updateContent?: (oldContent: string[], newContent: string[]) => void;
    getFocus?: () => void;
    render?: () => void;
};
/**
 * A ListComponent is an UI list component in CLI.
 * It managers all the UI events related to the
 * list component (e.g., scroll up, down, left, right, and other key strokes)
 */
export default class ListComponent {
    element: Widgets.ListElement;
    id: number;
    private labelText;
    private controller;
    private listIndex;
    private content;
    private callbacks;
    private horizonScrollPositionMap;
    private displayedItems;
    private moreEntryIndex;
    private focusKey;
    private static readonly ListContentLimit;
    private static readonly loadMore;
    private static nextComponentId;
    private static nextId;
    constructor(content: string[], callbacks: ListCallbacks, options: ListComponentOption);
    setController(controller: HeapViewController): void;
    private render;
    private static createEntryForMore;
    protected registerKeys(): void;
    private scrollLeft;
    private scrollRight;
    focus(): void;
    loseFocus(): void;
    selectIndex(index: number): void;
    setFocusKey(key: string): void;
    setLabel(label: string, option?: LabelOption): void;
    setContent(content: string[]): void;
    loadMoreContent(): void;
    private removeDisplayMoreEntry;
    private insertDisplayMoreEntry;
    updateContent(oldContent: string[], newContent: string[]): void;
    getFocus(): void;
    selectUpdate(index: number, content: string[], selectInfo: ListItemSelectInfo): void;
}
//# sourceMappingURL=ListComponent.d.ts.map