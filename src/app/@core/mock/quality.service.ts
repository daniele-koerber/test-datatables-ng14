import { Injectable } from '@angular/core';
import { QualityData } from '../data/quality';
import { ConfigService, ApiService } from '../utils/services';
import {TranslateService} from '@ngx-translate/core';
import { ClientCheckSummaryResponse } from '../utils/models/backend/quality/clientCheckSummaryResponse';

@Injectable()
export class QualityService extends QualityData {

  qualityServerUrl: string;
  lang

  constructor(
    private config: ConfigService,
    private api: ApiService,
    public translate: TranslateService,
  ) {
    super();
    this.qualityServerUrl = this.config.getQualityServerUrl();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang)
  }

  getGenerableQualityForms(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/forms/generable`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  generateQualityForm(processCellPath, qualityFormId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/qualitychecks/${processCellPath}/${qualityFormId}/generate`;
      this.api.post(url, {})
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  getQualityChecksByProcessCellPath(processCellPath, showAll) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/qualitychecks` + (showAll ? '?showall=true' : '');
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  getNotDoneQualityChecksCountByProcessCellPath(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/notdone/count`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          }
        );
      });
    return promise;
  }  
  
  getQualityChecksCountSummaryByProcessCellPath(processCellPath, from, to): Promise<ClientCheckSummaryResponse> {
    const promise = new Promise<ClientCheckSummaryResponse>((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/qualitychecks/summary`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res as ClientCheckSummaryResponse) ;
          },
          msg => { // Error
          reject(msg);
          }
        );
      });
    return promise;
  }

  getQualityChecksByDisplayGroupId(displayGroupId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/displaygroups/${displayGroupId}/qualitychecks`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  getArchivedQualityForm(id){
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/qualitychecks/${id}`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  getNotDoneQualityChecksCountByDisplayGroupId(displayGroupId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/displaygroups/${displayGroupId}/notdone/count`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          }
        );
      });
    return promise;
  }

  getFormStructure(processCellPath, productionOrderId, qualityCheckFormId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/productionorders/${productionOrderId}/qualityforms/${qualityCheckFormId}/structure`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  getFormStructureAndValues(qualityCheckId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/qualitychecks/${qualityCheckId}`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  submitQualityCheck(data, isCompliat) {
    const promise = new Promise((resolve, reject) => {
      //const params = [...data.form];
      const params = data.form;
      const url = `${this.qualityServerUrl}${this.lang}/qualitychecks/${data.id}?compliance=${isCompliat}`;
      this.api.put(url, params)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }



  getQualitychecksCount(processCellPath, from, to) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/qualitychecks/count`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  // /quality/{processCellPath}/from/{from}/to/{to}/qualitychecks
  getQualityChecksTimeFiltered(processCellPath, from, to, isDone) {
    const promise = new Promise((resolve, reject) => {
      var urlIsDone = isDone ? `?isDone=${isDone}` : "";
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/qualitychecks${urlIsDone}`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  // get  /quality/processcells/{processCellPath}/from/{from}/to/{to}/report
  getQualityCheckReport(processCellPath, from, to) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/report`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  //#region SETTINGS

  // GET /quality/settings
  getQualitySettings(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/settings`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }

  // POST /quality/settings/save
  saveQualitySettings(processCellPath, data: any) {
    const promise = new Promise((resolve, reject) => {
      const params = data;
      const url = `${this.qualityServerUrl}${this.lang}/processcells/${processCellPath}/settings/save`;
      this.api.post(url, params)
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

 //#endregion

}
