import { Observable } from "rxjs";

export abstract class ExportWorkerData {
  data: any;
  progress: any;

  showProgressBar_Listener: Observable<boolean>;
  showProgressBar(value): any {
    throw new Error('Method not implemented.');
  }

  ExportInProgress_Listener: Observable<boolean>;
  ExportInProgress(value): any {
    throw new Error('Method not implemented.');
  }

  beginExportReport(from, to, type, selectedProcessCell, selectedPO, selectedTeam): any {
    throw new Error('Method not implemented.');
  }

  cancelExportReport(id): any {
    throw new Error('Method not implemented.');
  }

  getProgressPercentuage(id): any {
    throw new Error('Method not implemented.');
  }
  setProgressPercentuage(val): any {
    throw new Error('Method not implemented.');
  }

  getFile(id): any {
    throw new Error('Method not implemented.');
  }

}
