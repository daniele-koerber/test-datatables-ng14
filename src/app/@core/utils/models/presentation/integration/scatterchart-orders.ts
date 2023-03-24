import {
  timeRange_BE,
  itemOEE_BE,
  MachinesScatter_BE,
  ScatterChartOrders_BE,
  ScatterChartShifts_BE,
  ScatterChartSummaryShifts_BE,
} from "../../backend/integration/scatterchart-orders";

export interface timeRange_FE extends timeRange_BE  {}

export interface itemOEE_FE extends itemOEE_BE {
  expanded: boolean
}

export interface MachinesScatter_FE extends MachinesScatter_BE {}

export interface ScatterChartOrders_FE extends ScatterChartOrders_BE {}

export interface ScatterChartShifts_FE extends ScatterChartShifts_BE {}

export interface ScatterChartSummaryShifts_FE extends ScatterChartSummaryShifts_BE {}
