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
/// <reference types="node" />
type ReadFileOptions = {
    startSignature?: string;
    endSignature?: string;
    inclusive?: boolean;
};
type NodeFSError = NodeJS.ErrnoException | null;
declare class StringLoader {
    processErrorIfNotNull(err: NodeFSError): void;
    readFile(file: string, options?: ReadFileOptions): Promise<string>;
    readFileAndExcludeTypedArray(file: string, fieldsToIgnore: string[]): Promise<string>;
    readFileAndExtractTypedArray(file: string, field: string): Promise<Uint32Array>;
}
declare const _default: StringLoader;
export default _default;
//# sourceMappingURL=StringLoader.d.ts.map