/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @lightSyntaxTransform
 * @oncall memory_lab
 */
import type { IHeapSnapshot } from './Types';
declare function getNodeIdsFromFile(file: string, _options?: {}): Promise<Set<number>>;
declare function parse(file: string, options?: {}): Promise<IHeapSnapshot>;
declare const _default: {
    getNodeIdsFromFile: typeof getNodeIdsFromFile;
    parse: typeof parse;
};
export default _default;
//# sourceMappingURL=HeapParser.d.ts.map