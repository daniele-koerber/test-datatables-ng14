import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { ExportWorkerData } from '../data/exportworker';
import { ConfigService, ApiService } from '../utils/services';
import {TranslateService} from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ExportWorkerService extends ExportWorkerData {
  // public exportReportId:EventEmitter<number> = new EventEmitter();
  private dataSource: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public data: Observable<string> = this.dataSource.asObservable();

  private progressSource: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public progress: Observable<number> = this.progressSource.asObservable();

  exportWorkerServerUrl: string;
  lang

  private valueSourceShowProgressBar = new BehaviorSubject<boolean>(null);
  showProgressBar_Listener = this.valueSourceShowProgressBar.asObservable();
  showProgressBar(value) {
    this.valueSourceShowProgressBar.next(value)}

  private valueSourceExportInProgress = new BehaviorSubject<boolean>(null);
  ExportInProgress_Listener = this.valueSourceExportInProgress.asObservable();
  ExportInProgress(value) {this.valueSourceExportInProgress.next(value)}

  constructor(
    private config: ConfigService,
    private api: ApiService,
    private toastService: NbToastrService,
    public translate: TranslateService,
  ) {
    super();
    this.exportWorkerServerUrl = this.config.getExportWorkerServerUrl();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang)
  }

  getProgressPercentuage(exportTaskId): any {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.exportWorkerServerUrl}${this.lang}/export/percetage?exportTaskId=${exportTaskId}`;
      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
            this.progressSource.next(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  getFile(exportTaskId) {
    return this.api.download(`${this.exportWorkerServerUrl}${this.lang}/export/download?exportTaskId=${exportTaskId}`);
  }

  beginExportReport(from, to, typeBool, selectedProcessCell, selectedPO, selectedTeam) {
    from = from + 'T00:00:00Z';
    to = to + 'T23:59:59Z';
    const type = (typeBool === true || typeBool === 'true' ? 'orders' : 'shifts');
    const promise = new Promise((resolve, reject) => {
      const url = `${this.exportWorkerServerUrl}${this.lang}/export/begin/${type}`;
      let params;
      params = { from, to };

      params.filterProcessCellPaths = selectedProcessCell ? [selectedProcessCell.path] : [];
      params.filterProductCodes = selectedPO ? [selectedPO.value] : [];
      params.filterTeamNames = selectedTeam ? [selectedTeam.value] : [];

      this.api.post(url, params)
        .toPromise()
        .then(
          res => {
            this.dataSource.next(res.taskId);
            resolve(res);
          },
          msg => {

            reject(msg);
          },
        );
      });
    return promise;
  }

  cancelExportReport(exportTaskId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.exportWorkerServerUrl}${this.lang}/export/cancel?exportTaskId=${exportTaskId}`;
      const params = {  };
      this.api.post(url, params)
        .toPromise()
        .then(
          res => {
            this.dataSource.next(null);
            resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }
}
