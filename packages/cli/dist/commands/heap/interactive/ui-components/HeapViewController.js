"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const worker_threads_1 = require("worker_threads");
const core_1 = require("@memlab/core");
const e2e_1 = require("@memlab/e2e");
const HeapViewUtils_1 = require("./HeapViewUtils");
/**
 * HeapViewController managers all the data associated with each
 * UI components in CLI and coordinates the events/interaction
 * among all UI components.
 */
class HeapViewController {
    constructor(heap, objectCategory) {
        this.heap = heap;
        this.currentHeapObjectsInfo =
            this.getFlattenHeapObjectsInfo(objectCategory);
        this.currentClusteredObjectsInfo =
            this.getFlattenClusteredObjectsInfo(objectCategory);
        this.currentHeapObject = (0, HeapViewUtils_1.getHeapObjectAt)(this.currentHeapObjectsInfo, 0);
        this.componentIdToDataMap = new Map();
        this.componentIdToComponentMap = new Map();
        this.scriptManager = new e2e_1.ScriptManager();
        this.scriptManager.loadFromFiles();
    }
    getFocusedComponent() {
        return this.focusedComponent;
    }
    getFlattenHeapObjectsInfo(objectCategory) {
        let ret = [];
        for (const category of objectCategory.keys()) {
            const nodes = objectCategory.get(category);
            ret = [...ret, ...nodes];
        }
        return ret;
    }
    getFlattenClusteredObjectsInfo(objectCategory) {
        let ret = [];
        for (const category of objectCategory.keys()) {
            let nodes = objectCategory.get(category);
            if (this.shouldClusterCategory(category)) {
                nodes = this.clusterComponentDataItems(nodes);
            }
            ret = [...ret, ...nodes];
        }
        return ret;
    }
    shouldClusterCategory(category) {
        return category === 'detached';
    }
    clusterComponentDataItems(nodes) {
        const ret = [];
        const nodeIds = new Set(nodes
            .filter(node => node.heapObject)
            .map(node => { var _a, _b; return (_b = (_a = node.heapObject) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : -1; }));
        const clusters = core_1.analysis.clusterHeapObjects(nodeIds, this.heap);
        clusters.forEach(cluster => {
            var _a;
            const id = (_a = cluster.id) !== null && _a !== void 0 ? _a : -1;
            let node = null;
            node = this.heap.getNodeById(id);
            const details = new Map();
            if (cluster.count) {
                details.set('# of clusters', `${cluster.count}`);
            }
            if (cluster.retainedSize) {
                details.set('aggregated retained size', `${core_1.utils.getReadableBytes(cluster.retainedSize)}`);
            }
            ret.push({ tag: 'Cluster', heapObject: node, details });
        });
        return ret;
    }
    getComponentDataById(componentId) {
        var _a;
        return (_a = this.componentIdToDataMap.get(componentId)) !== null && _a !== void 0 ? _a : null;
    }
    getContent(componentId) {
        const ret = [];
        const data = this.componentIdToDataMap.get(componentId);
        if (data) {
            for (const item of data.items) {
                ret.push(HeapViewUtils_1.ComponentDataItem.getTextForDisplay(item));
            }
        }
        return ret;
    }
    setClusteredBox(component) {
        this.componentIdToComponentMap.set(component.id, component);
        this.clusteredBox = component;
        this.componentIdToDataMap.set(component.id, new HeapViewUtils_1.ComponentData());
    }
    getClusteredBoxData() {
        const data = new HeapViewUtils_1.ComponentData();
        data.selectedIdx = 0;
        data.items = this.currentClusteredObjectsInfo;
        return data;
    }
    setReferrerBox(component) {
        this.componentIdToComponentMap.set(component.id, component);
        this.referrerBox = component;
        this.componentIdToDataMap.set(component.id, new HeapViewUtils_1.ComponentData());
    }
    getReferrerBoxData(node = this.selectedHeapObject) {
        const data = new HeapViewUtils_1.ComponentData();
        node.forEachReferrer(ref => {
            var _a, _b;
            const tag = ref.fromNode.id === ((_b = (_a = node.pathEdge) === null || _a === void 0 ? void 0 : _a.fromNode) === null || _b === void 0 ? void 0 : _b.id) ? { tag: '<-' } : {};
            data.items.push(Object.assign({ heapObject: ref.fromNode, referenceEdge: ref }, tag));
            return { stop: false };
        });
        data.selectedIdx = data.items.length > 0 ? 0 : -1;
        return data;
    }
    setObjectBox(component) {
        this.componentIdToComponentMap.set(component.id, component);
        this.objectBox = component;
        this.componentIdToDataMap.set(component.id, new HeapViewUtils_1.ComponentData());
    }
    getObjectBoxData() {
        const data = new HeapViewUtils_1.ComponentData();
        const index = this.currentHeapObjectsInfo.findIndex(item => { var _a; return ((_a = item.heapObject) === null || _a === void 0 ? void 0 : _a.id) === this.currentHeapObject.id; });
        if (index >= 0) {
            data.selectedIdx = index;
        }
        else {
            data.selectedIdx = 0;
            this.currentHeapObjectsInfo.unshift({
                tag: 'Chosen',
                heapObject: this.currentHeapObject,
            });
        }
        data.items = this.currentHeapObjectsInfo;
        return data;
    }
    setReferenceBox(component) {
        this.componentIdToComponentMap.set(component.id, component);
        this.referenceBox = component;
        this.componentIdToDataMap.set(component.id, new HeapViewUtils_1.ComponentData());
    }
    getReferenceBoxData() {
        const data = new HeapViewUtils_1.ComponentData();
        this.selectedHeapObject.forEachReference(ref => {
            data.items.push({ referrerEdge: ref, heapObject: ref.toNode });
            return { stop: false };
        });
        data.items.sort((i1, i2) => { var _a, _b, _c, _d; return ((_b = (_a = i2.heapObject) === null || _a === void 0 ? void 0 : _a.retainedSize) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = i1.heapObject) === null || _c === void 0 ? void 0 : _c.retainedSize) !== null && _d !== void 0 ? _d : 0); });
        data.selectedIdx = data.items.length > 0 ? 0 : -1;
        return data;
    }
    setObjectPropertyBox(component) {
        this.componentIdToComponentMap.set(component.id, component);
        this.objectPropertyBox = component;
        this.componentIdToDataMap.set(component.id, new HeapViewUtils_1.ComponentData());
    }
    getObjectPropertyData(options = {}) {
        var _a, _b;
        const data = new HeapViewUtils_1.ComponentData();
        const node = this.selectedHeapObject;
        data.items.push({
            stringContent: this.getKeyValuePairString('id', `@${node.id}`),
        });
        data.items.push({
            stringContent: this.getKeyValuePairString('name', node.name),
        });
        data.items.push({
            stringContent: this.getKeyValuePairString('type', node.type),
        });
        data.items.push({
            stringContent: this.getKeyValuePairString('self size', core_1.utils.getReadableBytes(node.self_size)),
        });
        data.items.push({
            stringContent: this.getKeyValuePairString('retained size', core_1.utils.getReadableBytes(node.retainedSize)),
        });
        data.items.push({
            stringContent: this.getKeyValuePairString('# of references', node.edge_count),
        });
        data.items.push({
            stringContent: this.getKeyValuePairString('# of referrers', node.referrers.length),
        });
        if (node.dominatorNode) {
            data.items.push({
                stringContent: 'dominator node' + chalk_1.default.grey(': '),
                heapObject: node.dominatorNode,
            });
        }
        // if the node has associated location info
        const location = node.location;
        if (location) {
            data.items.push({
                stringContent: this.getKeyValuePairString('script id', location.script_id),
            });
            data.items.push({
                stringContent: this.getKeyValuePairString('line', location.line),
            });
            data.items.push({
                stringContent: this.getKeyValuePairString('column', location.column),
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        (_a = options.details) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => data.items.push({
            stringContent: self.getKeyValuePairString(key, value),
        }));
        // inject additional node information
        if (node.isString) {
            const stringNode = node.toStringNode();
            if (stringNode) {
                const value = this.getReadableString(stringNode.stringValue);
                data.items.push({
                    stringContent: this.getKeyValuePairString('string value', value),
                });
            }
        }
        if (node.type === 'number') {
            data.items.push({
                stringContent: this.getKeyValuePairString('numeric value', (_b = core_1.utils.getNumberNodeValue(node)) !== null && _b !== void 0 ? _b : '<error>'),
            });
        }
        if (node.type === 'closure') {
            const url = core_1.utils.getClosureSourceUrl(node);
            if (url) {
                data.items.push({
                    stringContent: this.getKeyValuePairString('code link', url),
                });
            }
            const closureVars = this.getClosureNodeScopeVarEdges(node);
            closureVars.forEach(edge => data.items.push({
                tag: chalk_1.default.grey('Outer Scope Var'),
                referrerEdge: edge,
                heapObject: edge.toNode,
            }));
        }
        data.selectedIdx = data.items.length > 0 ? 0 : -1;
        return data;
    }
    getReadableString(value) {
        return value.length > 300
            ? value.substring(0, 300) + chalk_1.default.grey('...')
            : value;
    }
    getKeyValuePairString(key, value) {
        return key + chalk_1.default.grey(': ') + chalk_1.default.green(value);
    }
    setRetainerTraceBox(component) {
        this.componentIdToComponentMap.set(component.id, component);
        this.retainerTracePropertyBox = component;
        this.componentIdToDataMap.set(component.id, new HeapViewUtils_1.ComponentData());
    }
    getRetainerTraceData() {
        var _a;
        const data = new HeapViewUtils_1.ComponentData();
        const node = this.selectedHeapObject;
        let curNode = node;
        while (curNode && !core_1.utils.isRootNode(curNode)) {
            if (!curNode.pathEdge) {
                curNode = null;
                break;
            }
            data.items.unshift({ referrerEdge: curNode.pathEdge, heapObject: curNode });
            curNode = (_a = curNode.pathEdge) === null || _a === void 0 ? void 0 : _a.fromNode;
        }
        if (curNode) {
            data.items.unshift({ heapObject: curNode });
        }
        data.selectedIdx = data.items.length > 0 ? 0 : -1;
        return data;
    }
    getHeapObject(componentId, itemIndex) {
        const data = this.componentIdToDataMap.get(componentId);
        if (!data) {
            return null;
        }
        const item = data.items[itemIndex];
        if (!item) {
            return null;
        }
        const heapObject = item.heapObject;
        if (!heapObject) {
            return null;
        }
        return heapObject;
    }
    displaySourceCode(componentId, itemIndex) {
        const node = this.getHeapObject(componentId, itemIndex);
        if (node && node.type === 'closure') {
            this.displayClosureInfo(node);
        }
    }
    // locate and display source code of a closure node
    // in a worker thread
    displayClosureInfo(node) {
        const url = core_1.utils.getClosureSourceUrl(node);
        if (!url) {
            return;
        }
        const closureVars = this.getClosureNodeScopeVarEdges(node).map(edge => `${edge.name_or_index}`);
        const workerData = {
            url,
            closureVars,
        };
        new worker_threads_1.Worker(path_1.default.join(__dirname, '..', 'worker', 'LocateClosureSourceWorker.js'), { workerData });
    }
    getClosureNodeScopeVarEdges(node) {
        const internalReferences = new Set(['map', 'scope_info', 'previous']);
        const contextNode = node.getReferenceNode('context', 'internal');
        const ret = [];
        if (contextNode) {
            contextNode.forEachReference(edge => {
                const name = `${edge.name_or_index}`;
                if (!internalReferences.has(name)) {
                    ret.push(edge);
                }
            });
        }
        return ret;
    }
    setCurrentHeapObjectFromComponent(componentId, itemIndex, options = {}) {
        const heapObject = this.getHeapObject(componentId, itemIndex);
        if (heapObject) {
            this.setCurrentHeapObject(heapObject, options);
        }
    }
    setCurrentHeapObject(node, options = {}) {
        this.currentHeapObject = node;
        // set clustered box's data and content
        const clusteredBoxData = this.getClusteredBoxData();
        this.componentIdToDataMap.set(this.clusteredBox.id, clusteredBoxData);
        this.clusteredBox.setContent(this.getContent(this.clusteredBox.id));
        this.clusteredBox.selectIndex(clusteredBoxData.selectedIdx);
        // must set label here again so the additional label info
        // can render with updated component data
        this.clusteredBox.setLabel('Clustered Objects');
        // set object box's data and content
        const objectBoxData = this.getObjectBoxData();
        this.componentIdToDataMap.set(this.objectBox.id, objectBoxData);
        this.objectBox.setContent(this.getContent(this.objectBox.id));
        this.objectBox.selectIndex(objectBoxData.selectedIdx);
        // must set label here again so the additional label info
        // can render with updated component data
        this.objectBox.setLabel('Objects');
        this.setSelectedHeapObject(node);
        if (!options.skipFocus) {
            this.focusOnComponent(this.clusteredBox.id);
        }
    }
    focusOnComponent(componentId) {
        var _a;
        for (const component of this.componentIdToComponentMap.values()) {
            if (component.id === componentId) {
                component.focus();
                this.focusedComponent = component;
                const data = this.componentIdToDataMap.get(componentId);
                const selectIndex = (_a = (data && data.selectedIdx)) !== null && _a !== void 0 ? _a : -1;
                this.setSelectedHeapObjectFromComponent(componentId, selectIndex);
            }
            else {
                component.loseFocus();
            }
        }
    }
    setSelectedHeapObjectFromComponent(componentId, itemIndex) {
        const data = this.componentIdToDataMap.get(componentId);
        if (!data) {
            return;
        }
        data.selectedIdx = itemIndex;
        const item = data.items[itemIndex];
        if (!item) {
            return;
        }
        const heapObject = item.heapObject;
        if (!heapObject) {
            return;
        }
        // if selecting in a specific box, do not update content in that box
        const noChangeInReferenceBox = componentId === this.referenceBox.id;
        const noChangeInReferrerBox = componentId === this.referrerBox.id;
        const noChangeInRetainerTraceBox = componentId === this.retainerTracePropertyBox.id;
        const noChangeInObjectPropertyBox = componentId === this.objectPropertyBox.id;
        this.setSelectedHeapObject(heapObject, {
            noChangeInReferenceBox,
            noChangeInReferrerBox,
            noChangeInRetainerTraceBox,
            noChangeInObjectPropertyBox,
            componentDataItem: item,
        });
    }
    setSelectedHeapObject(node, options = {}) {
        var _a;
        this.selectedHeapObject = node;
        // set referrer box's data and content
        if (!options.noChangeInReferrerBox) {
            const data = this.getReferrerBoxData();
            this.componentIdToDataMap.set(this.referrerBox.id, data);
            this.referrerBox.setContent(this.getContent(this.referrerBox.id));
            this.referrerBox.selectIndex(data.selectedIdx);
            this.referrerBox.setLabel(`Referrers of @${node.id}`);
        }
        // set reference box's data and content
        if (!options.noChangeInReferenceBox) {
            const data = this.getReferenceBoxData();
            this.componentIdToDataMap.set(this.referenceBox.id, data);
            this.referenceBox.setContent(this.getContent(this.referenceBox.id));
            this.referenceBox.selectIndex(data.selectedIdx);
            this.referenceBox.setLabel(`References of @${node.id}`);
        }
        // set object property box's data and content
        if (!options.noChangeInObjectPropertyBox) {
            const propertyOption = ((_a = options === null || options === void 0 ? void 0 : options.componentDataItem) === null || _a === void 0 ? void 0 : _a.details)
                ? { details: options.componentDataItem.details }
                : {};
            const data = this.getObjectPropertyData(propertyOption);
            this.componentIdToDataMap.set(this.objectPropertyBox.id, data);
            this.objectPropertyBox.setContent(this.getContent(this.objectPropertyBox.id));
            this.objectPropertyBox.selectIndex(data.selectedIdx);
            this.objectPropertyBox.setLabel(`Object: @${node.id}`);
        }
        // set retainer trace box's data and content
        if (!options.noChangeInRetainerTraceBox) {
            const data = this.getRetainerTraceData();
            this.componentIdToDataMap.set(this.retainerTracePropertyBox.id, data);
            this.retainerTracePropertyBox.setContent(this.getContent(this.retainerTracePropertyBox.id));
            this.retainerTracePropertyBox.selectIndex(data.selectedIdx);
            this.retainerTracePropertyBox.setLabel(`Retainer Trace of @${node.id}`);
        }
    }
}
exports.default = HeapViewController;
