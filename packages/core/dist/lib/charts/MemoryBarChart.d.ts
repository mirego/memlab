/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { PlotMemoryOptions } from '../Types';
declare class MemoryBarChart {
    plotMemoryBarChart(options?: PlotMemoryOptions): void;
    private isPlotDataValid;
    private loadPlotDataFromTabsOrder;
    private loadPlotDataFromWorkDir;
    private loadPlotData;
    private mergePlotData;
}
declare const _default: MemoryBarChart;
export default _default;
//# sourceMappingURL=MemoryBarChart.d.ts.map