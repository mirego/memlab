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
const core_1 = require("@memlab/core");
const ScriptManager_1 = __importDefault(require("./ScriptManager"));
const patterns = ['*'];
class NetworkManager {
    constructor(page) {
        this.cdpSession = null;
        this.page = page;
        this.requestCache = new Map();
        this.scriptManager = new ScriptManager_1.default();
    }
    setCDPSession(session) {
        this.cdpSession = session;
    }
    networkLog(msg) {
        if (core_1.config.verbose) {
            core_1.info.lowLevel(msg);
        }
    }
    interceptScript() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = this.cdpSession;
            if (!session) {
                core_1.info.warning('Network manager does not have connection to Chrome DevTools.');
                return;
            }
            const requestCache = this.requestCache;
            yield session.send('Network.enable');
            yield session.send('Network.setRequestInterception', {
                // when extending the interception scope, make sure
                // also update the resourceTypeToSuffix function in ScriptManager
                patterns: [
                    // .js scripts
                    ...patterns.map(pattern => ({
                        urlPattern: pattern,
                        resourceType: 'Script',
                        interceptionStage: 'HeadersReceived',
                    })),
                    // .css stylesheets
                    ...patterns.map(pattern => ({
                        urlPattern: pattern,
                        resourceType: 'Stylesheet',
                        interceptionStage: 'HeadersReceived',
                    })),
                    // .html documents
                    ...patterns.map(pattern => ({
                        urlPattern: pattern,
                        resourceType: 'Document',
                        interceptionStage: 'HeadersReceived',
                    })),
                ],
            });
            session.on('Network.requestIntercepted', ({ interceptionId, request, responseHeaders, resourceType }) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.networkLog(`Intercepted ${request.url} {interception id: ${interceptionId}}`);
                const response = (yield session.send('Network.getResponseBodyForInterception', { interceptionId }));
                // responseHeaders could be null if requesting from
                // local files (i.e., urls starting with 'file:///')
                let contentType = null;
                if (responseHeaders) {
                    const contentTypeHeader = (_a = Object.keys(responseHeaders).find(k => k.toLowerCase() === 'content-type')) !== null && _a !== void 0 ? _a : '';
                    contentType = responseHeaders[contentTypeHeader];
                }
                let newBody = '';
                if (requestCache.has(response.body)) {
                    newBody = requestCache.get(response.body);
                }
                else {
                    const bodyData = response.base64Encoded
                        ? atob(response.body)
                        : response.body;
                    newBody = bodyData;
                    try {
                        if (resourceType === 'Script') {
                            newBody = yield this.scriptManager.rewriteScript(bodyData, {
                                url: request.url,
                                resourceType,
                            });
                        }
                    }
                    catch (e) {
                        this.networkLog(`Failed to process ${request.url} {interception id: ${interceptionId}}: ${e}`);
                    }
                    requestCache.set(response.body, newBody);
                    this.scriptManager.logScript(request.url, newBody, resourceType);
                }
                const newHeaders = [
                    'Date: ' + new Date().toUTCString(),
                    'Connection: closed',
                    'Content-Length: ' + newBody.length,
                ];
                if (contentType) {
                    newHeaders.push('Content-Type: ' + contentType);
                }
                this.networkLog(`Continuing interception ${interceptionId}`);
                const rawResponse = btoa(['HTTP/1.1 200 OK', ...newHeaders, '', newBody].join('\r\n'));
                session.send('Network.continueInterceptedRequest', {
                    interceptionId,
                    rawResponse,
                });
            }));
        });
    }
}
exports.default = NetworkManager;
