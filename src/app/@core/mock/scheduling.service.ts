import { Injectable } from '@angular/core';
import { SchedulingData } from '../data/scheduling';
import { ConfigService, ApiService } from '../utils/services';
import {TranslateService} from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { defer, from } from 'rxjs';


import { ConfigurationData } from '../data/configuration';
import { ShiftClient_BE } from '../utils/models/backend/scheduling/shift-client';
import { CalendarTimeSlotWOrderTime } from '../utils/models/presentation/scheduling/calendar-time-slot-workorder-time';
import { OrderClientGetModel } from '../utils/models/presentation/scheduling/order-client-get-model';
import { CalendarTimeSlotWStartStopTimeNearestElements } from '../utils/models/presentation/scheduling/calendar-time-slot-workorder-start-stop-time-nearest-elements';
import { ShiftClientNearestElements } from '../utils/models/presentation/scheduling/shift-client-nearest-elements';
import { BatchesWithinShiftClient_BE } from '../utils/models/backend/scheduling/batches-within-shift-client';
import { string } from '@amcharts/amcharts4/core';
@Injectable()
export class SchedulingService extends SchedulingData {

  private emailMessagesRequest$: Observable<any> = null;

  schedulingServerUrl: string;
  lang

  constructor(
    private config: ConfigService,
    private api: ApiService,
    public translate: TranslateService,
    private configurationService: ConfigurationData,
  ) {
    super();
    this.schedulingServerUrl = this.config.getSchedulingServerUrl();
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang)
  }

  // getNotDoneQualityChecksCountByProcessCellPath(processCellPath) {
  //   const promise = new Promise((resolve, reject) => {
  //     const url = `${this.schedulingServerUrl}${this.lang}/scheduling/processcells/${processCellPath}/notdone/count`;
  //     this.api.get(url)
  //       .toPromise()
  //       .then(
  //         res => { // Success
  //         resolve(res);
  //         },
  //         msg => { // Error
  //         reject(msg);
  //         },
  //       );
  //     });
  //   return promise;
  // }

  deleteOrder(productionOrder) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/${productionOrder}`;
      this.api.delete(url)
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

  unplanOrder(processCellPath, productionOrder) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/calendar/processcells/${processCellPath}/productionorders/${productionOrder}
      `;
      this.api.delete(url)
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

  getOrder(processCellPath, id): Promise<CalendarTimeSlotWOrderTime> {

    const promise = new Promise<CalendarTimeSlotWOrderTime>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/orders/${id}/details`;
      if(id){
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
      } else {
        console.log('idnull')
      }
    });

    return promise;
  }

  getOrders(): Promise<OrderClientGetModel[]> {
    const promise = new Promise<OrderClientGetModel[]>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders`;
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

  getLastEmployedMachinesByProcessCellPath (processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/lastemployedmachines`;
      // console.log(url)
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

  getLastEmployedMachinesByDisplayGroup (displayGroup) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/displaygroups/${displayGroup}/lastemployedmachines`;
      // console.log(url)
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

  getEmployedMachinesByProcessCellPath (processCellPath, from, to, includeNotReportingMachines) {
    const promise = new Promise((resolve, reject) => {
      if(from && to) {
        const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/employedmachines` +
        (includeNotReportingMachines === false ? '?includeNotReportingProductionMachines=false' : '?includeNotReportingProductionMachines=true');
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
      } else {
        const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/employedmachines` +
        (includeNotReportingMachines === false ? '?includeNotReportingProductionMachines=false' : '?includeNotReportingProductionMachines=true');
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
      }
      });
    return promise;
  }

//
  getEmployedMachinesByDisplayGroup (displayGroup, from, to, includeNotReportingMachines) {
    const promise = new Promise((resolve, reject) => {
      if(from && to) {
        const url = `${this.schedulingServerUrl}${this.lang}/displaygroups/${displayGroup}/employedmachines?from=${from}&to=${to}` +
        (includeNotReportingMachines === false ? '&includeNotReportingProductionMachines=false' : '&includeNotReportingProductionMachines=true');
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
      } else {
        const url = `${this.schedulingServerUrl}${this.lang}/displaygroups/${displayGroup}/employedmachines` +
        (includeNotReportingMachines === false ? '?includeNotReportingProductionMachines=false' : '?includeNotReportingProductionMachines=true');
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
      }
      });
    return promise;
  }

  uploadShiftsFile(processCell){
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCell}/teamassignment/overrides/import`;
      this.api.post(url, '')
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

  // downloadShiftsFile(pc, from, to):any{
  //   this.api.download(`${this.schedulingServerUrl}${this.lang}/processcells/${pc}/teamassignment/from/${from}/to/${to}/overrides`).subscribe(res => {
  //     console.log(res);
  //     return res;
  //   });

  //   // const promise = new Promise((resolve, reject) => {
  //   //   const url = `${this.schedulingServerUrl}${this.lang}/processcells/${pc}/teamassignment/from/${from}/to/${to}/overrides`;
  //   //   this.api.get(url)
  //   //     .toPromise()
  //   //     .then(
  //   //       res => { // Success
  //   //       resolve(res);
  //   //       },
  //   //       msg => { // Error
  //   //       reject(msg);
  //   //       },
  //   //     );
  //   //   });
  //   // return promise;
  // }

  getEmployedMachines(processCellPath, from, to, includeNotReportingMachines) {
    const promise = new Promise((resolve, reject) => {
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        this.getEmployedMachinesByProcessCellPath(processCellPath, from, to, includeNotReportingMachines).then(res => {
          resolve(res)
        });
        //GVA: show always all machines and not filtered by diplay group
        // if (canBypass) {
        //   this.getEmployedMachinesByProcessCellPath(processCellPath, from, to, includeNotReportingMachines).then(res => {
        //     resolve(res)
        //   });
        // } else {
        //   const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
        //   this.getEmployedMachinesByDisplayGroup(fIlteredDisplayGroup, from, to, includeNotReportingMachines).then(res => {
        //     resolve(res)
        //   });
        // }
      });
    });
    return promise;
  }

  getLastEmployedMachines(processCell){
    const promise = new Promise((resolve, reject) => {
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        if (canBypass) {
          this.getLastEmployedMachinesByProcessCellPath(processCell).then(res => {
            resolve(res)
          });
        } else {
          const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
          this.getLastEmployedMachinesByDisplayGroup(fIlteredDisplayGroup).then(res => {
            // console.log('======Z>', res)
            resolve(res)
          });
        }
      });
    });
    return promise;
  }

  availableTimeSlot (selectedProcessCellPath, productCode, targetQuantity, batchParameters) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${selectedProcessCellPath}/products/${productCode}/availabletimeslot?targetQuantity=${targetQuantity}`;
      const params = JSON.stringify(batchParameters);
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

  stopBatch(productionOrder: string): Promise<number> {
    const promise = new Promise<number>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/${productionOrder}/stopproduction`;
      this.api.post(url, '')
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

  pauseBatch(productionOrder: string): Promise<number> {
    const promise = new Promise<number>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/${productionOrder}/pauseproduction`;
      this.api.post(url, '')
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

  resumeBatch(productionOrder: string): Promise<number> {
    const promise = new Promise<number>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/${productionOrder}/resumeproduction`;
      this.api.post(url, '')
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

  startBatch(productionOrder: string): Promise<number> {
    const promise = new Promise<number>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/${productionOrder}/startproduction`;
      this.api.post(url, '')
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

  getNextBatches(processCellPath, skip = null, take = null): Promise<CalendarTimeSlotWOrderTime[]> {
    const promise = new Promise<CalendarTimeSlotWOrderTime[]>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/upcomingbatches/?skip=${skip}&take=${take}`;
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

  getNearestBatches(processCellPath, productionOrder, isReport = false): Promise<CalendarTimeSlotWStartStopTimeNearestElements> {
    const promise = new Promise<CalendarTimeSlotWStartStopTimeNearestElements>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/orders/${productionOrder}/nearest?excludeScheduled=${isReport}`;
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

  getBatchesTimeFiltered(processCellPath, from, to) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/calendar/processcells/${processCellPath}/from/${new Date(new Date(new Date(from).setHours(new Date(from).getHours() + 1))).toISOString()}/to/${new Date(new Date(new Date(to).setHours(new Date(to).getHours() + 1))).toISOString()}/batches`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
            // console.log(processCellPath, from, to, res)
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  // get /scheduling/calendar/processcells/{processCellPath}/from/{from}/to/{to}/shifts
  getShiftsTimeFiltered(processCellPath, from, to) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/calendar/processcells/${processCellPath}/from/${new Date(new Date(new Date(from).setHours(new Date(from).getHours() + 1))).toISOString()}/to/${new Date(new Date(new Date(to).setHours(new Date(to).getHours() + 1))).toISOString()}/shifts`;
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

  getCurrentShift(processCellPath): Promise<ShiftClient_BE> {
    const promise = new Promise<ShiftClient_BE>((resolve, reject) => {
    const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/shifts/current`;
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

  getNearestShifts(processCellPath, from, to, isReport = false): Promise<ShiftClientNearestElements> {
      const promise = new Promise<ShiftClientNearestElements>((resolve, reject) => {

      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/shiftdefinitions/nearest?excludeFutureShifts=${isReport}`;
      this.api.get(url)
        .toPromise()
        .then(
          res => { // Success
            // console.log(processCellPath, from, to, res)
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          },
        );
      });
    return promise;
  }

  // get     /scheduling​/processcells​/{processCellPath}​/orders
  getOrdersList(processCellPath){
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/orders`;
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

  // post /scheduling​/processcells​/{processCellPath}​/validatetimeslot
  validateTimeSlot(processCellPath, productionOrder, productCode: any, targetQuantity: number, scheduledStartTime, scheduledEndTime, batchParameters ){
    const params = JSON.stringify(batchParameters);
    const promise = new Promise((resolve, reject) => {
      const params = {
        productionOrder: productionOrder,
        scheduledStartTime: scheduledStartTime,
        scheduledEndTime: scheduledEndTime,
        productCode: productCode,
        targetQuantity: targetQuantity,
        batchParameters: batchParameters,
      };
      console.log('params', params);
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/validatetimeslot`;
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
  // post /scheduling/orders/erp/plan
  planPOFromERP(BatchParameters, processCellPath, productionOrder, productCode, scheduledStartTime, scheduledEndTime ){
    const promise = new Promise((resolve, reject) => {
      const params = {
        BatchData: BatchParameters,
        processCellPath: processCellPath,
        productionOrder: productionOrder,
        productCode: productCode,
        scheduledStartTime: scheduledStartTime,
        scheduledEndTime: scheduledEndTime,
      };
      const url = `${this.schedulingServerUrl}${this.lang}/orders/erp/plan`;
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

  // post ​/scheduling​/orders​/fromscratch​/plan
  planPOFromScratch(BatchParameters, processCellPath, productionOrder, productCode, targetQuantity, scheduledStartTime, scheduledEndTime ){
    const promise = new Promise((resolve, reject) => {
      const params = {
        BatchData: BatchParameters,
        processCellPath: processCellPath,
        productionOrder: productionOrder,
        productCode: productCode,
        targetQuantity: targetQuantity,
        scheduledStartTime: scheduledStartTime,
        scheduledEndTime: scheduledEndTime,
      };
      const url = `${this.schedulingServerUrl}${this.lang}/orders/fromscratch/plan`;
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
  }​

  // get /scheduling/processcells/{processCellPath}/shiftdefinitions
  getShiftDefinitions(processCellPath) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/shiftdefinitions/${processCellPath}`;
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

  cloneShiftDefinitions(processCellPath, date){
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/shiftdefinitions/${processCellPath}/date/${date}/clone`;
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
  // post /scheduling/processcells/{processCellPath}/shiftdefinitions/update
  updateShiftDefinition(processCellPath, data) {
    const promise = new Promise((resolve, reject) => {
      const params = data;
      const url = `${this.schedulingServerUrl}${this.lang}/shiftdefinitions/${processCellPath}/update`;
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



  // post /scheduling/shiftdefinitions/add
  addShiftDefinition(processCellPath, shiftStart, shiftEnd){
    const promise = new Promise((resolve, reject) => {
      const params = {
        processCellPath: processCellPath,
        shiftStart: shiftStart,
        shiftEnd: shiftEnd,
      };
      const url = `${this.schedulingServerUrl}${this.lang}/shiftdefinitions/add`;
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

  // delete /scheduling/shiftdefinitions/{shiftId}
  deleteShiftDefinition(shiftId){
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/shiftdefinitions/${shiftId}`;
      this.api.delete(url)
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



  // get /scheduling/teams
  getTeams() {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/teams`;
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

  // post /scheduling/teams/add
  addTeam(teamName) {
    const promise = new Promise((resolve, reject) => {
      const params = {
        id: 0,
        teamName: teamName,
      };
      const url = `${this.schedulingServerUrl}${this.lang}/teams/add`;
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

  // put /scheduling/teams/update
  updateTeam(data: any) {
    const promise = new Promise((resolve, reject) => {
      const params = data;
      const url = `${this.schedulingServerUrl}${this.lang}/teams/update`;
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

  // delete ​/scheduling​/teams​/{teamId}
  deteleTeam(teamId) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/teams​/${teamId}`;
      this.api.delete(url)
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

  // post /scheduling/processcells/{processCellPath}/teamassignment/change
  editShiftData(processCellPath, team, shiftStartDatetime, shiftEndDatetime,refDate,slotId) {
    const promise = new Promise((resolve, reject) => {
      const params = {
        shiftStartDatetime: shiftStartDatetime,
        shiftEndDatetime: shiftEndDatetime,
        newTeamId: team.id,
        newTeamName: team.teamName,
        slotId: slotId,
        referenceDate: refDate
      };
      // console.log(params)
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/teamassignment/change`;
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

  // get scheduling/processcells/{processCellPath}/from/{from}/to/{to}/batcheswithinshift
  getBatchesWithinShift(processCellPath, from, to): Promise<BatchesWithinShiftClient_BE> {
    const promise = new Promise<BatchesWithinShiftClient_BE>((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/processcells/${processCellPath}/from/${from}/to/${to}/batcheswithinshift`;
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

  searchProductionOrder(searchString: string) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/search/${searchString}`;
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


  editOrderData(productionOrder:string, newQuantity:number) {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/${productionOrder}/edit`;

      const respJson:JSON = <JSON><unknown>{
        "TargetQuantity": newQuantity,
      }
      
      this.api.post(url, respJson)
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




  generateProductionOrder() {
    const promise = new Promise((resolve, reject) => {
      const url = `${this.schedulingServerUrl}${this.lang}/orders/generateBatchName`;
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



}
