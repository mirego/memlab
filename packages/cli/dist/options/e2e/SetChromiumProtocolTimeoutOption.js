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
const OptionConstant_1 = __importDefault(require("../lib/OptionConstant"));
class SetChromiumProtocolTimeoutOption extends core_1.BaseOption {
    getOptionName() {
        return OptionConstant_1.default.optionNames.CHROMIUM_PROTOCOL_TIMEOUT;
    }
    getDescription() {
        return ('set the protocol timeout for chromium connection (in ms). \n' +
            'The current default value is 180000, you may want to increase the ' +
            'timeout via this flag when the heap snapshot is ' +
            'too big (e.g., over 1GB) and the Page crashed with error: ' +
            "'ProtocolError: HeapProfiler.takeHeapSnapshot timed out'.");
    }
    parse(config, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = this.getOptionName();
            const arg = args[name];
            if (arg) {
                const timeout = parseInt(arg, 10);
                if (Number.isNaN(timeout)) {
                    core_1.utils.haltOrThrow(`Invalid Chromium protocol timeout value: ${arg}. ` +
                        'It must be a number.');
                }
                if (config.verbose) {
                    core_1.info.lowLevel(`Set Chromium protocol timeout to ${timeout}.`);
                }
                config.puppeteerConfig.protocolTimeout = timeout;
            }
        });
    }
}
exports.default = SetChromiumProtocolTimeoutOption;
