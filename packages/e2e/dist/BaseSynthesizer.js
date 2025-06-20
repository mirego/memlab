"use strict";
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
const SynthesisUtils_1 = __importDefault(require("./lib/SynthesisUtils"));
const InteractionUtils_1 = __importDefault(require("./lib/operations/InteractionUtils"));
const E2EUtils_1 = __importDefault(require("./lib/E2EUtils"));
// for debugging only
const skipAllScreenshot = false;
class BaseSynthesizer {
    constructor(config) {
        this.config = config;
        this.init();
        this.postInit();
        // define steps
        this.steps = new Map();
        for (const step of this.getAvailableSteps()) {
            this.steps.set(step.name, step);
        }
        this.injectBuiltInSteps();
        this._repeatIntermediate = 1;
        // define visit plans
        this.plans = new Map();
        for (const plan of this.getAvailableVisitPlans()) {
            this.plans.set(plan.name, plan);
        }
    }
    injectBuiltInSteps() {
        const backStep = SynthesisUtils_1.default.backStep;
        this.steps.set(backStep.name, backStep);
        const revertStep = SynthesisUtils_1.default.revertStep;
        this.steps.set(revertStep.name, revertStep);
    }
    repeatIntermediate(n) {
        this._repeatIntermediate = n;
    }
    init() {
        this.repeatIntermediate(this.config.repeatIntermediateTabs);
    }
    postInit() {
        // for overriding
    }
    getAppName() {
        const error = new Error('BaseSynthesizer.getAppName is not implemented');
        error.stack;
        throw error;
    }
    getOrigin() {
        const domain = this.getDomain();
        if (domain === '' || domain == null) {
            return null;
        }
        if (domain.startsWith('.')) {
            return `https://${domain.substring(1)}`;
        }
        return `https://${domain}`;
    }
    getDomain() {
        const error = new Error('BaseSynthesizer.getDomain is not implemented');
        error.stack;
        throw error;
    }
    getDomainPrefixes() {
        return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCookieFile(_visitPlan) {
        const error = new Error('BaseSynthesizer.getCookieFile is not implemented');
        error.stack;
        throw error;
    }
    getAvailableSteps() {
        const error = new Error('BaseSynthesizer.getAvailableSteps is not implemented');
        error.stack;
        throw error;
    }
    getNodeNameBlocklist() {
        return [];
    }
    getEdgeNameBlocklist() {
        return [];
    }
    getDefaultStartStepName() {
        const error = new Error('BaseSynthesizer.getDefaultStartStepName is not implemented');
        error.stack;
        throw error;
    }
    injectPlan(stepName, scenario) {
        this.plans.set(stepName, this.synthesisForScenario(scenario));
    }
    // given a target step name, returns the visit order sequence
    synthesisForTarget(stepName) {
        if (!this.plans.has(stepName)) {
            core_1.utils.haltOrThrow(`target ${stepName} is unknown to synthesizers`);
        }
        return this.plans.get(stepName);
    }
    // return a list of visit plans for the target app
    getAvailableVisitPlans() {
        const error = new Error('BaseSynthesizer.getAvailableVisitPlans is not implemented');
        error.stack;
        throw error;
    }
    getAvailableTargetNames(opt = {}) {
        const filterCb = opt.filterCb;
        let plans = Array.from(this.plans.values());
        if (filterCb) {
            plans = plans.filter(filterCb);
        }
        return plans.map(plan => plan.name);
    }
    // get the default number of warmups
    getNumberOfWarmup() {
        return 1;
    }
    // get the URL of the target app
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getBaseURL(_options = {}) {
        return 'https://www.facebook.com';
    }
    getNormalizedBaseURL(options = {}) {
        const url = core_1.utils.normalizeBaseUrl(this.getBaseURL(options));
        return url;
    }
    // get URL parameters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getURLParameters(_options = {}) {
        return '';
    }
    // get default (mobile) device name
    // if nothing specified, it's considered running in desktop / laptop
    getDevice() {
        return 'pc';
    }
    // append additional interactions based on step info
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getExtraOperationsForStep(_stepInfo) {
        return [];
    }
    // get default callback for checking page load
    getPageLoadChecker() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (_page) => __awaiter(this, void 0, void 0, function* () {
            yield InteractionUtils_1.default.waitFor(this.config.delayWhenNoPageLoadCheck);
            return true;
        });
    }
    getPageSetupCallback() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (_page) => __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    synthesis(baseline, target, intermediates, options = {}) {
        const type = options.type;
        if (!type || type === 'standard') {
            return this.synthesisStandard(baseline, target, intermediates, options);
        }
        if (type === 'simple') {
            return this.synthesisSimple(baseline, target, options);
        }
        if (type === 'repeat') {
            return this.synthesisRepeat(baseline, target, intermediates, options);
        }
        if (type === 'init-page-load') {
            return this.synthesisInitialPageLoad(target, intermediates, options);
        }
        throw core_1.utils.haltOrThrow(`unknown visit plan type: ${type}`);
    }
    getActualNumberOfWarmup() {
        return this.getNumberOfWarmup() + (this.config.isContinuousTest ? 1 : 0);
    }
    synthesisInitPart(baseline, target, options) {
        // default start from the home tab
        const start = options.start || this.getDefaultStartStepName();
        const visitOrder = [];
        // first visit the start step
        visitOrder.push(this.getAction(start, 'init'));
        // if provided, some initial setup to prepare states or data
        if (options.setupSteps) {
            for (const stepName of options.setupSteps) {
                visitOrder.push(this.getAction(stepName));
            }
        }
        // if provided, warm up with specified steps
        if (options.warmupSteps) {
            for (const stepName of options.warmupSteps) {
                visitOrder.push(this.getAction(stepName));
            }
        }
        else {
            // by default, warm up the baseline and target onces
            visitOrder.push(this.getAction(baseline));
            visitOrder.push(this.getAction(target));
        }
        return visitOrder;
    }
    synthesisFinalPart(visitOrder, baseline, intermediates, options = {}) {
        // visit intermediate steps twice
        for (let i = 0; i < this._repeatIntermediate; i++) {
            for (const step of intermediates) {
                visitOrder.push(this.getAction(step));
            }
        }
        // visit the final step
        const final = options.final || baseline;
        visitOrder.push(this.getAction(final, 'final'));
        // if provided, some cleanup to restore states
        if (options.cleanupSteps) {
            for (const stepName of options.cleanupSteps) {
                visitOrder.push(this.getAction(stepName));
            }
        }
    }
    // synthesis for a new type of memory stress testing
    // that repeats a series of steps
    synthesisRepeat(baseline, target, _, options = {}) {
        const visitOrder = this.synthesisInitPart(baseline, target, options);
        // visit baseline
        visitOrder.push(this.getAction(baseline, 'baseline'));
        let repeat = options.repeat != null ? options.repeat : this.config.stressTestRepeat;
        if (options.repeatSteps) {
            while (repeat-- > 0) {
                for (const step of options.repeatSteps) {
                    visitOrder.push(this.getAction(step));
                }
            }
        }
        else {
            while (repeat-- > 0) {
                // repeatedly visit the baseline and target
                visitOrder.push(this.getAction(target));
                visitOrder.push(this.getAction(baseline));
            }
        }
        visitOrder.push(this.getAction(target, 'target'));
        // if provided, some cleanup to restore states
        if (options.cleanupSteps) {
            for (const stepName of options.cleanupSteps) {
                visitOrder.push(this.getAction(stepName));
            }
        }
        return {
            name: options.name || `${baseline}-${target}`,
            appName: this.getAppName(),
            type: 'repeat',
            newTestUser: !!options.newTestUser,
            device: this.getDevice(),
            baseURL: this.getNormalizedBaseURL(options),
            URLParameters: this.getURLParameters(options),
            tabsOrder: visitOrder,
            numOfWarmup: this.getActualNumberOfWarmup(),
            dataBuilder: options.dataBuilder,
            isPageLoaded: this.getPageLoadChecker(),
            pageSetup: this.getPageSetupCallback(),
        };
    }
    synthesisStandard(baseline, target, intermediates, options = {}) {
        const visitOrder = this.synthesisInitPart(baseline, target, options);
        // actually visit the baseline and target
        visitOrder.push(this.getAction(baseline, 'baseline'));
        visitOrder.push(this.getAction(target, 'target'));
        // intermediate steps, final step, and cleanup steps
        this.synthesisFinalPart(visitOrder, baseline, intermediates, options);
        return {
            name: options.name || target,
            appName: this.getAppName(),
            type: 'standard',
            newTestUser: !!options.newTestUser,
            device: this.getDevice(),
            baseURL: this.getNormalizedBaseURL(options),
            URLParameters: this.getURLParameters(options),
            tabsOrder: visitOrder,
            numOfWarmup: this.getActualNumberOfWarmup(),
            dataBuilder: options.dataBuilder,
            isPageLoaded: this.getPageLoadChecker(),
            pageSetup: this.getPageSetupCallback(),
        };
    }
    processStepUrl(url) {
        let ret = url;
        while (ret.startsWith('/')) {
            ret = ret.substring(1);
        }
        return ret;
    }
    synthesisForScenario(scenario) {
        var _a;
        const visitOrder = [];
        const url = this.processStepUrl(scenario.url());
        const startStep = {
            name: 'page-load',
            url,
            interactions: [],
        };
        if (!scenario.action) {
            visitOrder.push(this.getActionFromStep(startStep, 'target'));
        }
        else {
            // first visit the start step
            visitOrder.push(this.getActionFromStep(startStep, 'baseline'));
            const actionStep = {
                name: 'action-on-page',
                url,
                interactions: [scenario.action],
            };
            const revertStep = {
                name: 'revert',
                url,
                interactions: [scenario.back],
            };
            const getRevertStep = (stepType) => scenario.back
                ? this.getActionFromStep(revertStep, stepType)
                : this.getAction(SynthesisUtils_1.default.revertStep.name, stepType);
            const repeat = scenario.repeat ? scenario.repeat() : 0;
            for (let i = 0; i < repeat; ++i) {
                visitOrder.push(this.getActionFromStep(actionStep));
                visitOrder.push(getRevertStep());
            }
            visitOrder.push(this.getActionFromStep(actionStep, 'target'));
            visitOrder.push(getRevertStep('final'));
        }
        return {
            name: core_1.utils.getScenarioName(scenario),
            appName: E2EUtils_1.default.getScenarioAppName(scenario),
            type: 'scenario',
            newTestUser: false,
            device: this.getDevice(),
            baseURL: this.getNormalizedBaseURL(),
            URLParameters: this.getURLParameters(),
            tabsOrder: visitOrder,
            numOfWarmup: this.getActualNumberOfWarmup(),
            dataBuilder: null,
            isPageLoaded: (_a = scenario.isPageLoaded) !== null && _a !== void 0 ? _a : this.getPageLoadChecker(),
            pageSetup: this.getPageSetupCallback(),
            scenario,
        };
    }
    synthesisSimple(start, target, options = {}) {
        const visitOrder = [];
        // first visit the start step
        visitOrder.push(this.getAction(start, 'baseline'));
        visitOrder.push(this.getAction(target, 'target'));
        visitOrder.push(this.getAction(SynthesisUtils_1.default.revertStep.name, 'final'));
        return {
            name: options.name || target,
            appName: this.getAppName(),
            type: 'simple',
            newTestUser: !!options.newTestUser,
            device: this.getDevice(),
            baseURL: this.getNormalizedBaseURL(options),
            URLParameters: this.getURLParameters(options),
            tabsOrder: visitOrder,
            numOfWarmup: this.getActualNumberOfWarmup(),
            dataBuilder: options.dataBuilder,
            isPageLoaded: this.getPageLoadChecker(),
            pageSetup: this.getPageSetupCallback(),
        };
    }
    synthesisInitialPageLoad(target, intermediates, options = {}) {
        const visitOrder = [];
        // visit the target page/tab
        visitOrder.push(this.getAction(target, 'target'));
        if (intermediates.length > 0) {
            // intermediate steps, final step, and cleanup steps
            if (!options.final) {
                throw core_1.utils.haltOrThrow(`${target}-init-load doesn't have a final step`);
            }
            this.synthesisFinalPart(visitOrder, options.final, intermediates, options);
        }
        return {
            name: options.name || `${target}-init-load`,
            appName: this.getAppName(),
            type: 'init-page-load',
            newTestUser: !!options.newTestUser,
            device: this.getDevice(),
            baseURL: this.getNormalizedBaseURL(options),
            URLParameters: this.getURLParameters(options),
            tabsOrder: visitOrder,
            numOfWarmup: this.getActualNumberOfWarmup(),
            dataBuilder: options.dataBuilder,
            isPageLoaded: this.getPageLoadChecker(),
            pageSetup: this.getPageSetupCallback(),
        };
    }
    getActionFromStep(step, type, snapshot, screenshot) {
        const action = Object.assign({}, step);
        return this.fillInInfo(action, type, snapshot, screenshot);
    }
    getAction(stepName, type, snapshot, screenshot) {
        const step = this.steps.get(stepName);
        if (!step) {
            throw core_1.utils.haltOrThrow(`step ${stepName} doesn't exist`);
        }
        return this.getActionFromStep(step, type, snapshot, screenshot);
    }
    // by default take snapshot for baseline, target, and final step
    shouldTakeSnapshot(option) {
        const type = option.type;
        return type === 'baseline' || type === 'target' || type === 'final';
    }
    // by default every step takes one screenshot
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldTakeScreenshot(_option) {
        return true;
    }
    fillInInfo(actionBasic, type, snapshot, screenshot) {
        const action = Object.assign({}, actionBasic);
        // fill in snapshot and screenshot instructions
        if (typeof snapshot !== 'boolean') {
            snapshot = this.shouldTakeSnapshot({ action, type });
        }
        if (typeof screenshot !== 'boolean') {
            screenshot = this.shouldTakeScreenshot({ action, type });
        }
        action.snapshot = this.config.skipSnapshot ? false : snapshot;
        action.screenshot = skipAllScreenshot ? false : screenshot;
        if (type && type !== 'init') {
            action.type = type;
        }
        const interactions = action.interactions;
        // fill in extra interactions
        if (!Array.isArray(interactions)) {
            action.interactions = [interactions];
        }
        action.interactions = action.interactions.concat(this.getExtraOperationsForStep(action));
        // make sure action.url is normalized
        while (action.url.startsWith('/')) {
            action.url = action.url.substring(1);
        }
        return action;
    }
}
exports.default = BaseSynthesizer;
