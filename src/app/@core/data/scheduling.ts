import { BatchesWithinShiftClient_BE } from "../utils/models/backend/scheduling/batches-within-shift-client";
import { ShiftClient_BE } from "../utils/models/backend/scheduling/shift-client";
import { CalendarTimeSlotWStartStopTimeNearestElements } from "../utils/models/presentation/scheduling/calendar-time-slot-workorder-start-stop-time-nearest-elements";
import { CalendarTimeSlotWOrderTime } from "../utils/models/presentation/scheduling/calendar-time-slot-workorder-time";
import { OrderClientGetModel } from "../utils/models/presentation/scheduling/order-client-get-model";
import { Shift } from "../utils/models/presentation/scheduling/shift";
import { ShiftClientNearestElements } from "../utils/models/presentation/scheduling/shift-client-nearest-elements";

export abstract class SchedulingData {
  getSchedulingChecks(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  getNotDoneSchedulingChecksCount(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  // downloadShiftsFile(processCellPath:string, from:any, to:any): any {
  //   throw new Error('Method not implemented.');
  // }
  uploadShiftsFile(processCellPath:string, from:any, to:any): any {
    throw new Error('Method not implemented.');
  }
  submitSchedulingCheck(data: any): any {
    throw new Error('Method not implemented.');
  }

  getNextBatches(processCellPath: string, skip: number, take: number ): Promise<CalendarTimeSlotWOrderTime[]>{
    throw new Error('Method not implemented.');
  }

  getNearestBatches(processCellPath, productionOrder, isReport): Promise<CalendarTimeSlotWStartStopTimeNearestElements>{
    throw new Error('Method not implemented.');
  }

  getBatchesTimeFiltered(processCellPath: string, from: any, to: any): any{
    throw new Error('Method not implemented.');
  }
  getShiftsTimeFiltered(processCellPath: string, from: any, to: any): any{
    throw new Error('Method not implemented.');
  }

  getOrder(processCellPath: string, id: string): Promise<CalendarTimeSlotWOrderTime> {
    throw new Error('Method not implemented.');
  }
  getOrders(): Promise<OrderClientGetModel[]> {
    throw new Error('Method not implemented.');
  }
  getOrdersList(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  deleteOrder(id: number): any {
    throw new Error('Method not implemented.');
  }
  unplanOrder(processCellPath: string, id: number): any {
    throw new Error('Method not implemented.');
  }

  availableTimeSlot(selectedProcessCellPath, productCode, targetQuantity, batchParameters): any {
    throw new Error('Method not implemented.');
  }

  getLastEmployedMachines(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  getEmployedMachines(processCellPath: string, from: any, to: any, includeNotReportingMachines: boolean): any {
    throw new Error('Method not implemented.');
  }

  getLastEmployedMachinesByProcessCellPath(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  getLastEmployedMachinesByDisplayGroup(displayGroup: string): any {
    throw new Error('Method not implemented.');
  }
  getEmployedMachinesByProcessCellPath(processCellPath: string, from: any, to: any, includeNotReportingMachines: boolean): any {
    throw new Error('Method not implemented.');
  }
  getEmployedMachinesByDisplayGroup(displayGroup: string, from: any, to: any, includeNotReportingMachines: boolean): any {
    throw new Error('Method not implemented.');
  }

  getCurrentShift(processCellPath: string): Promise<ShiftClient_BE> {
    throw new Error('Method not implemented.');
  }

  getNearestShifts(processCellPath, from, to, isReport): Promise<ShiftClientNearestElements> {
    throw new Error('Method not implemented.');
  }

  validateTimeSlot(processCellPath: string, productionOrder: any, productCode: any, targetQuantity: number, scheduledStartTime: any, scheduledEndTime: any, batchParameters: any ): any {
    throw new Error('Method not implemented.');
  }
  planPOFromERP(batchParameters, processCellPath: string, productionOrder: any, productCode: any, scheduledStartTime: any, scheduledEndTime: any ): any {
    throw new Error('Method not implemented.');
  }
  planPOFromScratch(batchParameters, processCellPath: string, productionOrder: any, productCode: any, targetQuantity: number, scheduledStartTime: any, scheduledEndTime: any ): any {
    throw new Error('Method not implemented.');
  }

  getShiftDefinitions(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }

  cloneShiftDefinitions(processCellPath: string, date: string): any {
    throw new Error('Method not implemented.');
  }

  updateShiftDefinition(processCellPath: string, data: any): any {
    throw new Error('Method not implemented.');
  }

  addShiftDefinition(processCellPath: string, shiftStart: any, shiftEnd: any): any {
    throw new Error('Method not implemented.');
  }
  deleteShiftDefinition(shiftId: number): any {
    throw new Error('Method not implemented.');
  }

  getTeams(): any {
    throw new Error('Method not implemented.');
  }

  // put /scheduling/teams/update
  updateTeam(data: any): any {
    throw new Error('Method not implemented.');
  }

  editShiftData(processCellPath: string, shift: any, shiftStartDatetime: any, shiftEndDatetime: any, refDate: any, slotId:number): any {
    throw new Error('Method not implemented.');
  }

  stopBatch(productionOrder: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  pauseBatch(productionOrder: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  resumeBatch(productionOrder: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  startBatch(productionOrder: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  editOrderData(productionOrder: string, newQuantity:number): any {
    throw new Error('Method not implemented.');
  }

  getBatchesWithinShift(processCellPath: string, from: any, to: any): Promise<BatchesWithinShiftClient_BE> {
    throw new Error('Method not implemented.');
  }
  searchProductionOrder(searchString: string): any {
    throw new Error('Method not implemented.');
  }

  generateProductionOrder(): any {
    throw new Error('Method not implemented.');
  }
}
