"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = __importDefault(require("../../../lib/Config"));
const NodeHeap_1 = require("../../../lib/NodeHeap");
beforeEach(() => {
    Config_1.default.isTest = true;
});
const timeout = 5 * 60 * 1000;
test('Check getReference and getReferenceNode', () => __awaiter(void 0, void 0, void 0, function* () {
    class TestObject {
        constructor() {
            this.property1 = { property2: 'test' };
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const injected = new TestObject();
    const checker = (heap) => {
        let detected = false;
        heap.nodes.forEach((node) => {
            if (node.name !== 'TestObject' || node.type !== 'object') {
                return;
            }
            // check testObject.property1 reference
            if (node.getReference('property1') == null) {
                return;
            }
            // check testObject.property1 reference with edge type
            if (node.getReference('property1', 'property') == null) {
                return;
            }
            // check testObject.property1 reference with edge type
            if (node.getReference('property1', 'internal') != null) {
                return;
            }
            // check testObject.property1 referenced node
            if (node.getReferenceNode('property1') == null) {
                return;
            }
            // check testObject.property1 referenced node with edge type
            if (node.getReferenceNode('property1', 'property') == null) {
                return;
            }
            // check testObject.property1 referenced node with edge type
            if (node.getReferenceNode('property1', 'internal') != null) {
                return;
            }
            // check testObject.property1.property2 referenced node
            const referencedNode = node.getReferenceNode('property1');
            if ((referencedNode === null || referencedNode === void 0 ? void 0 : referencedNode.getReferenceNode('property2')) == null) {
                return;
            }
            detected = true;
        });
        return detected;
    };
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    expect(checker(heap)).toBe(true);
}), timeout);
test('Check getReferrers and getReferrerNodes', () => __awaiter(void 0, void 0, void 0, function* () {
    const leakInjector = () => {
        const obj = { p1: { p2: { p3: 'test' } } };
        class TestObject {
            constructor() {
                this.prop = obj;
                this._p = obj;
            }
        }
        return [new TestObject(), new TestObject()];
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const injected = leakInjector();
    const checker = (heap) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const testObjects = [];
        // get all TestObjects
        heap.nodes.forEach((node) => {
            if (node.name === 'TestObject' && node.type === 'object') {
                testObjects.push(node);
            }
        });
        // there should be exactly 2 TestObjects
        if (testObjects.length !== 2) {
            return false;
        }
        // testObject.prop.p1.p2.p3 should be a string
        const strNode = (_d = (_c = (_b = (_a = testObjects[0]) === null || _a === void 0 ? void 0 : _a.getReferenceNode('prop')) === null || _b === void 0 ? void 0 : _b.getReferenceNode('p1')) === null || _c === void 0 ? void 0 : _c.getReferenceNode('p2')) === null || _d === void 0 ? void 0 : _d.getReferenceNode('p3');
        if (!strNode || strNode.type !== 'string') {
            return false;
        }
        // testObject.prop should have 2 referrering edges with name 'prop'
        let edges = (_e = testObjects[0].getReferenceNode('prop')) === null || _e === void 0 ? void 0 : _e.getReferrers('prop');
        if (!edges || edges.length !== 2) {
            return false;
        }
        // testObject.prop should have 2 referrering edges with name '_p'
        edges = (_f = testObjects[0].getReferenceNode('_p')) === null || _f === void 0 ? void 0 : _f.getReferrers('_p');
        if (!edges || edges.length !== 2) {
            return false;
        }
        // testObject.prop should have 2 unique referring nodes
        const nodes = (_g = testObjects[0]
            .getReferenceNode('prop')) === null || _g === void 0 ? void 0 : _g.getReferrerNodes('_p');
        if (!nodes || nodes.length !== 2) {
            return false;
        }
        // trace back to testObject from testObject.prop.p1.p2.p3
        const to = (_k = (_j = (_h = strNode
            .getReferrerNodes('p3')[0]) === null || _h === void 0 ? void 0 : _h.getReferrerNodes('p2')[0]) === null || _j === void 0 ? void 0 : _j.getReferrerNodes('p1')[0]) === null || _k === void 0 ? void 0 : _k.getReferrerNodes('prop')[0];
        if (!to || to.name !== 'TestObject') {
            return false;
        }
        if (!testObjects.some(o => o.id === to.id)) {
            return false;
        }
        return true;
    };
    const heap = yield (0, NodeHeap_1.takeNodeMinimalHeap)();
    expect(checker(heap)).toBe(true);
}), timeout);
