import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { IntegrationData } from '../data/integration';
import { ConfigService, ApiService } from '../utils/services';
import {TranslateService} from '@ngx-translate/core';

import { SpeedAndSetPoints_BE } from '../utils/models/backend/integration/speed-and-set-points';

import { AlarmSummary_BE } from '../utils/models/backend/integration/alarm-summary';
import { OEE } from '../utils/models/presentation/integration/oee';
import { MachinesStatusHistory_BE } from '../utils/models/backend/integration/machine-status-history';
import { MachineStatusInMinutes_BE } from '../utils/models/backend/integration/machine-status-in-minutes';
import { ActualMachineStatus_BE } from '../utils/models/backend/integration/actual-machine-status';
import { ClientProducedDefectiveParts } from '../utils/models/presentation/integration/client-produced-defective-parts';
import { LiveData } from '../utils/models/presentation/integration/live-data';
import { MachineOEE } from '../utils/models/backend/integration/machine-oee';
import { ClientAggregatedMachineHistoryResponse } from '../utils/models/backend/integration/machine-history';
import { LineStatus } from '../utils/models/backend/integration/line-status';

import { ScatterChartOrders_BE, ScatterChartShifts_BE, ScatterChartSummaryShifts_BE } from '../utils/models/backend/integration/scatterchart-orders';
import { ScatterChartOrders_FE, ScatterChartShifts_FE, ScatterChartSummaryShifts_FE } from '../utils/models/presentation/integration/scatterchart-orders';

import { LiveData_BE, MachineLiveData_BE } from '../utils/models/backend/integration/live-data';
import { ParameterBatchDetail } from '../utils/models/presentation/integration/parameter-batch-detail';

@Injectable()
export class IntegrationService extends IntegrationData {

  integrationServerUrl: string;
  lang

  constructor(
    private config: ConfigService,
    private api: ApiService,
    private toastService: NbToastrService,
    public translate: TranslateService,
  ) {
    super();
    this.integrationServerUrl = this.config.getIntegrationServerUrl();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang)
  }

  getMomAlarmsNotificationsByProcessCellPath(processCellPath) {
    var culture = 'en-US';
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/alarms`;
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

  getMomAlarmsNotificationsCountByProcessCellPath(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/alarms/count`;
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

  getMomAlarmsNotificationsByDisplayGroupId(displayGroupId) {

    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/displaygroups/${displayGroupId}/alarms`;
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

  getMomAlarmsNotificationsCountByDisplayGroupId(displayGroupId) {

    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/displaygroups/${displayGroupId}/alarms/count`;
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

  getOEE(processCellPath, from, to, isShift): Promise<OEE> {
    const promise = new Promise<OEE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/oee`+
      (isShift ? '/shift' : '');
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



  getOEECurrentBatch(processCellPath): Promise<OEE> {
    const promise = new Promise<OEE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/runningbatch/oee`;
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

  // getCurrentBatchInformation(processCellPath, showToast: boolean) {
  //   const promise = new Promise((resolve, reject) => {
  //     // this.translate.get(["COMMON.Total_time","COMMON.seconds"]).subscribe(([Total_time, seconds]) => {

  //       const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/information`;
  //       this.api.get(url)
  //         .toPromise()
  //         .then(
  //           res => {
  //             if (showToast) {
  //               this.translate.get(["SHARED.Buffer_filling_percentage","COMMON.OEE_INFO"]).subscribe((translations) => {
  //                 this.showToast('top-right', 'info', translations['SHARED.Buffer_filling_percentage'] +': ' + Math.round((res.bufferFillPercentage + Number.EPSILON) * 100) / 100, translations["COMMON.OEE_INFO"]);
  //               });
  //             }
  //             resolve(res);
  //           },
  //           msg => { reject(msg);
  //           },
  //         );
  //     //  });
  //   });
  //   return promise;
  // }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    this.toastService.show(title, msg, {position, status, destroyByClick});
  }

  getMachinesCurrentStateByProcessCellPath(dateStart, dateEnd, processCellPath, numberOfHoursDisplayedOnOverview, showAllMachine,getAllPoints) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machine/currentstate` +
      (showAllMachine ? `?showAll=${showAllMachine}` : '') +
      (getAllPoints ? `&getAllPoints=${getAllPoints}` : '') +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '&' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res); },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getMachineHistoryStateByProcessCellPath(dateStart, dateEnd, machinePath, numberOfHoursDisplayedOnOverview,getAllPoints) {
    const promise = new Promise<MachinesStatusHistory_BE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/machine/${machinePath}/currentstate` +
      (getAllPoints ? `?getAllPoints=${getAllPoints}` : '') +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '&' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res as MachinesStatusHistory_BE); },
          msg => { reject(msg); },
        );
      });
    return promise;
  }



  getMachinesSpeed(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machine/speed` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : ''); // +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            // console.log(res);
            resolve(res);
          },
          err => { reject(err); },
        );
      });
    return promise;
  }
  getMachineSpeed(machinePath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/machines/${machinePath}/speed` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : ''); // +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            // console.log(res);
            resolve(res);
          },
          err => { reject(err); },
        );
      });
    return promise;
  }

  getMachinesLiveData(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview):Promise<LiveData_BE>{
    const promise = new Promise<LiveData_BE>((resolve, reject) => {
    const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machines/livedata` +
    (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
    (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : ''); // +
    (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

    this.api.get(url)
      .toPromise()
      .then(
        res => {
      // console.log(res);
        resolve(res as LiveData_BE);
        },
        err => { reject(err); },
      );
      });
      return promise;
    }


  getLiveData(machinePath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview):Promise<MachineLiveData_BE> {
    const promise = new Promise<MachineLiveData_BE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/machines/${machinePath}/livedata` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : ''); // +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            // console.log(res);
            resolve(res as MachineLiveData_BE);
          },
          err => { reject(err); },
        );
      });
    return promise;
  }

  getActualSpeedEveryTenMinutesReport(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/actualspeed` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '');
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res); },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  saveCalendarSettings(processCellPath, data: any) {
    const promise = new Promise((resolve, reject) => {
      const params = data;
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/settings/save`;
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

  // getProducedPartsSPPVEveryHour(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview) {
  //   const promise = new Promise((resolve, reject) => {
  //     const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/producedparts/grouped` +
  //     (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
  //     (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '');
  //     (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');
  //     this.api.get(url)
  //       .toPromise()
  //       .then(
  //         res => { resolve(res);
  //         },
  //         msg => { reject(msg);
  //         },
  //       );
  //     });
  //   return promise;
  // }

  getProducedPartsSPPVEveryHour(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/performances` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '');
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');
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

  getActualSpeedEveryTenMinutesOverview(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/actualspeed` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '');
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

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

  getShiftEndByProcessCellPath(dateStart, dateEnd, processCellPath, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/shifts/completed` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getShiftsEventsByProcessCellPath(dateStart, dateEnd, processCellPath, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/shifts/events` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  // getTotalProducedParts(processCellPath, timeSeriesStart, timeSeriesEnd, showToast) {
  //   const promise = new Promise((resolve, reject) => {
  //     if(timeSeriesStart) {
  //       const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/producedparts/total` +
  //       (timeSeriesStart ? `?from=${timeSeriesStart}` : '') +
  //       (timeSeriesEnd ? `&to=${timeSeriesEnd}` : '');

  //       this.api.get(url)
  //         .toPromise()
  //         .then(
  //           res => {
  //             if (showToast) {
  //               this.translate.get(["COMMON.Total_Produced_Parts"]).subscribe((translations) => {
  //                 this.showToast('top-right', 'info', ': ' + res.values[0][1], translations["COMMON.Total_Produced_Parts"]);
  //               });
  //               }
  //             resolve(res);
  //           },
  //           msg => { reject('timeSeriesStart'); },
  //         );
  //     } else { reject(''); }
  //   });
  //   return promise;
  // }

  getSpeedSetPoint(processCellPath, dateStart, dateEnd): any {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/speeds` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getProductionCountersByMachine(processCellPath, dateStart, dateEnd): any {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machines/pieces` +
      // const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/productionCounters/bymachine` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  // getProducedAndDefectivePartsByMachine(processCellPath, dateStart, dateEnd) {
  //   const promise = new Promise((resolve, reject) => {
  //     const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machines/pieces` +
  //     // const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/producedanddefectiveparts/bymachine` +
  //     (dateStart ? `?from=${dateStart}` : '') +
  //     (dateEnd ? `&to=${dateEnd}` : '');

  //     this.api.get(url)
  //       .toPromise()
  //       .then(
  //         res => {
  //           resolve(res);
  //         },
  //         msg => { reject(msg); },
  //       );
  //     });
  //   return promise;
  // }

  getOrderProducedAndDefectivePartsByMachine(processCellPath, orderId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/orders/${orderId}/producedanddefectiveparts/bymachine`;
      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }


  getTotalProducedAndDefectiveParts(processCellPath, dateStart, dateEnd): Promise<ClientProducedDefectiveParts> {
    const promise = new Promise<ClientProducedDefectiveParts>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/producedpieces/total` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res as ClientProducedDefectiveParts);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  addGoodPieces(processCellPath, quantity) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/runningbatch/add/good`;

      this.api.post(url, quantity)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  addRejectedPieces(processCellPath, quantity) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/runningbatch/add/rejected`;

      this.api.post(url, quantity)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getTotalDowntimeInsecondsByTimeRange(processCellPath, dateStart, dateEnd) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/downtimes/totaltimeinseconds` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            if(res.length == 0){
              resolve(null);
            }
            else{
              if(res[0].tags.IsInDowntime === 'False') {
                res[0].values[0][2] = 0;
              }
              resolve(res);
            }
          },
          msg => { reject(msg);},
        );
      });
    return promise;
  }

  getLastMachineStatus(machineCellPath) {
    const promise = new Promise<ActualMachineStatus_BE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/machines/${machineCellPath}/laststate`;

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res as ActualMachineStatus_BE);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getMachineLineStatus(processCellPath, showAllMachine): Promise<LineStatus> {
    const promise = new Promise<LineStatus>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machines/lineStatus`+
      (showAllMachine ? `?showAll=${showAllMachine}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res as LineStatus);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getProcessCellSpeed(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/lastspeedandsetpoint`;

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getDowntimeCount(processCellPath, from, to) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/downtimes/count?from=${from}&to=${to}`;
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

  getBatchOEEData(dateStart, dateEnd): Promise<ScatterChartOrders_FE>  {
    const promise = new Promise<ScatterChartOrders_FE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/scatterChart/orders` + (dateEnd ? `?from=${dateStart}&to=${dateEnd}` : '');
      // const url = `${this.integrationServerUrl}${this.lang}/batches/oeedata` +

      this.api.get(url)
        .toPromise()
        .then(
          (res: ScatterChartOrders_BE) => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getShiftOEEData(dateStart, dateEnd): Promise<ScatterChartShifts_FE> {
    const promise = new Promise<ScatterChartShifts_FE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/scatterChart/shifts` + (dateEnd ? `?from=${dateStart}&to=${dateEnd}` : '');
      // const url = `${this.integrationServerUrl}${this.lang}/shifts/oeedata` +

      this.api.get(url)
        .toPromise()
        .then(
          (res: ScatterChartShifts_BE) => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getDowntimeMachinesByProcessCellPath(processCellPath, dateStart, dateEnd) {
    const promise = new Promise((resolve, reject) => {
    const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/downtime/machines` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
  return promise;
  }

  getPerformanceMachinesByProcessCellPath(processCellPath, dateStart, dateEnd) {
    const promise = new Promise((resolve, reject) => {
    const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machines/performance` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
  return promise;
  }

  getMachineStatusInMinutes(processCellPath, dateStart, dateEnd,showAllMachine) {
    const promise = new Promise((resolve, reject) => {
    const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machine/statusinminutes` +
      (showAllMachine ? `?showAll=${showAllMachine}&` : '?') +
      (dateStart ? `from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getStatusInMinutesByMachine(machinePath, dateStart, dateEnd, numberOfHours): Promise<MachineStatusInMinutes_BE>{
    const promise = new Promise<MachineStatusInMinutes_BE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/machines/${machinePath}/statusinminutes` +
        (dateStart ? `?from=${dateStart}` : '') +
        (dateEnd ? `&to=${dateEnd}` : '') +
        (numberOfHours ? `&numberOfHours=${numberOfHours}` : '');

        this.api.get(url)
          .toPromise()
          .then(
            res => {
              resolve(res as MachineStatusInMinutes_BE);
            },
            msg => { reject(msg); },
          );
        });
      return promise;
  }

  getMachineTimeinstateByProcessCellPath(processCellPath, dateStart, dateEnd) {
    const promise = new Promise((resolve, reject) => {
    const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machines/timeinstate` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
  return promise;
  }



  getDowntimeReasonsByProcessCellPath(processCellPath, dateStart, dateEnd ) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/downtime/reasons` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getDowntimeAlarmsByProcessCellPath(processCellPath, dateStart, dateEnd ) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/downtimes/alarmssummary` +
      (dateStart ? `?from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }


  getAlarmsSummaryByProcessCellPath(processCellPath,showAllMachine, dateStart, dateEnd ) {
    const promise = new Promise<AlarmSummary_BE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/alarmssummary` +
      (showAllMachine ? `?showAll=${showAllMachine}` : '?') +
      (dateStart ? `&from=${dateStart}` : '') +
      (dateEnd ? `&to=${dateEnd}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }



  getMachinesOEEData(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview,isShift) {
    const promise = new Promise<MachineOEE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/machines/oee` +
      (isShift ? '/shift ' : '') +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res as MachineOEE);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getMachinesRunningBatchOEEData(processCellPath) {
    const promise = new Promise<MachineOEE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/runningbatch/machines/oee`

      this.api.get(url)
        .toPromise()
        .then(
          res => {
            resolve(res as MachineOEE);
          },
          msg => { reject(msg); },
        );
      });
    return promise;
  }

  getBatchParameterChanges(parameterName: string, productionOrder: string, unitPath: string): Promise<ParameterBatchDetail>{
    const promise = new Promise<ParameterBatchDetail>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/parameters/${parameterName}/productionOrder/${productionOrder}/unitPath/${unitPath}/changes`;
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

  getDowntimes(processCellPath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview) {
    const promise = new Promise((resolve, reject) => {
    const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/downtimes/summary` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

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

  getScatterShiftsSummary(dateStart, dateEnd, numberOfHoursDisplayedOnOverview): Promise<ScatterChartSummaryShifts_FE> {
    const promise = new Promise<ScatterChartSummaryShifts_FE>((resolve, reject) => {
    const url = `${this.integrationServerUrl}${this.lang}/scatterChart/summary/shifts` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');

      this.api.get(url)
        .toPromise()
        .then(
          (res: ScatterChartSummaryShifts_BE) => { resolve(res);
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
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/settings/save`;
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

  // GET /quality/settings
  getDowntimeSettings(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/settings`;
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


  getSpeedAndSetPoints(processCellPath,dateStart, dateEnd, numberOfHoursDisplayedOnOverview): Promise<SpeedAndSetPoints_BE>{
    const promise = new Promise<SpeedAndSetPoints_BE>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/processcells/${processCellPath}/speedandsetpoints` +
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');
      this.api.get(url)
        .toPromise()
        .then(
          res => { resolve(res as SpeedAndSetPoints_BE);
          },
          msg => { reject(msg);
          },
        );
      });
    return promise;
  }


  getMachineFullHistory(machinePath, dateStart, dateEnd, numberOfHoursDisplayedOnOverview){
    const promise = new Promise<ClientAggregatedMachineHistoryResponse>((resolve, reject) => {
      const url = `${this.integrationServerUrl}${this.lang}/machine/${machinePath}/fullhistory`+
      (dateEnd || numberOfHoursDisplayedOnOverview ? '?' : '') +
      (dateEnd ? `from=${dateStart}&to=${dateEnd}&` : '') +
      (dateEnd === null && numberOfHoursDisplayedOnOverview ? `numberOfHours=${numberOfHoursDisplayedOnOverview}` : '');;
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

}
