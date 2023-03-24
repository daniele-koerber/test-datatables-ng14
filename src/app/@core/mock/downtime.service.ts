import { Injectable } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import { DowntimeData } from '../data/downtime';
import { ConfigService, ApiService } from '../utils/services';

@Injectable()
export class DowntimeService extends DowntimeData {

  downtimeServerUrl: string;
  lang: string;

  constructor(
    private config: ConfigService,
    private api: ApiService,
    private translate: TranslateService,
  ) {
    super();
    this.downtimeServerUrl = this.config.getDowntimeServerUrl();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage()
    translate.use(this.lang)
  }

  getDowntimesByProcessCellPath(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.downtimeServerUrl}${this.lang}/processcells/${processCellPath}/downtimes`;
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

  getDowntimesByDisplayGroupId(displayGroupId) {

    const promise = new Promise((resolve, reject) => {
      const url = `${this.downtimeServerUrl}${this.lang}/displaygroups/${displayGroupId}/downtimes`;
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

  getNotJustifiedDowntimesCountByProcessCellPath(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.downtimeServerUrl}${this.lang}/processcells/${processCellPath}/notjustified/count`;
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

  getDowntimeSettings(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.downtimeServerUrl}${this.lang}/processcells/${processCellPath}/settings`;
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

  saveDowntimeSettings(processCellPath, data: any) {
    const promise = new Promise((resolve, reject) => {
      const params = data;
      const url = `${this.downtimeServerUrl}${this.lang}/processcells/${processCellPath}/settings/save`;
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

  getNotJustifiedDowntimesCountByDisplayGroupId(displayGroupId) {

    const promise = new Promise((resolve, reject) => {
      const url = `${this.downtimeServerUrl}${this.lang}/displaygroups/${displayGroupId}/notjustified/count`;
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

  getDowntimesReasons() {

    const promise = new Promise((resolve, reject) => {
      const url = `${this.downtimeServerUrl}${this.lang}/reasons`;
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

  submitDowntimeAcknowledge(downtimeId, confirmedMachinePath, confirmedMachineComponentPath, confirmedReasonId, notes) {
    const promise = new Promise((resolve, reject) => {
      const params = {
        id: downtimeId,
        confirmedMachinePath,
        confirmedMachineComponentPath,
        confirmedReasonId,
        notes,
      };
      const url = `${this.downtimeServerUrl}${this.lang}/${downtimeId}/justify`;
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

}
