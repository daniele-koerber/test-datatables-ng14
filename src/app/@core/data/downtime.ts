
export abstract class DowntimeData {
  getDowntimesByProcessCellPath(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  getDowntimesByDisplayGroupId(displayGroupId: number): any {
    throw new Error('Method not implemented.');
  }
  getNotJustifiedDowntimesCountByProcessCellPath(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  getNotJustifiedDowntimesCountByDisplayGroupId(displayGroupId: number): any {
    throw new Error('Method not implemented.');
  }
  getDowntimesReasons(): any {
    throw new Error('Method not implemented.');
  }
  getDowntimeSettings(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  saveDowntimeSettings(processCellPath: string, data: any): any {
    throw new Error('Method not implemented.');
  }
  submitDowntimeAcknowledge(id: number, confirmedMachineId: number, confirmedMachineComponentId: number, confirmedReasonId: number, notes: string): any {
    throw new Error('Method not implemented.');
  }
}
