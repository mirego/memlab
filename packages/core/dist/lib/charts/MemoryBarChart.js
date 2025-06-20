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
const babar_1 = __importDefault(require("babar"));
const Config_1 = __importDefault(require("../Config"));
const Console_1 = __importDefault(require("../Console"));
const Utils_1 = __importDefault(require("../Utils"));
const FileManager_1 = __importDefault(require("../FileManager"));
class MemoryBarChart {
    plotMemoryBarChart(options = {}) {
        if (Config_1.default.useExternalSnapshot || options.snapshotDir) {
            return;
        }
        let plotData;
        try {
            plotData = this.loadPlotData(options);
        }
        catch (ex) {
            Console_1.default.warning(`plot data not load correctly: ${Utils_1.default.getError(ex).message}`);
            return;
        }
        if (!this.isPlotDataValid(plotData)) {
            if (Config_1.default.verbose) {
                Console_1.default.warning('no memory usage data to plot');
            }
            return;
        }
        // normalize plot data
        const minY = 1;
        const maxY = plotData.reduce((m, v) => Math.max(m, v[1]), 0) * 1.15;
        const yFractions = 1;
        const yLabelWidth = 1 +
            Math.max(minY.toFixed(yFractions).length, maxY.toFixed(yFractions).length);
        const maxWidth = process.stdout.columns - 10;
        const idealWidth = Math.max(2 * plotData.length + 2 * yLabelWidth, 10);
        const plotWidth = Math.min(idealWidth, maxWidth);
        Console_1.default.topLevel('Memory usage across all steps:');
        Console_1.default.topLevel((0, babar_1.default)(plotData, {
            color: 'green',
            width: plotWidth,
            height: 10,
            xFractions: 0,
            yFractions,
            minY,
            maxY,
        }));
        Console_1.default.topLevel('');
    }
    isPlotDataValid(plotData) {
        if (plotData.length === 0) {
            return false;
        }
        let isEntryValueAllZero = true;
        for (const entry of plotData) {
            if (entry.length !== 2) {
                return false;
            }
            if (entry[1] !== 0) {
                isEntryValueAllZero = false;
            }
        }
        return !isEntryValueAllZero;
    }
    loadPlotDataFromTabsOrder(tabsOrder) {
        for (const tab of tabsOrder) {
            if (!(tab.JSHeapUsedSize > 0)) {
                if (Config_1.default.verbose) {
                    Console_1.default.error('Memory usage data incomplete');
                }
                return [];
            }
        }
        const plotData = tabsOrder.map((tab, idx) => [
            idx + 1,
            ((tab.JSHeapUsedSize / 100000) | 0) / 10,
        ]);
        // the graph component cannot handle an array with a single element
        while (plotData.length < 2) {
            plotData.push([plotData.length + 1, 0]);
        }
        return plotData;
    }
    loadPlotDataFromWorkDir(options = {}) {
        const tabsOrder = Utils_1.default.loadTabsOrder(FileManager_1.default.getSnapshotSequenceMetaFile(options));
        return this.loadPlotDataFromTabsOrder(tabsOrder);
    }
    loadPlotData(options = {}) {
        // plot data for a single run
        if (!options.controlWorkDirs && !options.treatmentWorkDirs) {
            return this.loadPlotDataFromWorkDir(options);
        }
        // plot data for control and test run
        const controlPlotData = this.loadPlotDataFromWorkDir({
            workDir: options.controlWorkDirs && options.controlWorkDirs[0],
        });
        const testPlotData = this.loadPlotDataFromWorkDir({
            workDir: options.treatmentWorkDirs && options.treatmentWorkDirs[0],
        });
        // merge plot data
        return this.mergePlotData([controlPlotData, testPlotData]);
    }
    mergePlotData(plotDataArray) {
        const plotData = [];
        let xIndex = 1; // starts from 1
        for (let i = 0; i < plotDataArray.length; ++i) {
            const data = plotDataArray[i];
            for (const [, yValue] of data) {
                plotData.push([xIndex++, yValue]);
            }
            // push blank separators
            if (i < plotDataArray.length - 1) {
                for (let k = 0; k < 3; ++k) {
                    plotData.push([xIndex++, 0]);
                }
            }
        }
        return plotData;
    }
}
exports.default = new MemoryBarChart();
