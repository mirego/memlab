/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPlanner = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@memlab/core");
const TestRunnerLoader_1 = __importDefault(require("../../TestRunnerLoader"));
const E2EUtils_1 = __importDefault(require("../E2EUtils"));
class TestPlanner {
    constructor(options = {}) {
        var _a;
        this.config = (_a = options.config) !== null && _a !== void 0 ? _a : core_1.config;
        this.synthesizers = new Map();
        this.scenario = null;
    }
    initSynthesizers() {
        if (this.synthesizers.size > 0) {
            return;
        }
        this.synthesizers = new Map();
        const runners = TestRunnerLoader_1.default.load();
        runners.forEach((Constructor) => {
            const synthesizer = new Constructor(this.config);
            this.synthesizers.set(synthesizer.getAppName(), synthesizer);
        });
    }
    getVisitPlan() {
        this.init();
        return this.visitPlan;
    }
    getCookies() {
        this.init();
        return this.cookies;
    }
    // get origin defined in config
    getOrigin() {
        this.init();
        return this.origin;
    }
    getSynthesizer(options = {}) {
        this.init(options);
        return this.synthesizer;
    }
    // preload synthesizer before other meta data is ready
    // this is mainly used for getting synthesizer settings
    preloadSynthesizer() {
        const targetApp = this.config.targetApp;
        this.initSynthesizers();
        if (!this.synthesizers.has(targetApp)) {
            core_1.utils.haltOrThrow(`unknown app: ${targetApp}`);
        }
        return this.synthesizers.get(targetApp);
    }
    init(options = {}) {
        this.initSynthesizers();
        const { visitPlan, cookies, synthesizer } = this.generateVisitPlan(options);
        this.visitPlan = visitPlan;
        this.cookies = cookies;
        this.origin = synthesizer.getOrigin();
        this.synthesizer = synthesizer;
    }
    prepareSynthesizer() {
        if (this.config.scenario) {
            this.scenario = this.config.scenario;
        }
        else {
            // otherwise no action since no scenario definition provided
            // config.targetTab and config.targetApp should be set
        }
        if (this.scenario) {
            this.config.targetTab = core_1.utils.getScenarioName(this.scenario);
            this.config.targetApp = E2EUtils_1.default.getScenarioAppName(this.scenario);
        }
        if (!this.synthesizers.has(this.config.targetApp)) {
            core_1.utils.haltOrThrow(`unknown app: ${this.config.targetApp}`);
        }
        const synthesizer = this.synthesizers.get(this.config.targetApp);
        // if running from a scenario file, register this
        // new scenario in the synthesizer
        if (this.scenario) {
            synthesizer.injectPlan(this.config.targetTab, this.scenario);
        }
        return synthesizer;
    }
    generateVisitPlan(options = {}) {
        const synthesizer = this.prepareSynthesizer();
        const visitPlan = synthesizer.synthesisForTarget(this.config.targetTab);
        this.assignSnapshotIds(visitPlan);
        this.setSnapshotMode(visitPlan);
        const cookies = options.needCookies === false
            ? []
            : this.loadCookies(visitPlan, synthesizer);
        return { visitPlan, cookies, synthesizer };
    }
    loadCookies(visitPlan, synthesizer) {
        var _a;
        if (this.scenario && this.scenario.cookies) {
            const cookies = this.scenario.cookies();
            return this.populateDomainInCookiesFromScenario(cookies, this.scenario);
        }
        let cookieFile = synthesizer.getCookieFile(visitPlan);
        // if no cookie file is specified
        if (cookieFile == null && this.config.externalCookiesFile == null) {
            return [];
        }
        cookieFile =
            (_a = this.config.externalCookiesFile) !== null && _a !== void 0 ? _a : path_1.default.join(this.config.persistentDataDir, cookieFile);
        if (!fs_1.default.existsSync(cookieFile)) {
            core_1.utils.haltOrThrow(`cookie file doesn't exist: ${cookieFile}`);
        }
        const cookies = JSON.parse(fs_1.default.readFileSync(cookieFile, 'UTF-8'));
        return this.populateDomainInCookies(cookies, synthesizer.getDomain(), synthesizer.getDomainPrefixes());
    }
    populateDomainInCookiesFromScenario(cookies, scenario) {
        const ret = [];
        if (cookies.length === 0) {
            return ret;
        }
        const url = new URL(scenario.url());
        const domain = '.' + url.hostname.split('.').slice(1).join('.');
        for (const cookie of cookies) {
            if (cookie.domain) {
                ret.push(Object.assign({}, cookie));
            }
            else {
                ret.push(Object.assign(Object.assign({}, cookie), { domain }));
            }
        }
        return ret;
    }
    populateDomainInCookies(cookies, domain, domainPrefixes) {
        const cookiesTemplate = cookies;
        const ret = [];
        const prefixes = new Set(['', ...domainPrefixes]);
        for (const prefix of prefixes) {
            for (const cookie of cookiesTemplate) {
                ret.push(Object.assign(Object.assign({}, cookie), { domain: `${prefix}${domain}` }));
            }
        }
        return ret;
    }
    setSnapshotMode(visitPlan) {
        if (!this.config.isFullRun) {
            return;
        }
        const tabsOrder = visitPlan.tabsOrder;
        for (const tab of tabsOrder) {
            tab.snapshot = true;
        }
    }
    assignSnapshotIds(visitPlan) {
        const tabsOrder = visitPlan.tabsOrder;
        let snapshotId = 1;
        for (const tab of tabsOrder) {
            tab.idx = snapshotId++;
        }
    }
    getAppNames() {
        this.initSynthesizers();
        const names = [];
        for (const synthesizer of this.synthesizers.values()) {
            names.push(synthesizer.getAppName());
        }
        return names;
    }
    getTargetNames(appName, options = {}) {
        this.initSynthesizers();
        if (!this.synthesizers.has(appName)) {
            core_1.utils.haltOrThrow(`unknown app: ${appName}`);
        }
        const synthesizer = this.synthesizers.get(appName);
        return synthesizer.getAvailableTargetNames(options);
    }
    getAllTargets(options = {}) {
        this.initSynthesizers();
        const ret = [];
        const apps = this.getAppNames();
        for (const app of apps) {
            const interactions = this.getTargetNames(app, options);
            for (const interaction of interactions) {
                ret.push({ app, interaction });
            }
        }
        return ret;
    }
}
exports.TestPlanner = TestPlanner;
exports.default = new TestPlanner();
