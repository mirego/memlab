"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HeapViewUtils_1 = require("./HeapViewUtils");
const blessed_1 = __importDefault(require("blessed"));
const ListComponent_1 = __importDefault(require("./ListComponent"));
const HeapViewController_1 = __importDefault(require("./HeapViewController"));
const chalk_1 = __importDefault(require("chalk"));
function positionToNumber(info) {
    return parseInt(`${info}`);
}
/*
 * The CliScreen component managers the screen layout
 * all the UI components in CLI.
 *
 * Screen Layout:
 * ┌─Referrers ────────┐┌─Clustered Objects ┐┌─References ───────┐
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * │                   ││                   │└───────────────────┘
 * │                   ││                   │┌─Retainer Trace ───┐
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * └───────────────────┘│                   ││                   │
 * ┌─Objects ──────────┐│                   ││                   │
 * │                   ││                   ││                   │
 * │                   │└───────────────────┘│                   │
 * │                   │┌─Object Detail ────┐│                   │
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * │                   ││                   ││                   │
 * └───────────────────┘└───────────────────┘└───────────────────┘
 */
class CliScreen {
    constructor(title, heap, objectCategory) {
        this.currentFocuseKey = 1;
        this.fullScreenComponent = null;
        this.heapController = new HeapViewController_1.default(heap, objectCategory);
        this.screen = this.initScreen(title);
        const callbacks = this.initCallbacks(this.heapController, this.screen);
        this.keyToComponent = new Map();
        this.referrerBox = this.initReferrerBox(callbacks);
        this.heapController.setReferrerBox(this.referrerBox);
        this.objectBox = this.initObjectBox(callbacks);
        this.heapController.setObjectBox(this.objectBox);
        this.clusteredObjectBox = this.initClusteredObjectBox(callbacks);
        this.heapController.setClusteredBox(this.clusteredObjectBox);
        this.referenceBox = this.initReferenceBox(callbacks);
        this.heapController.setReferenceBox(this.referenceBox);
        this.objectPropertyBox = this.initObjectPropertyBox(callbacks);
        this.heapController.setObjectPropertyBox(this.objectPropertyBox);
        this.retainerTraceBox = this.initRetainerTraceBox(callbacks);
        this.helperTextElement = this.initHelperText();
        this.heapController.setRetainerTraceBox(this.retainerTraceBox);
        this.registerEvents();
        this.setFirstObjectAsCurrrent(objectCategory);
    }
    setFirstObjectAsCurrrent(objectCategory) {
        const keys = Array.from(objectCategory.keys());
        if (keys.length === 0) {
            return;
        }
        let nodes;
        for (const key of keys) {
            nodes = objectCategory.get(key);
            if (nodes && nodes.length > 0) {
                break;
            }
        }
        if (nodes && nodes.length > 0) {
            this.heapController.setCurrentHeapObject((0, HeapViewUtils_1.getHeapObjectAt)(nodes, 0));
        }
    }
    initScreen(title) {
        return blessed_1.default.screen({
            smartCSR: true,
            title: title,
        });
    }
    initCallbacks(controller, screen) {
        const selectDebounce = (0, HeapViewUtils_1.debounce)(150);
        const selectCallback = (componentId, index, content, selectInfo) => {
            if (selectInfo.keyName === 'd' || selectInfo.keyName === 'D') {
                selectDebounce(() => {
                    controller.displaySourceCode(componentId, index);
                    screen.render();
                });
            }
            else if (selectInfo.keyName === 'enter') {
                selectDebounce(() => {
                    controller.setCurrentHeapObjectFromComponent(componentId, index);
                    screen.render();
                });
            }
            else if (selectInfo.keyName === 'up' || selectInfo.keyName === 'down') {
                selectDebounce(() => {
                    controller.setSelectedHeapObjectFromComponent(componentId, index);
                    screen.render();
                });
            }
        };
        return {
            selectCallback,
            render: () => screen.render(),
        };
    }
    start() {
        this.screen.render();
    }
    registerEvents() {
        this.registerKeys();
        this.registerScreenResize();
    }
    registerScreenResize() {
        const screen = this.screen;
        screen.on('resize', this.updateAllComponentsSize.bind(this));
    }
    updateAllComponentsSize() {
        // all boxes/lists needs to resize
        this.updateComponentSize(this.clusteredObjectBox, this.getClusteredObjectBoxSize());
        this.updateComponentSize(this.referrerBox, this.getReferrerBoxSize());
        this.updateComponentSize(this.objectBox, this.getObjectBoxSize());
        this.updateComponentSize(this.objectPropertyBox, this.getObjectPropertyBoxSize());
        this.updateComponentSize(this.referenceBox, this.getReferenceBoxSize());
        this.updateComponentSize(this.retainerTraceBox, this.getRetainerTraceBoxSize());
        if (this.fullScreenComponent != null) {
            this.updateComponentSize(this.fullScreenComponent, this.getComponentFullScreenSize());
        }
        this.updateElementSize(this.helperTextElement, this.getHelperTextSize());
    }
    updateComponentSize(component, size) {
        this.updateElementSize(component.element, size);
    }
    updateElementSize(element, size) {
        element.width = size.width;
        element.height = size.height;
        element.top = size.top;
        element.left = size.left;
    }
    registerKeys() {
        const screen = this.screen;
        // Quit on Escape, q, or Control-C.
        screen.key(['escape', 'q', 'C-c'], () => {
            if (this.fullScreenComponent != null) {
                // exit component full screen mode
                this.makeNoComponentFullScreen();
            }
            else {
                // quit the program
                process.exit(0);
            }
        });
        const keyToComponent = this.keyToComponent;
        const heapController = this.heapController;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const callback = (char, key) => {
            if (keyToComponent.has(char)) {
                // focus on the selected element
                const component = keyToComponent.get(char);
                if (component) {
                    if (component !== this.fullScreenComponent) {
                        // quit full screen mode if the component to focus
                        // is not the current full screen component
                        this.makeNoComponentFullScreen();
                    }
                    heapController.focusOnComponent(component.id);
                    screen.render();
                }
            }
            // enter full screen
            if (char === 'f') {
                this.makeComponentFullScreen(heapController.getFocusedComponent());
            }
        };
        screen.on('keypress', callback);
    }
    makeComponentFullScreen(component) {
        this.fullScreenComponent = component;
        this.updateAllComponentsSize();
    }
    makeNoComponentFullScreen() {
        this.fullScreenComponent = null;
        this.updateAllComponentsSize();
    }
    addComponentToFocusKeyMap(component) {
        const key = `${this.currentFocuseKey++}`;
        this.keyToComponent.set(key, component);
        return key;
    }
    getNextFocusKey() {
        return `${this.currentFocuseKey}`;
    }
    initClusteredObjectBox(callbacks) {
        const box = new ListComponent_1.default([], callbacks, Object.assign({}, this.getClusteredObjectBoxSize()));
        box.setController(this.heapController);
        box.setFocusKey(this.getNextFocusKey());
        box.setLabel('Clustered Objects');
        this.screen.append(box.element);
        this.addComponentToFocusKeyMap(box);
        return box;
    }
    getClusteredObjectBoxSize() {
        return {
            width: Math.floor(positionToNumber(this.screen.width) / 3),
            height: Math.floor((2 * positionToNumber(this.screen.height)) / 3),
            top: 0,
            left: Math.floor(positionToNumber(this.screen.width) / 3),
        };
    }
    initReferrerBox(callbacks) {
        const box = new ListComponent_1.default([], callbacks, Object.assign({}, this.getReferrerBoxSize()));
        box.setController(this.heapController);
        box.setFocusKey(this.getNextFocusKey());
        box.setLabel('Referrers');
        this.screen.append(box.element);
        this.addComponentToFocusKeyMap(box);
        return box;
    }
    getReferrerBoxSize() {
        return {
            width: Math.floor(positionToNumber(this.screen.width) / 3),
            height: Math.floor(positionToNumber(this.screen.height) / 2),
            top: 0,
            left: 0,
        };
    }
    initObjectBox(callbacks) {
        const box = new ListComponent_1.default([], callbacks, Object.assign({}, this.getObjectBoxSize()));
        box.setController(this.heapController);
        box.setFocusKey(this.getNextFocusKey());
        box.setLabel('Objects');
        this.screen.append(box.element);
        this.addComponentToFocusKeyMap(box);
        return box;
    }
    getComponentFullScreenSize() {
        return {
            width: positionToNumber(this.screen.width) - 4,
            height: positionToNumber(this.screen.height) - 5,
            top: 2,
            left: 2,
        };
    }
    getObjectBoxSize() {
        return {
            width: Math.floor(positionToNumber(this.screen.width) / 3),
            height: positionToNumber(this.screen.height) -
                Math.floor(positionToNumber(this.screen.height) / 2) -
                1,
            top: Math.floor(positionToNumber(this.screen.height) / 2),
            left: 0,
        };
    }
    initObjectPropertyBox(callbacks) {
        const box = new ListComponent_1.default([], callbacks, Object.assign({}, this.getObjectPropertyBoxSize()));
        box.setController(this.heapController);
        box.setFocusKey(this.getNextFocusKey());
        box.setLabel('Objects Detail');
        this.screen.append(box.element);
        this.addComponentToFocusKeyMap(box);
        return box;
    }
    getObjectPropertyBoxSize() {
        return {
            width: Math.floor(positionToNumber(this.screen.width) / 3),
            height: positionToNumber(this.screen.height) -
                Math.floor((2 * positionToNumber(this.screen.height)) / 3) -
                1,
            top: Math.floor((2 * positionToNumber(this.screen.height)) / 3),
            left: Math.floor(positionToNumber(this.screen.width) / 3),
        };
    }
    initReferenceBox(callbacks) {
        const box = new ListComponent_1.default([], callbacks, Object.assign({}, this.getReferenceBoxSize()));
        box.setController(this.heapController);
        box.setFocusKey(this.getNextFocusKey());
        box.setLabel('References');
        this.screen.append(box.element);
        this.addComponentToFocusKeyMap(box);
        return box;
    }
    getReferenceBoxSize() {
        return {
            width: positionToNumber(this.screen.width) -
                Math.floor((2 * positionToNumber(this.screen.width)) / 3),
            height: Math.floor(positionToNumber(this.screen.height) / 3),
            top: 0,
            left: Math.floor((2 * positionToNumber(this.screen.width)) / 3),
        };
    }
    initRetainerTraceBox(callbacks) {
        const box = new ListComponent_1.default([], callbacks, Object.assign({}, this.getRetainerTraceBoxSize()));
        box.setController(this.heapController);
        box.setFocusKey(this.getNextFocusKey());
        box.setLabel('Retainer Trace');
        this.screen.append(box.element);
        this.addComponentToFocusKeyMap(box);
        return box;
    }
    getRetainerTraceBoxSize() {
        return {
            width: positionToNumber(this.screen.width) -
                Math.floor((2 * positionToNumber(this.screen.width)) / 3),
            height: positionToNumber(this.screen.height) -
                Math.floor(positionToNumber(this.screen.height) / 3) -
                1,
            top: Math.floor(positionToNumber(this.screen.height) / 3),
            left: Math.floor((2 * positionToNumber(this.screen.width)) / 3),
        };
    }
    getHelperTextContent() {
        const keys = {
            '↑': '',
            '↓': '',
            '←': '',
            '→': '',
            Enter: 'select',
            f: 'full screen',
            q: 'quit',
        };
        const keysToFocus = Array.from(this.keyToComponent.keys());
        const descArr = [...Object.keys(keys), ...keysToFocus].map((key) => {
            const description = keys[key];
            return description
                ? chalk_1.default.inverse(key) + `(${description})`
                : chalk_1.default.inverse(key);
        });
        return chalk_1.default.grey('Keys: ' + descArr.join(' '));
    }
    initHelperText() {
        const text = blessed_1.default.text(Object.assign(Object.assign({}, this.getHelperTextSize()), { content: this.getHelperTextContent() }));
        this.screen.append(text);
        return text;
    }
    getHelperTextSize() {
        return {
            width: positionToNumber(this.screen.width),
            height: 1,
            top: positionToNumber(this.screen.height) - 1,
            left: 1,
        };
    }
}
exports.default = CliScreen;
