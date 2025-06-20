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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TfidfVectorizer = void 0;
const Config_1 = __importDefault(require("../../../lib/Config"));
const Ngram_1 = require("./Ngram");
const SMOOTHING_KEY = '__smoothObjectKey';
const VOCAB_IDX_FOR_DOC_WITH_HIGH_DF = '-1';
class TfidfVectorizer {
    constructor({ rawDocuments, maxDF }) {
        this.rawDocuments = [];
        this.vocabulary = Object.create(null);
        this.documentFrequency = Object.create(null);
        this.documents = [];
        this.rawDocuments = rawDocuments;
        this.maxDF = maxDF !== null && maxDF !== void 0 ? maxDF : Config_1.default.mlMaxDF;
    }
    computeTfidfs() {
        const tokenizedDocuments = this.rawDocuments.map(this.tokenize);
        this.vocabulary = this.buildVocabulary(tokenizedDocuments);
        this.processDocuments(tokenizedDocuments);
        this.limit();
        this.smooth();
        this.tfidfs = this.buildTfidfs();
        return this.tfidfs;
    }
    tokenize(text) {
        const terms = text.split(' ');
        return [...terms, ...(0, Ngram_1.nGram)(2, terms), ...(0, Ngram_1.nGram)(3, terms)];
    }
    buildVocabulary(tokenizedDocuments) {
        let vocabIdx = 0;
        const vocabulary = Object.create(null);
        tokenizedDocuments.forEach(doc => {
            doc.forEach(term => {
                if (!vocabulary[String(term)]) {
                    vocabulary[String(term)] = String(vocabIdx);
                    vocabIdx++;
                }
            });
        });
        return vocabulary;
    }
    processDocuments(tokenizedDocuments) {
        tokenizedDocuments.forEach(terms => {
            const document = {};
            terms.forEach(t => {
                const vocabIdx = this.vocabulary[t];
                if (document[vocabIdx]) {
                    document[vocabIdx] += 1;
                }
                else {
                    if (this.documentFrequency[vocabIdx]) {
                        this.documentFrequency[vocabIdx] += 1;
                    }
                    else {
                        this.documentFrequency[vocabIdx] = 1;
                    }
                    document[vocabIdx] = 1;
                }
            });
            this.documents.push(document);
        });
    }
    limit() {
        const nMaxDF = Math.floor(this.documents.length * this.maxDF);
        const vocabIdxsToDelete = [];
        this.documents.forEach(doc => {
            Object.keys(doc).forEach(vocabIdx => {
                if (this.documentFrequency[vocabIdx] > nMaxDF) {
                    delete doc[vocabIdx];
                    vocabIdxsToDelete.push(vocabIdx);
                }
            });
        });
        vocabIdxsToDelete.forEach(vocabIdx => {
            delete this.documentFrequency[vocabIdx];
            delete this.vocabulary[vocabIdx];
        });
    }
    /**
     * Smooth idf weights by adding 1 to document frequencies (DF), as if an extra
     * document was seen containing every term in the collection exactly once.
     * This prevents zero divisions.
     * */
    smooth() {
        // for each vocabulary
        Object.values(this.vocabulary).forEach(vocabIdx => (this.documentFrequency[vocabIdx] =
            this.documentFrequency[vocabIdx] + 1));
        this.documents.push({ [SMOOTHING_KEY]: 1 });
    }
    buildTfidfs() {
        const tfidfs = [];
        this.documents.forEach(document => {
            // this means all the terms in the document are the terms
            // that have high document frequency.
            // This will make all the docs with high DF to be clustered together.
            if (Object.keys(document).length === 0) {
                tfidfs.push({ [VOCAB_IDX_FOR_DOC_WITH_HIGH_DF]: 1 });
                return;
            }
            if (!document[SMOOTHING_KEY]) {
                const atfidf = Object.keys(document).map(vocabIdx => {
                    return [vocabIdx, this.tf(vocabIdx, document) * this.idf(vocabIdx)];
                });
                // normalizing the values
                const dotSum = atfidf
                    .map(([_, tfidfValue]) => tfidfValue * tfidfValue)
                    .reduce((sum, tfidfValueSquered) => sum + tfidfValueSquered, 0);
                const dotSumSqrRoot = Math.sqrt(dotSum);
                // Normalizing tfidfs
                const atfidfVocabIdxValueObject = atfidf
                    .map(([vocabIdx, tfidfValue]) => [
                    vocabIdx,
                    tfidfValue / dotSumSqrRoot,
                ])
                    .reduce((obj, [vocabIdx, value]) => {
                    obj[vocabIdx] = value;
                    return obj;
                }, {});
                tfidfs.push(atfidfVocabIdxValueObject);
            }
        });
        return tfidfs;
    }
    tf(vocabIdx, document) {
        return 1 + Math.log(document[vocabIdx]);
    }
    idf(vocabIdx) {
        return (1 + Math.log(this.documents.length / this.documentFrequency[vocabIdx]));
    }
}
exports.TfidfVectorizer = TfidfVectorizer;
