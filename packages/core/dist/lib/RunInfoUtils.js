"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunMetaInfoManager = void 0;
const fs_1 = __importDefault(require("fs"));
const BrowserInfo_1 = __importDefault(require("./BrowserInfo"));
const Config_1 = __importDefault(require("./Config"));
const Constant_1 = __importDefault(require("./Constant"));
const FileManager_1 = __importDefault(require("./FileManager"));
const Utils_1 = __importDefault(require("./Utils"));
const InternalValueSetter_1 = require("./InternalValueSetter");
class RunMetaInfoManager {
    getRunMetaFilePath(options) {
        if ((options === null || options === void 0 ? void 0 : options.workDir) != null) {
            return FileManager_1.default.getRunMetaFile({ workDir: options.workDir });
        }
        if ((options === null || options === void 0 ? void 0 : options.readonly) && Config_1.default.useExternalSnapshot) {
            // only returns the template file if the
            // run meta file is used for readonly purpose
            return Config_1.default.externalRunMetaTemplateFile;
        }
        if (Config_1.default.runMetaFile != null) {
            return Config_1.default.runMetaFile;
        }
        return FileManager_1.default.getRunMetaFile();
    }
    saveRunMetaInfo(runMetaInfo, options) {
        var _a;
        const runMetaFile = this.getRunMetaFilePath(options);
        const serializable = Object.assign(Object.assign({}, runMetaInfo), { extraInfo: Object.assign(Object.assign({}, Utils_1.default.mapToObject(Config_1.default.extraRunInfoMap)), Utils_1.default.mapToObject((_a = options === null || options === void 0 ? void 0 : options.extraRunInfo) !== null && _a !== void 0 ? _a : new Map())) });
        fs_1.default.writeFileSync(runMetaFile, JSON.stringify(serializable, null, 2), 'UTF-8');
        return runMetaFile;
    }
    loadRunMetaInfoFromFile(file) {
        const content = fs_1.default.readFileSync(file, 'UTF-8');
        const runMetaInfo = JSON.parse(content);
        if (runMetaInfo && runMetaInfo.extraInfo) {
            Config_1.default.extraRunInfoMap = Utils_1.default.objectToMap(runMetaInfo.extraInfo);
        }
        return runMetaInfo;
    }
    loadRunMetaInfo(options) {
        const file = (options === null || options === void 0 ? void 0 : options.metaFile) ||
            this.getRunMetaFilePath(Object.assign({ readonly: true }, options));
        try {
            return this.loadRunMetaInfoFromFile(file);
        }
        catch (_) {
            throw Utils_1.default.haltOrThrow('Run info missing. Please make sure `memlab run` is complete.');
        }
    }
    loadRunMetaInfoSilentFail(options) {
        const file = (options === null || options === void 0 ? void 0 : options.metaFile) ||
            this.getRunMetaFilePath(Object.assign({ readonly: true }, options));
        try {
            return this.loadRunMetaInfoFromFile(file);
        }
        catch (_) {
            return null;
        }
    }
    loadRunMetaExternalTemplate() {
        const runMetaTemplateFile = FileManager_1.default.getRunMetaExternalTemplateFile();
        return JSON.parse(fs_1.default.readFileSync(runMetaTemplateFile, 'UTF-8'));
    }
    setConfigFromRunMeta(options = {}) {
        const meta = (options === null || options === void 0 ? void 0 : options.silentFail)
            ? this.loadRunMetaInfoSilentFail(options)
            : this.loadRunMetaInfo(options);
        if (meta == null) {
            return;
        }
        if ((meta === null || meta === void 0 ? void 0 : meta.app) == null || (meta === null || meta === void 0 ? void 0 : meta.interaction) == null) {
            if (options === null || options === void 0 ? void 0 : options.silentFail) {
                return;
            }
            throw Utils_1.default.haltOrThrow('No app or interaction infomation');
        }
        Config_1.default.targetApp = meta.app;
        Config_1.default.targetTab = meta.interaction;
        BrowserInfo_1.default.load(meta.browserInfo);
    }
}
exports.RunMetaInfoManager = RunMetaInfoManager;
const runInfoUtils = { runMetaInfoManager: new RunMetaInfoManager() };
(0, InternalValueSetter_1.setInternalValue)(runInfoUtils, __filename, Constant_1.default.internalDir);
/** @internal */
exports.default = runInfoUtils;
