import type { IHeapSnapshot, IHeapNode, Nullable } from '@memlab/core';
import type ListComponent from './ListComponent';
import { ComponentDataItem, ComponentData } from './HeapViewUtils';
type SelectHeapObjectOption = {
    noChangeInReferenceBox?: boolean;
    noChangeInReferrerBox?: boolean;
    noChangeInRetainerTraceBox?: boolean;
    noChangeInObjectPropertyBox?: boolean;
    componentDataItem?: ComponentDataItem;
};
export type ObjectCategory = Map<string, ComponentDataItem[]>;
/**
 * HeapViewController managers all the data associated with each
 * UI components in CLI and coordinates the events/interaction
 * among all UI components.
 */
export default class HeapViewController {
    private currentHeapObject;
    private selectedHeapObject;
    private currentHeapObjectsInfo;
    private currentClusteredObjectsInfo;
    private componentIdToDataMap;
    private componentIdToComponentMap;
    private heap;
    private focusedComponent;
    private clusteredBox;
    private referrerBox;
    private objectBox;
    private referenceBox;
    private objectPropertyBox;
    private retainerTracePropertyBox;
    private scriptManager;
    constructor(heap: IHeapSnapshot, objectCategory: ObjectCategory);
    getFocusedComponent(): ListComponent;
    private getFlattenHeapObjectsInfo;
    private getFlattenClusteredObjectsInfo;
    private shouldClusterCategory;
    private clusterComponentDataItems;
    getComponentDataById(componentId: number): Nullable<ComponentData>;
    getContent(componentId: number): string[];
    setClusteredBox(component: ListComponent): void;
    getClusteredBoxData(): ComponentData;
    setReferrerBox(component: ListComponent): void;
    getReferrerBoxData(node?: IHeapNode): ComponentData;
    setObjectBox(component: ListComponent): void;
    getObjectBoxData(): ComponentData;
    setReferenceBox(component: ListComponent): void;
    getReferenceBoxData(): ComponentData;
    setObjectPropertyBox(component: ListComponent): void;
    getObjectPropertyData(options?: {
        details?: Map<string, string>;
    }): ComponentData;
    private getReadableString;
    private getKeyValuePairString;
    setRetainerTraceBox(component: ListComponent): void;
    getRetainerTraceData(): ComponentData;
    private getHeapObject;
    displaySourceCode(componentId: number, itemIndex: number): void;
    private displayClosureInfo;
    private getClosureNodeScopeVarEdges;
    setCurrentHeapObjectFromComponent(componentId: number, itemIndex: number, options?: {
        skipFocus?: boolean;
    }): void;
    setCurrentHeapObject(node: IHeapNode, options?: {
        skipFocus?: boolean;
    }): void;
    focusOnComponent(componentId: number): void;
    setSelectedHeapObjectFromComponent(componentId: number, itemIndex: number): void;
    setSelectedHeapObject(node: IHeapNode, options?: SelectHeapObjectOption): void;
}
export {};
//# sourceMappingURL=HeapViewController.d.ts.map