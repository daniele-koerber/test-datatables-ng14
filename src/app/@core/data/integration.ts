import { ActualMachineStatus_BE } from "../utils/models/backend/integration/actual-machine-status";
import { AlarmSummary_BE } from "../utils/models/backend/integration/alarm-summary";
import { LineStatus } from "../utils/models/backend/integration/line-status";
import { LiveData_BE, MachineLiveData_BE } from "../utils/models/backend/integration/live-data";
import { ClientAggregatedMachineHistoryResponse } from "../utils/models/backend/integration/machine-history";
import { MachineOEE } from "../utils/models/backend/integration/machine-oee";
import { MachinesStatusHistory_BE } from "../utils/models/backend/integration/machine-status-history";
import { MachineStatusInMinutes_BE } from "../utils/models/backend/integration/machine-status-in-minutes";
import { SpeedAndSetPoints_BE } from "../utils/models/backend/integration/speed-and-set-points";
import { ClientProducedDefectiveParts } from "../utils/models/presentation/integration/client-produced-defective-parts";
import { OEE } from "../utils/models/presentation/integration/oee";
import { ParameterBatchDetail } from "../utils/models/presentation/integration/parameter-batch-detail";
import { ScatterChartOrders_FE, ScatterChartShifts_FE } from "../utils/models/presentation/integration/scatterchart-orders";
export abstract class IntegrationData {
  getMomAlarmsNotificationsByProcessCellPath(processCellPath: string): any{
    throw new Error('Method not implemented.');
  }

  getMomAlarmsNotificationsCountByProcessCellPath(processCellPath: string): any{
    throw new Error('Method not implemented.');
  }

  getDowntimeCount(processCellPath: string, from: Date, to: Date): any {
    throw new Error('Method not implemented.');
  }

  getMomAlarmsNotificationsByDisplayGroupId(displayGroupId: any): any{
    throw new Error('Method not implemented.');
  }

  getMomAlarmsNotificationsCountByDisplayGroupId(displayGroupId: any): any{
    throw new Error('Method not implemented.');
  }

  getMachinesCurrentStateByProcessCellPath(dateStart, dateEnd, processCellPath, numberOfHoursDisplayedOnOverview,showAllMachine,getAllPoints): any {
    throw new Error('Method not implemented.');
  }

  getMachineHistoryStateByProcessCellPath(dateStart, dateEnd, machinePath, numberOfHoursDisplayedOnOverview,getAllPoints): Promise<MachinesStatusHistory_BE> {
    throw new Error('Method not implemented.');
  }

  getMachineStatusInMinutes(processCellPath, dateStart, dateEnd, showAllMachine): Promise<MachineStatusInMinutes_BE> {
    throw new Error('Method not implemented.');
  }

  getStatusInMinutesByMachine(machinePath, dateStart, dateEnd, numberOfHours): Promise<MachineStatusInMinutes_BE>{
    throw new Error('Method not implemented.');
  }

  getLastMachineStatus(machineCellPath): Promise<ActualMachineStatus_BE> {
    throw new Error('Method not implemented.');
  }

  getMachineLineStatus(processCellPath, showAllMachine): Promise<LineStatus> {
    throw new Error('Method not implemented.');
  }

  getProcessCellSpeed(processCellPath): any {
    throw new Error('Method not implemented.');
  }

  getShiftEndByProcessCellPath(dateStart, dateEnd, processCellPath, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getShiftsEventsByProcessCellPath(dateStart, dateEnd, processCellPath, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getMachinesSpeed(processCellPath: string, timeSeriesStart: any, timeSeriesEnd: any, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }
  getMachineSpeed(machinePath: string, timeSeriesStart: any, timeSeriesEnd: any, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getMachinesLiveData(processCellPath: string, timeSeriesStart: any, timeSeriesEnd: any, numberOfHoursDisplayedOnOverview): Promise<LiveData_BE> {
    throw new Error('Method not implemented.');
  }


  getLiveData(machinePath: string, timeSeriesStart: any, timeSeriesEnd: any, numberOfHoursDisplayedOnOverview): Promise<MachineLiveData_BE> {
    throw new Error('Method not implemented.');
  }

  getProducedPartsSPPVEveryHour(processCellPath: string, dateStart: any, dateEnd: any, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getActualSpeedEveryTenMinutesOverview(processCellPath: string, dateStart: any, dateEnd: any, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getActualSpeedEveryTenMinutesReport(processCellPath: string, dateStart: any, dateEnd: any, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getTotalProducedParts(processCellPath, timeSeriesStart, timeSeriesEnd, showToast): any {
    throw new Error('Method not implemented.');
  }

  getTotalProducedAndDefectiveParts(processCellPath, dateStart, dateEnd): Promise<ClientProducedDefectiveParts> {
    throw new Error('Method not implemented.');
  }

  getOrderProducedAndDefectivePartsByMachine(processCellPath, orderId): any {
    throw new Error('Method not implemented.');
  }

  getProducedAndDefectivePartsByMachine(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getProductionCountersByMachine(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getSpeedSetPoint(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getTotalDowntimeInsecondsByTimeRange(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getBatchOEEData(dateStart, dateEnd): Promise<ScatterChartOrders_FE> {
    throw new Error('Method not implemented.');
  }

  getShiftOEEData(dateStart: any, dateEnd: any): Promise<ScatterChartShifts_FE> {
    throw new Error('Method not implemented.');
  }

  getDowntimeMachinesByProcessCellPath(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getPerformanceMachinesByProcessCellPath(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getMachineTimeinstateByProcessCellPath(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getDowntimeReasonsByProcessCellPath(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getDowntimeAlarmsByProcessCellPath(processCellPath, dateStart, dateEnd): any {
    throw new Error('Method not implemented.');
  }

  getAlarmsSummaryByProcessCellPath(processCellPath,showAllMachine, dateStart, dateEnd): Promise<AlarmSummary_BE> {
    throw new Error('Method not implemented.');
  }

  getMachinesOEEData(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview, isShift):Promise<MachineOEE>  {
    throw new Error('Method not implemented.');
  }


  getMachinesRunningBatchOEEData(processCellPath):Promise<MachineOEE>  {
    throw new Error('Method not implemented.');
  }

  getBatchParameterChanges(parameterName: string, productionOrder: string, unitPath: string): Promise<ParameterBatchDetail>{
    throw new Error('Method not implemented.');
  }

  getScatterShiftsSummary(from, to, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getDowntimes(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview): any {
    throw new Error('Method not implemented.');
  }

  getOEE(processCellPath: string, from: string, to: string, isShift: boolean): Promise<OEE> {
    throw new Error('Method not implemented.');
  }

  getShiftOEE(processCellPath: string, from: string, to: string): Promise<OEE> {
    throw new Error('Method not implemented.');
  }

  getOEECurrentBatch(processCellPath: string): Promise<OEE> {
    throw new Error('Method not implemented.');
  }
  // getCurrentBatchInformation(processCellPath: string, showToast: boolean): any {
  //   throw new Error('Method not implemented.');
  // }

  addGoodPieces(processCellPath: string, quantity: number): any {
    throw new Error('Method not implemented.');
  }

  addRejectedPieces(processCellPath: string, quantity: number): any {
    throw new Error('Method not implemented.');
  }

  getDowntimeSettings(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  saveDowntimeSettings(processCellPath: string, data: any): any {
    throw new Error('Method not implemented.');
  }
  saveCalendarSettings(processCellPath: string, data: any): any {
    throw new Error('Method not implemented.');
  }
  getSpeedAndSetPoints(processCellPath: string,dateStart: string, dateEnd: string, numberOfHoursDisplayedOnOverview:number): Promise<SpeedAndSetPoints_BE>{
    throw new Error('Method not implemented.');
  }
  getMachineFullHistory(machinePath: string, dateStart: string, dateEnd: string, numberOfHoursDisplayedOnOverview: number): Promise<ClientAggregatedMachineHistoryResponse>{
    throw new Error('Method not implemented.');
  }

}
