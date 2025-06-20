"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blessed_1 = __importDefault(require("blessed"));
const chalk_1 = __importDefault(require("chalk"));
const string_width_1 = __importDefault(require("string-width"));
const HeapViewUtils_1 = require("./HeapViewUtils");
/**
 * A ListComponent is an UI list component in CLI.
 * It managers all the UI events related to the
 * list component (e.g., scroll up, down, left, right, and other key strokes)
 */
class ListComponent {
    static nextId() {
        return ListComponent.nextComponentId++;
    }
    constructor(content, callbacks, options) {
        this.labelText = '';
        this.controller = null;
        this.listIndex = 0;
        this.content = [];
        this.moreEntryIndex = -1;
        this.focusKey = '';
        this.id = ListComponent.nextId();
        this.horizonScrollPositionMap = new Map();
        this.callbacks = callbacks;
        // init list element
        this.element = blessed_1.default.list(Object.assign(Object.assign({}, options), { tags: false, scrollable: true, keys: true, border: {
                fg: 'grey',
                type: 'line',
            }, style: {
                item: {
                    fg: 'white',
                    bg: 'default',
                },
                selected: {
                    bg: 'grey',
                },
            } }));
        this.setContent(content);
        this.registerKeys();
    }
    setController(controller) {
        this.controller = controller;
    }
    // render the whole screen
    render() {
        if (this.callbacks.render) {
            this.callbacks.render();
        }
    }
    static createEntryForMore(more) {
        const key = chalk_1.default.inverse('enter');
        return chalk_1.default.grey(` ${more} more ... (select and ${key} to load)`);
    }
    registerKeys() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.element.on('keypress', (char, key) => {
            const content = self.content;
            // if selecting "More"
            if (key.name === 'enter' &&
                content.length > 0 &&
                self.listIndex >= 0 &&
                self.listIndex === self.moreEntryIndex) {
                self.loadMoreContent();
                return;
            }
            // if press 'd'
            if (key.name === 'd' || key.name === 'D') {
                self.selectUpdate(self.listIndex, content, {
                    keyName: key.name,
                });
            }
            // move selection down
            if (key.name === 'down' && self.listIndex < self.displayedItems - 1) {
                self.element.select(++self.listIndex);
                self.selectUpdate(self.listIndex, content, {
                    keyName: key.name,
                });
                // move selection up
            }
            else if (key.name === 'up' && self.listIndex > 0) {
                self.element.select(--self.listIndex);
                self.selectUpdate(self.listIndex, content, {
                    keyName: key.name,
                });
                // hit enter to select the current heap object
            }
            else if (key.name === 'enter') {
                self.selectUpdate(self.listIndex, content, {
                    keyName: key.name,
                });
                // scroll left
            }
            else if (key.name === 'left') {
                self.scrollLeft();
                // scroll right
            }
            else if (key.name === 'right') {
                self.scrollRight();
            }
        });
    }
    scrollLeft() {
        var _a;
        const selectedContent = this.content[this.listIndex];
        if (!selectedContent) {
            return;
        }
        let offset = 0;
        if (this.horizonScrollPositionMap.has(this.listIndex)) {
            offset = (_a = this.horizonScrollPositionMap.get(this.listIndex)) !== null && _a !== void 0 ? _a : 0;
        }
        if (offset === 0) {
            return;
        }
        this.horizonScrollPositionMap.set(this.listIndex, --offset);
        let newContent = (0, HeapViewUtils_1.substringWithColor)(selectedContent, offset);
        if (offset > 0) {
            newContent = chalk_1.default.grey('...') + newContent;
        }
        this.element.spliceItem(this.listIndex, 1, newContent);
        this.element.select(this.listIndex);
    }
    scrollRight() {
        var _a;
        const selectedContent = this.content[this.listIndex];
        if (!selectedContent || (0, string_width_1.default)(selectedContent) <= 5) {
            return;
        }
        let offset = 0;
        if (this.horizonScrollPositionMap.has(this.listIndex)) {
            offset = (_a = this.horizonScrollPositionMap.get(this.listIndex)) !== null && _a !== void 0 ? _a : 0;
        }
        this.horizonScrollPositionMap.set(this.listIndex, ++offset);
        let newContent = (0, HeapViewUtils_1.substringWithColor)(selectedContent, offset);
        if (offset > 0) {
            newContent = chalk_1.default.grey('...') + newContent;
        }
        this.element.spliceItem(this.listIndex, 1, newContent);
        this.element.select(this.listIndex);
    }
    focus() {
        this.element.focus();
        this.element.setFront();
        this.element.style.border.fg = 'white';
        this.element.style.selected = {
            bg: 'grey',
            bold: true,
        };
        this.getFocus();
    }
    loseFocus() {
        this.element.style.border.fg = 'grey';
        this.element.style.selected = {
            bg: 'black',
            bold: false,
        };
    }
    selectIndex(index) {
        while (this.displayedItems <= index &&
            this.displayedItems < this.content.length) {
            this.loadMoreContent();
        }
        this.listIndex = index;
        this.element.select(index);
    }
    setFocusKey(key) {
        this.focusKey = key;
    }
    setLabel(label, option = {}) {
        this.labelText = label;
        let componentLabel = label + chalk_1.default.grey(` (press ${chalk_1.default.inverse(this.focusKey)} to focus)`);
        if (this.controller) {
            const data = this.controller.getComponentDataById(this.id);
            if (data) {
                componentLabel += chalk_1.default.grey(` ${data.items.length} items`);
            }
        }
        if (option.nextTick) {
            process.nextTick(() => {
                this.element.setLabel(componentLabel);
            });
        }
        else {
            this.element.setLabel(componentLabel);
        }
    }
    setContent(content) {
        const oldContent = this.content;
        this.element.clearItems();
        this.displayedItems = 0;
        this.moreEntryIndex = -1;
        this.listIndex = 0;
        // push list items into the list
        for (let i = 0; i < content.length; ++i) {
            if (this.displayedItems >= ListComponent.ListContentLimit) {
                break;
            }
            this.element.pushItem(content[i]);
            ++this.displayedItems;
        }
        this.content = content.map(v => v.replace(/\n/g, '\\n'));
        this.horizonScrollPositionMap.clear();
        this.insertDisplayMoreEntry();
        this.updateContent(oldContent, this.content);
    }
    loadMoreContent() {
        if (this.moreEntryIndex < 0) {
            return;
        }
        const curIndex = this.listIndex;
        this.removeDisplayMoreEntry();
        let idx = this.displayedItems;
        const limit = Math.min(this.displayedItems + ListComponent.loadMore, this.content.length);
        while (idx < limit) {
            this.element.pushItem(this.content[idx++]);
        }
        this.displayedItems = limit;
        this.insertDisplayMoreEntry();
        this.selectIndex(curIndex);
        this.render();
    }
    removeDisplayMoreEntry() {
        this.element.spliceItem(this.displayedItems - 1, 1);
        this.moreEntryIndex = -1;
        --this.displayedItems;
        --this.listIndex;
    }
    // insert the display more entry
    insertDisplayMoreEntry() {
        if (this.displayedItems < this.content.length) {
            this.element.pushItem(ListComponent.createEntryForMore(this.content.length - this.displayedItems));
            ++this.displayedItems;
            this.moreEntryIndex = this.displayedItems - 1;
        }
    }
    // function to be overridden
    updateContent(oldContent, newContent) {
        if (this.callbacks.updateContent) {
            this.callbacks.updateContent(oldContent, newContent);
        }
    }
    // function to be overridden
    getFocus() {
        if (this.callbacks.getFocus) {
            this.callbacks.getFocus();
        }
    }
    selectUpdate(index, content, selectInfo) {
        if (this.callbacks.selectCallback) {
            this.callbacks.selectCallback(this.id, index, content, selectInfo);
        }
    }
}
exports.default = ListComponent;
ListComponent.ListContentLimit = 100;
ListComponent.loadMore = 100;
ListComponent.nextComponentId = 0;
