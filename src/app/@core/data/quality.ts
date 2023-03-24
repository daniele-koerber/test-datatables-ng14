import { ClientCheckSummaryResponse } from "../utils/models/backend/quality/clientCheckSummaryResponse";

export abstract class QualityData {
  getQualityChecksByProcessCellPath(processCellPath: string, showAll: boolean): any {
    throw new Error('Method not implemented.');
  }
  getNotDoneQualityChecksCountByProcessCellPath(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }

  getQualityChecksCountSummaryByProcessCellPath(processCellPath: string,from: string, to: string): Promise<ClientCheckSummaryResponse> {
    throw new Error('Method not implemented.');
  }
  
  getQualityChecksByDisplayGroupId(displayGroupId: number): any {
    throw new Error('Method not implemented.');
  }
  getGenerableQualityForms(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  generateQualityForm(processCellPath: string, qualityFormId: string): any {
    throw new Error('Method not implemented.');
  }
  getArchivedQualityForm(id: number): any {
    throw new Error('Method not implemented.');
  }
  getNotDoneQualityChecksCountByDisplayGroupId(displayGroupId: number): any {
    throw new Error('Method not implemented.');
  }
  submitQualityCheck(data: any, isCompliat: boolean): any {
    throw new Error('Method not implemented.');
  }
  getFormStructure(processCellPath: string, productionOrderId: number, qualityCheckFormId: number): any {
    throw new Error('Method not implemented.');
  }
  getFormStructureAndValues(qualityCheckFormId: number): any {
    throw new Error('Method not implemented.');
  }
  getQualityChecksTimeFiltered(processCellPath: string, from: string, to: string, isDone: any): any {
    throw new Error('Method not implemented.');
  }
  getQualitychecksCount(processCellPath: string, from: string, to: string): any {
    throw new Error('Method not implemented.');
  }
  getQualityCheckReport(processCellPath: string, from: string, to: string): any {
    throw new Error('Method not implemented.');
  }
  //#region SETTINGS
  getQualitySettings(processCellPath: string): any {
    throw new Error('Method not implemented.');
  }
  saveQualitySettings(processCellPath: string, data: any): any {
    throw new Error('Method not implemented.');
  }
  //#endregion
}
