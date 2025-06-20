/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
interface TfidfVectorizerProps {
    rawDocuments: string[];
    maxDF?: number;
}
export declare class TfidfVectorizer {
    rawDocuments: string[];
    vocabulary: Record<string, string>;
    documentFrequency: Record<string, number>;
    maxDF: number;
    documents: Record<string, number>[];
    tfidfs: Record<string, number>[];
    constructor({ rawDocuments, maxDF }: TfidfVectorizerProps);
    computeTfidfs(): Record<string, number>[];
    tokenize(text: string): string[];
    buildVocabulary(tokenizedDocuments: string[][]): Record<string, string>;
    processDocuments(tokenizedDocuments: string[][]): void;
    limit(): void;
    /**
     * Smooth idf weights by adding 1 to document frequencies (DF), as if an extra
     * document was seen containing every term in the collection exactly once.
     * This prevents zero divisions.
     * */
    smooth(): void;
    buildTfidfs(): Record<string, number>[];
    tf(vocabIdx: string, document: Record<string, number>): number;
    idf(vocabIdx: string): number;
}
export {};
//# sourceMappingURL=TfidfVectorizer.d.ts.map