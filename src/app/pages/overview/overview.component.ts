import { Status } from './../../@core/utils/models/backend/integration/machine-status-in-minutes';
import { Component, OnInit, resolveForwardRef } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigurationData } from '../../@core/data/configuration';
import { Observable, Subscription, from } from 'rxjs';

import { SchedulingData } from '../../@core/data/scheduling';
import { IntegrationData } from '../../@core/data/integration';
import { ConfigService } from '../../@core/utils/services';
import { DatePipe } from '@angular/common';

import { Shift } from '../../@core/utils/models/presentation/scheduling/shift';

import { SmoothLineChartModel } from '../../@core/utils/models/presentation/integration/smooth-line-chart-model';
import { LiveData_BE } from '../../@core/utils/models/backend/integration/live-data';
import { AlarmSummary } from '../../@core/utils/models/presentation/integration/alarm-summary';
import { LiveDataCardComponent } from '../../@core/utils/shared/live-data-card/live-data-card.component';
import { AggregatedMachineHistoryResponse_FE, AlarmHeldOccurencies_FE, MachineParameterSpeed_FE, MachineSpeed_FE, ProgressiveMachineProductionCounter_FE } from '../../@core/utils/models/presentation/integration/machine-history';
import { OEE } from '../../@core/utils/models/presentation/integration/oee';
import { MachineStatusInMinutes } from '../../@core/utils/models/presentation/integration/machine-status-in-minutes';
import { MachinesStatusHistory } from '../../@core/utils/models/presentation/integration/machine-status-history';
import { ActualMachineStatus_BE } from '../../@core/utils/models/backend/integration/actual-machine-status';
import { MachineOEE } from '../../@core/utils/models/backend/integration/machine-oee';
import { BatchClient } from '../../@core/utils/models/presentation/scheduling/batch-client';
import { ActualOrderCardComponentModel } from './actual-order-card/actual-order-card.component';
import { BatchStatus } from '../../@core/utils/services/config.service';
import { CalendarTimeSlotWOrderTime } from '../../@core/utils/models/presentation/scheduling/calendar-time-slot-workorder-time';

import { primaryArrayElement, PrimaryType, machinesArrayElement } from '../../@core/utils/models/presentation/miscellanous/tabs';
import { ClientProducedDefectiveParts } from '../../@core/utils/models/presentation/integration/client-produced-defective-parts';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { AdjustOrderPiecesModalComponent } from '../../@core/utils/shared/adjust-order-pieces/adjust-order-pieces-modal.component';

@Component({
  selector: 'ngx-overview',
  styleUrls: ['./overview.component.scss'],
  templateUrl: './overview.component.html',
})

export class OverviewComponent implements OnInit {

  selectedActivityIndex = 0;
  displayGroupName = '';
  hideDisplayGroup = true;
  firstLoad = false;
  pcSub: Subscription;
  loadSub: Subscription;
  periodicRepeat: number;
  signalRListenersNames: string[] = ['ShiftDataChanged','BatchDataChanged','RouteChanged'];

  signalRListenersNamesIntegration: string[] = ['MachinesStatusChanged']; // Aggiorna il grafico del Line Status, status History e speed(grafico arancione la chiamata è la stessa del line status)
  signalRListenersNamesLiveData: string[] = ['LineStatusLiveDataChanged'];

  serverNotificationstopic: string = 'ApiGateway';

  componentDataAlarmsSummary: AlarmSummary = {};
  componentDataAlarmsDowntime: AlarmSummary = {};

  componentDataMachineHistory: AggregatedMachineHistoryResponse_FE = {}

  selectedProcessCellPath: string;
  selectedMachinePath: string ;
  selectedProcessCell
  shift:Shift;
  dateStart: string;
  dateEnd: string;

  primaryFilterValue: number = 0;
  resetTabSel = 0
  orderIsActive = false
  shiftIsActive = false

  actualOrder: any = {};
  actualShift: any = {};

  currentOrderOEE: any = {};
  currentShiftOEE: any = {};
  selMachineOEE: any = {};
  shiftMachineOEE: MachineOEE = {};
  orderMachineOEE: MachineOEE = {};

  shiftMachineOEEServerError = false
  orderMachineOEEServerError = false
  shiftMachineOEELoading = false
  orderMachineOEELoading = false

  actualOrderCard: ActualOrderCardComponentModel = {};
  batchActualQuantity: ClientProducedDefectiveParts = {};
  currentShiftCard: any = {};
  downtimeAlarmCard: any = {};
  tempDowntimeAlarmChartData: any = {};
  alarmSummaryCard: any = {};
  tempAlarmSummaryChartData: any = {};
  oeeCard: any = {};
  endLineSpeedCard: any = {};
  lineStatusCard: any = {};
  liveDataCard: any = {};
  machineStatusCard: any = {};

  tabMachinesArray: any[] = [];
  orderMachinesArray: any[] = [];
  shiftMachinesArray: any[] = [];
  newShiftMachinesArray = [];
  newOrderMachinesArray = [];

  tabSelected: primaryArrayElement = {
    value: null,
    title: null
  }

  disableShift:boolean = true;
  disableOrder:boolean = false;

  alarmsSummaryChartData: any;
  alarmsSummaryStart: any;
  alarmsSummaryEnd: any;
  alarmsSummaryMaxTot: any;
  id: any;
  batch: CalendarTimeSlotWOrderTime;
  chartId= 'test'

  helpLinkPage = 'overview';
  machineSpeeds: Array<MachineSpeed_FE>;
  parameterSpeeds: Array<MachineParameterSpeed_FE>;
  productionCounter: Array<ProgressiveMachineProductionCounter_FE>;
  alarmOccurrences: Array<AlarmHeldOccurencies_FE>;

  hoursToDisplay: number = 3
  machineSpeedUoM: string = "";
  lineText: string = "Line";

  constructor(
    private configurationService: ConfigurationData,
    private scheduleService: SchedulingData,
    public translate: TranslateService,
    private integrationService: IntegrationData,
    private config: ConfigService,
    private toastService: NbToastrService,
    private dialogService: NbDialogService,
    private authService: NbAuthService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    translate.use(config.getSelectedLanguage());

    this.translate.get(["REPORT.Line"]).subscribe((translations) => {
      this.lineText = translations["REPORT.Line"];
    });

  }

  setHelpPage() { 
    this.config.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  ngOnInit() {
    this.firstLoad = true;
    this.loadingComponents();
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();

    this.updatePeriodicRefresh();

  }

  setPeriodicRefresh() {
    const interval = this.config.getTimedUpdateMs();
    this.periodicRepeat = window.setInterval(() => {
        this.updateComponent();
    }, interval)
  }

  updatePeriodicRefresh() {
    clearInterval(this.periodicRepeat);
    this.setPeriodicRefresh();
  }

  cancelPeriodicRefresh() {
    clearInterval(this.periodicRepeat);
  }

  getDisplayGroups() {
    this.configurationService.canBypassDisplayGroup().then(async canBypass=>{
      this.hideDisplayGroup = canBypass;
      if (!canBypass) {
        const displayGroup = localStorage.getItem(`displayGroupID`);
        var selectedDisplayGroup = (displayGroup !== '' ? +displayGroup : 0)
        const displayGroups= await this.configurationService.getDisplayGroups();
        var displayGroupsArray = []
        displayGroups.map(el => {
          displayGroupsArray.push({ value:el.id, name: el.processCellDescription + ' - ' + el.description });
        });
        displayGroupsArray.sort((a, b) => a.name > b.name ? 1 : -1);
        const found = displayGroupsArray.filter(element => element.value == selectedDisplayGroup);
        this.displayGroupName = (((found[0] !== '') && found) ? found[0].name : '')
      }
    })
  }

 getTabMachinesArrays(){

    switch(this.primaryFilterValue) {
      case PrimaryType.Order:
        // const compareOrdersArray = (
        //   this.newOrderMachinesArray.length === this.orderMachinesArray.length &&
        //   this.newOrderMachinesArray.every((value, index) => value === this.orderMachinesArray[index])
        // );

        var arrayAreSame: boolean = this.newOrderMachinesArray.length === this.orderMachinesArray.length;
        if (arrayAreSame && this.newOrderMachinesArray.length > 1) {
          for (var index = 1; index < this.newOrderMachinesArray.length; index++) {
            if ((this.newOrderMachinesArray[index].path !== this.orderMachinesArray[index].path) || (this.newOrderMachinesArray[index].status !== this.orderMachinesArray[index].status)) {
              arrayAreSame = false;
              break
            }
          }
        }

        if(!arrayAreSame) {
          this.orderMachinesArray = [...this.newOrderMachinesArray];
          this.tabMachinesArray = [...this.orderMachinesArray];
          // if(this.tabMachinesArray.length === 0) { this.tabMachinesArray = [...this.orderMachinesArray]; }
        } else {
          //Not update array
        }
        break;
      case PrimaryType.Shift:
        var arrayAreSame: boolean = this.newShiftMachinesArray.length === this.shiftMachinesArray.length;
        if (arrayAreSame && this.newShiftMachinesArray.length > 1) {
          for (var index = 1; index < this.newShiftMachinesArray.length; index++) {
            if (this.newShiftMachinesArray[index].path !== this.shiftMachinesArray[index].path || this.newShiftMachinesArray[index].status !== this.shiftMachinesArray[index].status) {
              arrayAreSame = false;
              break
            }
          }
        }
        if(!arrayAreSame) {
          this.shiftMachinesArray = [...this.newShiftMachinesArray];
          this.tabMachinesArray = [...this.shiftMachinesArray];
          // if(this.tabMachinesArray.length === 0) { this.tabMachinesArray = [...this.shiftMachinesArray]; }
        } else {
          //Not update array
        }
        break;
      default:
      break;
    }


  }
  async onPrimaryTabChanged(element: primaryArrayElement): Promise<primaryArrayElement> {
    this.primaryFilterValue = element.value;
    //Delete machine path (line is selected)
    this.selectedMachinePath = null;
    this.getTabMachinesArrays();
    switch(this.primaryFilterValue) {
      case PrimaryType.Order:
        this.tabMachinesArray = this.orderMachinesArray;

        this.dateStart = this.actualOrder.batchExpectedStart
        this.dateEnd =  new Date().toISOString()

        this.oeeCard = { ...this.currentOrderOEE };
        this.getCurrentOrderOEE();
        break;
      case PrimaryType.Shift:
        this.tabMachinesArray = this.shiftMachinesArray;

        this.dateStart = this.actualShift.shiftStartDatetime
        this.dateEnd =  new Date().toISOString()

        this.oeeCard =  { ...this.currentShiftOEE };
        this.getCurrentShiftOEE();
      break;
      default:
      break;
    }
    this.downtimeAlarmCard.isLoading = true;
    this.alarmSummaryCard.isLoading = true;
    this.getDowntimeAlarmsChartData();
    this.getAlarmSummaryData();

    return
  }

  async onMachinesTabChanged(element: machinesArrayElement): Promise<machinesArrayElement> {
    this.selectedMachinePath = element.path;

    if (this.selectedMachinePath) {
      this.componentDataMachineHistory.isLoading = true;
      this.machineStatusCard.isLoadingActualStatus = true;
      this.machineStatusCard.isLoadingStatusInMin = true;
      this.machineStatusCard.isLoadingStatusHistory = true;
      this.liveDataCard.isLoading = true;

      this.updateMachinesCards();
    } else {
      this.updateCards()
    }
    this.filterDowntimeAlarmsByMachinePath();
    this.filterAlarmSummaryByMachinePath();

    switch(this.primaryFilterValue) {
      case PrimaryType.Order:
        this.copySelOrderMachineOEEData()
        break;
      case PrimaryType.Shift:
        this.copySelShiftMachineOEEData()
        break;
      default:
      break;
    }
    return
  }


  async getActualOrderAndShift(): Promise<any> {
    const take = 1;
    const skip = 0;
    if (this.selectedProcessCellPath) {
      this.scheduleService.getNextBatches(this.selectedProcessCellPath, skip, take).then((res) =>   {
        this.actualOrder = res[0];
        this.actualOrderCard.serverError = false;

        if (res.length) {
          this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
            const payload = token.getPayload();
            if (payload.features.includes("CanPauseProduction")) {
              this.actualOrderCard.isPauseEnable = true;
            }
          });


          this.actualOrderCard.isStartEnable = (this.actualOrder.canStart === true &&
                                                this.actualOrder.status === BatchStatus.Planned ||
                                                this.actualOrder.status === BatchStatus.Delayed);

          this.actualOrderCard.isStopEnable = (
            this.actualOrder.status === BatchStatus.ActiveDelayed || this.actualOrder.status === BatchStatus.ActiveOnTime || this.actualOrder.status === BatchStatus.Paused);

          // if (this.actualOrder.status == 2 || this.actualOrder.status == 3 || this.actualOrder.status == 4) {
            if(this.config.isBatchActive(this.actualOrder.status)){
            this.orderIsActive = true
          } else {
            this.orderIsActive = false
            this.dateStart = null
            this.dateEnd = null
            this.primaryFilterValue = PrimaryType.Shift;
          }

          if (this.primaryFilterValue == PrimaryType.Order && this.orderIsActive) {
          this.dateStart = this.actualOrder.batchExpectedStart
          this.dateEnd =  new Date().toISOString()
          }

          this.id = (res.length ? this.actualOrder.productionOrder : null);
          this.getOverviewBatch();
        } else {
          this.actualOrderCard.isStartEnable = false;
          this.actualOrderCard.isStopEnable = false;
          this.actualOrderCard.isPauseEnable = false;
          this.orderIsActive = false
          this.dateStart = null
          this.dateEnd = null
          this.id = null
          this.actualOrderCard.batch = null;
          this.actualOrderCard.noData = true;
          this.actualOrderCard.isLoading = false;
        }

        this.scheduleService.getCurrentShift(this.selectedProcessCellPath).then((shift: Shift) =>   {
          this.actualShift = shift
          this.currentShiftCard.shift = this.actualShift;
          this.currentShiftCard.processCellPath = this.selectedMachinePath;


          const now = new Date().toISOString();
          this.scheduleService.getBatchesWithinShift(this.selectedProcessCellPath, this.actualShift.shiftStartDatetime, now).then(shiftBatches => {
            let batches = shiftBatches.batches;

            if (this.actualShift.effectiveTeamId && batches.length > 0) {
              this.shiftIsActive = true
            } else {
              this.shiftIsActive = false
            }
            this.currentShiftCard.shiftHasReport = batches.length > 0;


            if (this.primaryFilterValue == PrimaryType.Shift && this.shiftIsActive) {
              this.dateStart = this.actualShift.shiftStartDatetime
              this.dateEnd =  new Date().toISOString()
            }
            this.currentShiftCard.serverError = false;
            this.updateOEECards();

          }).catch(error => {
            this.shiftIsActive = false
            this.currentShiftCard.serverError = true;
            this.currentShiftCard.isLoading = false;
            this.currentShiftCard.shift = null
          });

        }).catch(error => {
          this.shiftIsActive = false
          this.currentShiftCard.serverError = true;
          this.currentShiftCard.isLoading = false;
          this.currentShiftCard.shift = null
        });
      }).catch(error => {
        this.currentShiftCard.serverError = true;
        this.currentShiftCard.isLoading = false;
        this.actualOrderCard.isLoading = false;
        this.actualOrderCard.serverError = true;
        this.actualOrderCard.isStartEnable = false;
        this.actualOrderCard.isStopEnable = false;
        this.actualOrderCard.isPauseEnable = false;

        this.orderIsActive = false
        this.dateStart = null
        this.dateEnd = null
        this.id = null
        this.actualOrder = null
      });
    }

  }

  getCurrentOrderOEE():any {

    if (this.selectedProcessCellPath && this.orderIsActive) {
        this.integrationService.getOEECurrentBatch(this.selectedProcessCellPath).then((res: OEE) =>   {

        const oee = {
          ...res,
          dateStart: res.consideredTimeRange.startTimestamp,
          dateEnd: res.consideredTimeRange.endTimestamp,
          OEEPercentageRounded: Math.round(res.resultOverallPercentage * 100) / 100,
          availabilityPercentageRounded: Math.round(res.resultAvailabilityPercentage * 100) / 100,
          performancePercentageRounded: Math.round(res.resultPerformancePercentage * 100) / 100,
          qualityPercentageRounded: Math.round(res.resultQualityPercentage * 100) / 100,
        };

        this.currentOrderOEE.oee = oee;
        this.currentOrderOEE.isOrder = true;
        this.currentOrderOEE.isShift = false,
        this.currentOrderOEE.isLine = true,
        this.currentOrderOEE.processCellPath = this.selectedProcessCellPath;
        this.currentOrderOEE.isLoading = false;
        this.currentOrderOEE.noData = res || res?.uoM ? false : true;
        this.currentOrderOEE.serverError = false;
        this.currentOrderOEE.machinePath = null;


        if (this.orderIsActive) {
          this.actualOrderCard.performancePercentage = this.currentOrderOEE.oee.performancePercentageRounded;
          this.actualOrderCard.oeePercentage = this.currentOrderOEE.oee.OEEPercentageRounded;
          this.actualOrderCard.status =  this.actualOrderCard.oeePercentage < 30 ? 'error' :
                                              ((this.actualOrderCard.oeePercentage >= 30 && this.actualOrderCard.oeePercentage < 70) ? 'warning' :
                                                      (this.actualOrderCard.oeePercentage >= 70 && this.actualOrderCard.oeePercentage <= 100 ? 'success' : ''));

        } else {
          this.actualOrderCard.performancePercentage = null;
          this.actualOrderCard.oeePercentage = null;
          this.actualOrderCard.status = ''
        }

        if (this.primaryFilterValue == PrimaryType.Order && !this.selectedMachinePath) {
          this.oeeCard =  { ...this.currentOrderOEE };
        }

        this.getOrderMachineOEE();
      }).catch(error => {
        this.currentOrderOEE.serverError = true;
        this.currentOrderOEE.isLoading = false;
        this.actualOrderCard.isLoading = false;

        if (this.primaryFilterValue == PrimaryType.Order && !this.selectedMachinePath) {
          this.oeeCard =  { ...this.currentOrderOEE };
        }
      });
    } else {
      this.currentOrderOEE.isLoading = false;
      this.actualOrderCard.isLoading = false;
      this.orderMachineOEELoading = false;

      this.actualOrderCard.performancePercentage = null;
      this.actualOrderCard.oeePercentage = null;
      this.actualOrderCard.status = ''
  }

  }

  getOrderMachineOEE() {
    if (this.selectedProcessCellPath) {
        this.integrationService.getMachinesRunningBatchOEEData(this.selectedProcessCellPath).then((res: MachineOEE) =>   {

        this.orderMachineOEE = res
        this.orderMachineOEEServerError = false;
        this.orderMachineOEELoading = false;

        this.copySelOrderMachineOEEData()

        this.newOrderMachinesArray = [];
        res.response.map(el => {
          let oee = +el.oee.resultOverallPercentage.toFixed(0);
          this.newOrderMachinesArray.push({
            title: el.machineName,
            value: oee,
            path: el.machinePath,
            status: oee < 30 ? 'error' : ((oee >= 30 && oee < 70) ? 'warning' : (oee >= 70 && oee <= 100 ? 'success' : ''))
          })
        })
        let oee = this.currentOrderOEE.oee.OEEPercentageRounded
        this.newOrderMachinesArray.unshift({
          title: this.lineText,
          value: oee,
          status: oee < 30 ? 'error' : ((oee >= 30 && oee < 70) ? 'warning' : (oee >= 70 && oee <= 100 ? 'success' : '')),
          path: null
        });

        this.getTabMachinesArrays();
        this.actualOrderCard.isLoading = false;
        if (!this.currentShiftCard.isLoading) {
          this.updateCards();
        }
      }).catch(error => {
        this.shiftMachineOEEServerError = true;
        this.orderMachineOEELoading = false;
        this.actualOrderCard.isLoading = false;
      });
    } else {
      this.actualOrderCard.isLoading = false;
      this.orderMachineOEELoading = false;
    }

  }

  copySelOrderMachineOEEData() {
    if (this.primaryFilterValue == PrimaryType.Order ) {
      if (this.selectedMachinePath) {
        this.orderMachineOEE.response.forEach(item => {
          if (item.machinePath == this.selectedMachinePath) {
            const oee = {
              ...item.oee,
              dateStart: item.oee.consideredTimeRange.startTimestamp,
              dateEnd: item.oee.consideredTimeRange.endTimestamp,
              OEEPercentageRounded: Math.round(item.oee.resultOverallPercentage * 100) / 100,
              availabilityPercentageRounded: Math.round(item.oee.resultAvailabilityPercentage * 100) / 100,
              performancePercentageRounded: Math.round(item.oee.resultPerformancePercentage * 100) / 100,
              qualityPercentageRounded: Math.round(item.oee.resultQualityPercentage * 100) / 100,
            };

            this.oeeCard.oee = oee;
            this.oeeCard.isOrder = true;
            this.oeeCard.isShift = false,
            this.oeeCard.isLine = false,
            this.oeeCard.processCellPath = this.selectedProcessCellPath;
            this.oeeCard.isLoading = this.shiftMachineOEELoading;
            this.oeeCard.noData = item.oee || item.oee?.uoM ? false : true;
            this.oeeCard.serverError = this.shiftMachineOEEServerError;
            this.oeeCard.machinePath = this.selectedMachinePath;
          }
        })
      } else {
        this.oeeCard =  { ...this.currentOrderOEE };
      }
    }
  }

  getCurrentShiftOEE():any {
    const dateStart = this.actualShift.shiftStartDatetime;
    const dateEnd = this.actualShift.shiftEndDatetime;

    if (this.selectedProcessCellPath && this.shiftIsActive) {
      if (dateStart) {
          this.integrationService.getOEE(this.selectedProcessCellPath, dateStart, dateEnd,true).then((res: OEE) =>   {

          const oee = {
            ...res,
            dateStart: dateStart,
            dateEnd: dateEnd,
            OEEPercentageRounded: Math.round(res.resultOverallPercentage * 100) / 100,
            availabilityPercentageRounded: Math.round(res.resultAvailabilityPercentage * 100) / 100,
            performancePercentageRounded: Math.round(res.resultPerformancePercentage * 100) / 100,
            qualityPercentageRounded: Math.round(res.resultQualityPercentage * 100) / 100,
          };

          this.currentShiftOEE.oee = oee;
          this.currentShiftOEE.isOrder = false;
          this.currentShiftOEE.isShift = true,
          this.currentShiftOEE.isLine = true,
          this.currentShiftOEE.processCellPath = this.selectedProcessCellPath;
          this.currentShiftOEE.isLoading = false;
          this.currentShiftOEE.noData = res || res?.uoM ? false : true;
          this.currentShiftOEE.serverError = false;
          this.currentShiftOEE.machinePath = null;


          if (this.shiftIsActive) {
            this.currentShiftCard.status = this.currentShiftOEE.oee.OEEPercentageRounded < 30 ? 'error' :
                                          (( this.currentShiftOEE.oee.OEEPercentageRounded >= 30 &&  this.currentShiftOEE.oee.OEEPercentageRounded < 70) ? 'warning' :
                                            ( this.currentShiftOEE.oee.OEEPercentageRounded >= 70 &&  this.currentShiftOEE.oee.OEEPercentageRounded <= 100 ? 'success' : ''));
          } else {
            this.currentShiftCard.status = '';
          }

          if (this.primaryFilterValue == PrimaryType.Shift  && !this.selectedMachinePath) {
            this.oeeCard =  { ...this.currentShiftOEE };
          }
          this.getShiftMachineOEE();
        }).catch(error => {
          this.currentShiftOEE.serverError = true;
          this.currentShiftOEE.isLoading = false;
          this.currentShiftCard.isLoading = false;

          if (this.primaryFilterValue == PrimaryType.Shift  && !this.selectedMachinePath) {
            this.oeeCard =  { ...this.currentShiftOEE };
          }

        });
      }
    } else {
      this.currentShiftOEE.isLoading = false;
      this.currentShiftCard.isLoading = false;
      this.shiftMachineOEELoading = false;

      this.currentShiftCard.status = '';
    }

  }

  getShiftMachineOEE() {

    if (this.selectedProcessCellPath) {
        // this.integrationService.getMachinesRunningBatchOEEData(this.selectedProcessCellPath).then((res: MachineOEE) =>   {
          this.integrationService.getMachinesOEEData(this.selectedProcessCellPath,
            this.actualShift.shiftStartDatetime,
            this.actualShift.shiftEndDatetime,
            this.hoursToDisplay,
            true
            ).then((res: MachineOEE) =>   {

        this.shiftMachineOEE = res
        this.shiftMachineOEEServerError = false;
        this.shiftMachineOEELoading = false;

        this.copySelShiftMachineOEEData()

        this.newShiftMachinesArray = [];
        res.response.map(el => {
          let oee = +el.oee.resultOverallPercentage.toFixed(0);
          this.newShiftMachinesArray.push({
            title: el.machineName,
            value: oee,
            path: el.machinePath,
            status: oee < 30 ? 'error' : ((oee >= 30 && oee < 70) ? 'warning' : (oee >= 70 && oee <= 100 ? 'success' : ''))
          })
        })

        let oee = this.currentShiftOEE.oee.OEEPercentageRounded;
        this.newShiftMachinesArray.unshift({
          title: this.lineText,
          value: oee,
          status: oee < 30 ? 'error' : ((oee >= 30 && oee < 70) ? 'warning' : (oee >= 70 && oee <= 100 ? 'success' : '')),
          path: null
        });

        this.getTabMachinesArrays();
        this.currentShiftCard.isLoading = false;
        if (!this.actualOrderCard.isLoading) {
          this.updateCards();
        }
      }).catch(error => {
        this.shiftMachineOEEServerError = true;
        this.shiftMachineOEELoading = false;
        this.currentShiftCard.isLoading = false;
      });
    }

  }

  copySelShiftMachineOEEData() {
    if (this.primaryFilterValue == PrimaryType.Shift ) {
      if (this.selectedMachinePath) {
        this.shiftMachineOEE.response.forEach(item => {
          if (item.machinePath == this.selectedMachinePath) {
            const oee = {
              ...item.oee,
              dateStart: item.oee.consideredTimeRange.startTimestamp,
              dateEnd: item.oee.consideredTimeRange.endTimestamp,
              OEEPercentageRounded: Math.round(item.oee.resultOverallPercentage * 100) / 100,
              availabilityPercentageRounded: Math.round(item.oee.resultAvailabilityPercentage * 100) / 100,
              performancePercentageRounded: Math.round(item.oee.resultPerformancePercentage * 100) / 100,
              qualityPercentageRounded: Math.round(item.oee.resultQualityPercentage * 100) / 100,
            };

            this.oeeCard.oee = oee;
            this.oeeCard.isOrder = false;
            this.oeeCard.isShift = true,
            this.oeeCard.isLine = false,
            this.oeeCard.processCellPath = this.selectedProcessCellPath;
            this.oeeCard.isLoading = this.shiftMachineOEELoading;
            this.oeeCard.noData = item.oee || item.oee?.uoM ? false : true;
            this.oeeCard.serverError = this.shiftMachineOEEServerError;
            this.oeeCard.machinePath = this.selectedMachinePath;
          }
        })
      } else {
        this.oeeCard =  { ...this.currentShiftOEE };
      }

    }

  }

  calculateStartEndDate(){

    const endDate = new Date().toISOString();
    var startDate = new Date();
    startDate.setHours(startDate.getHours() - this.hoursToDisplay);

    const startDateFinal = new Date(this.dateStart).getTime() > startDate.getTime() ? this.dateStart : new Date(startDate).toISOString()

    this.hoursToDisplay = Math.abs(new Date(endDate).getTime() - new Date(startDateFinal).getTime()) / 36e5;

    return [startDateFinal, endDate] as const

  }

  getSpeedAndSetPoints(){
    const [startDate, endDate] = this.calculateStartEndDate();

    this.integrationService.getSpeedAndSetPoints(this.selectedProcessCellPath,startDate, endDate, null).then((res)=>{
      let tempData: SmoothLineChartModel[] = [];
      res?.response.forEach(item => {
        tempData.push({
          dateTime: (new Date(item.time)).getTime(),
          value: item.actualSpeed
        })
      });
      this.endLineSpeedCard.chartData = tempData;
      this.endLineSpeedCard.isLoading = false;
      this.endLineSpeedCard.serverError = false;
      this.endLineSpeedCard.noData = tempData.length == 0;

    }).catch(error => {
      this.endLineSpeedCard.serverError = true;
      this.endLineSpeedCard.isLoading = false;
    });
}

  // getProcessCellSpeed(){
  //   this.endLineSpeedCard.UoM = this.configurationService.getUoMByProcessCellPath(this.selectedProcessCellPath);
  //   this.integrationService.getProcessCellSpeed(this.selectedProcessCellPath).then((speed) => {
  //     if (speed[0].values[0][1] > 1) {
  //       this.endLineSpeedCard.actualSpeed = Math.round(speed[0].values[0][1] * 10) / 10;
  //     } else {
  //       this.endLineSpeedCard.actualSpeed = Math.round(speed[0].values[0][1] * 100) / 100;
  //     }
  //     if (speed[0].values[0][2] > 1) {
  //       this.endLineSpeedCard.setpointSpeed = Math.round(speed[0].values[0][2] * 10) / 10;
  //     } else {
  //       this.endLineSpeedCard.setpointSpeed = Math.round(speed[0].values[0][2] * 100) / 100;
  //     }
  //   })
  //   this.translate.get(["SHARED.min"]).subscribe((translations) => {
  //     this.endLineSpeedCard.timeUoM = translations["SHARED.min"];
  //   })
  // }




  getLiveDatas(){
    if (this.selectedProcessCell) {

      const [startDate, endDate] = this.calculateStartEndDate();

      this.integrationService.getMachinesLiveData(this.selectedProcessCellPath, startDate, endDate, null).then((res)=>{
        const liveDataName1 = this.selectedProcessCell.settings.liveData1;
        const liveDataName2 = this.selectedProcessCell.settings.liveData2;

        let tempChartData1 = [];
        let tempChartData2 = [];

        res?.machinesLiveData?.forEach(machineLiveData => {
          machineLiveData.liveData.forEach(data => {
            if(data.name === liveDataName1){
              this.liveDataCard.UoM1 = data.uom;
              this.liveDataCard.titleChart1 = data.description;
              tempChartData1 = data.values;
            }

            if(data.name === liveDataName2){
              this.liveDataCard.UoM2 = data.uom;
              this.liveDataCard.titleChart2 = data.description;
              tempChartData2= data.values;
            }
          });
        })

        let tempData1: SmoothLineChartModel[] = [];
        tempChartData1?.forEach(item => {
          tempData1.push({
            dateTime: (new Date(item.time)).getTime(),
            value: item.informationValue
          })
        });

        let tempData2: SmoothLineChartModel[] = [];
        tempChartData2?.forEach(item => {
          tempData2.push({
            dateTime: (new Date(item.time)).getTime(),
            value: item.informationValue
          })
        });

        this.liveDataCard.chartData1 = tempData1;
        this.liveDataCard.chartData2 = tempData2;

        this.liveDataCard.isLoading = false;
        this.liveDataCard.serverError = false;
        this.liveDataCard.noData = tempData1.length == 0 && tempData2.length == 0;
      }).catch(error => {
        this.liveDataCard.serverError = true;
        this.liveDataCard.isLoading = false;
        this.liveDataCard.chartData1 = [];
        this.liveDataCard.chartData2 = [];
      });
    }
  }


  getMachineLiveDatas(){
    const [startDate, endDate] = this.calculateStartEndDate();

    this.integrationService.getLiveData(this.selectedMachinePath, startDate, endDate, null).then((res)=>{
      const liveDataName2 = this.selectedProcessCell.settings.liveData2;

      let tempChartData1 = [];
      let tempChartData2 = [];

      if ((res.liveData.length >= 2) && liveDataName2) {
        this.liveDataCard.UoM1 = res.liveData[0].uom;
        this.liveDataCard.titleChart1 = res.liveData[0].description;
        tempChartData1 = res.liveData[0].values;

        this.liveDataCard.UoM2 = res.liveData[1].uom;
        this.liveDataCard.titleChart2 = res.liveData[1].description;
        tempChartData2 = res.liveData[1].values;
      } else if (res.liveData.length >= 1) {
        this.liveDataCard.UoM1 = res.liveData[0].uom;
        this.liveDataCard.titleChart1 = res.liveData[0].description;
        tempChartData1 = res.liveData[0].values;
      }

      let tempData1: SmoothLineChartModel[] = [];
      tempChartData1.forEach(item => {
        tempData1.push({
          dateTime: (new Date(item.time)).getTime(),
          value: item.informationValue
        })
      });

      let tempData2: SmoothLineChartModel[] = [];
      tempChartData2.forEach(item => {
        tempData2.push({
          dateTime: (new Date(item.time)).getTime(),
          value: item.informationValue
        })
      });

      this.liveDataCard.chartData1 = tempData1;
      this.liveDataCard.chartData2 = tempData2;

      this.liveDataCard.isLoading = false;
    });
  }





  getAlarmSummaryData() {
    // this.componentDataAlarms.serverError = false;

    if (this.selectedProcessCell) {
        this.integrationService.getAlarmsSummaryByProcessCellPath(this.selectedProcessCellPath, true, this.dateStart, this.dateEnd).then((res: AlarmSummary) => {

          this.tempAlarmSummaryChartData = res.response;
          this.alarmSummaryCard.alarms = {
              ...res,
              chartData: this.tempAlarmSummaryChartData,
              dateStart: res.start,
              dateEnd: res.end,
              rowNumberToShow: 5,
              status: 'error',
          } ;

          this.filterAlarmSummaryByMachinePath()
          this.alarmSummaryCard.isLoading = false

          this.alarmSummaryCard.serverError = false

        }).catch(error => {
          this.alarmSummaryCard.serverError = true;
          this.alarmSummaryCard.isLoading = false;
        });
      }
  }

  filterAlarmSummaryByMachinePath() {
    if (!this.tempAlarmSummaryChartData || this.alarmSummaryCard.serverError) {return}
    //Filter alarm base on machine path
    if (this.selectedMachinePath ) {
      //Remove component path if presence
      this.tempAlarmSummaryChartData?.forEach(data => {
        var count = data.machinePath?.split(".").length;
        if (count == 7) {
          data.machinePath = data.machinePath.substr(0, data.machinePath.lastIndexOf("."));
        }
      });
      this.alarmSummaryCard.alarms.chartData = this.tempAlarmSummaryChartData.filter(data => data.machinePath == this.selectedMachinePath);
    } else {
      this.alarmSummaryCard.alarms.chartData = this.tempAlarmSummaryChartData;
    }
    this.addAlarmDescriptionToChart(this.alarmSummaryCard.alarms);
    this.alarmSummaryCard.noData = !this.alarmSummaryCard.alarms.chartData || this.alarmSummaryCard.alarms.chartData?.length == 0

  }


  //#region  DOWNTIME ALARMS
  getDowntimeAlarmsChartData() {

      if (this.selectedProcessCell) {
        this.integrationService.getDowntimeAlarmsByProcessCellPath(this.selectedProcessCellPath, this.dateStart, this.dateEnd).then((res: AlarmSummary) => {

          this.tempDowntimeAlarmChartData = res.response;
          this.downtimeAlarmCard.downtimes = {
            ...res,
            chartData: this.tempDowntimeAlarmChartData,
            dateStart: res.start,
            dateEnd: res.end,
            rowNumberToShow: 5,
            status: 'accent_2',
          };

          this.filterDowntimeAlarmsByMachinePath();
          this.downtimeAlarmCard.isLoading = false
          this.downtimeAlarmCard.serverError = false

        }).catch(error => {
          this.downtimeAlarmCard.serverError = true;
          this.downtimeAlarmCard.isLoading = false;
        });

      }
  }

  filterDowntimeAlarmsByMachinePath() {
    if (!this.tempDowntimeAlarmChartData || this.downtimeAlarmCard.serverError) {return}
    //Filter alarm base on machine path
    if (this.selectedMachinePath) {
      //Remove component path if presence
      this.tempDowntimeAlarmChartData?.forEach(data => {
        var count = data.machinePath?.split(".").length;
        if (count == 7) {
          data.machinePath = data.machinePath.substr(0, data.machinePath.lastIndexOf("."));
        }
      });
      this.downtimeAlarmCard.downtimes.chartData = this.tempDowntimeAlarmChartData.filter(data => data.machinePath == this.selectedMachinePath);
    } else {
      this.downtimeAlarmCard.downtimes.chartData = this.tempDowntimeAlarmChartData;
    }
    this.addAlarmDescriptionToChart(this.downtimeAlarmCard.downtimes);
    this.downtimeAlarmCard.noData = !this.downtimeAlarmCard.downtimes.chartData || this.downtimeAlarmCard.downtimes.chartData?.length == 0

  }

  getMachineFullHistory(){
    const pipe = new DatePipe(this.translate.currentLang);

    let [startDate, endDate] = this.calculateStartEndDate();

    let dailyEndDate = new Date(new Date(pipe.transform(new Date(endDate), 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
    let dailyStartDate = new Date(new Date(pipe.transform(new Date(endDate), 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

    if(new Date(startDate).getTime() >= new Date(dailyStartDate).getTime()){
      dailyStartDate = startDate;
    }
    if(new Date(endDate).getTime() <= new Date(dailyEndDate).getTime()){
      dailyEndDate = endDate;
    }

    this.integrationService.getMachineFullHistory(this.selectedMachinePath, dailyStartDate, dailyEndDate, null).then((res) => {
      this.componentDataMachineHistory = {
        ...res,
        noData: res.machinesHistory ? false : true,
        serverError: false,
      }
      //this.machineSpeeds = []
      let machineSpeedsToProcess: Array<MachineSpeed_FE> = [];
      res.machinesHistory.machineSpeeds.machineSpeeds.forEach(machineSpeed => {
        const macSpeed: MachineSpeed_FE = {}
        macSpeed.date = new Date(machineSpeed.time).getTime();
        macSpeed.setPoint = machineSpeed.setPoint
        macSpeed.speed = machineSpeed.speed
        machineSpeedsToProcess.push(macSpeed)
      });
      this.machineSpeeds = machineSpeedsToProcess
      this.machineSpeedUoM = this.componentDataMachineHistory?.machinesHistory?.machineSpeeds?.uoMValue

      let parameterSpeedsToProcess: Array<MachineParameterSpeed_FE> = []
      res.machinesHistory.machineSpeeds.parameterSpeeds.forEach(parameterSpeed => {
        const parSpeed: MachineParameterSpeed_FE = {}
        parSpeed.date = new Date(parameterSpeed.time).getTime();
        parSpeed.speed = parameterSpeed.speed
        parSpeed.time = parameterSpeed.time
        parameterSpeedsToProcess.push(parSpeed)
      });
      this.parameterSpeeds = parameterSpeedsToProcess


      let productionCounterToProcess: Array<ProgressiveMachineProductionCounter_FE> = [];
      // Array<ProgressiveMachineProductionCounter_FE>;
        res.machinesHistory.productionCounter.forEach(production=> {
        const prodCount: ProgressiveMachineProductionCounter_FE = {}
        prodCount.date = new Date(production.time).getTime();
        prodCount.production = production.production
        prodCount.time = production.time
        productionCounterToProcess.push(prodCount)
      });
      this.productionCounter = productionCounterToProcess

      //this.alarmOccurrences = [];
      let alarmOccurrencesToProcess: Array<AlarmHeldOccurencies_FE> = [];
      res.machinesHistory.alarmsResponse.forEach(alarm => {
        alarm.occurrencesList.forEach(occurrence => {
          let occ: AlarmHeldOccurencies_FE = occurrence;
          occ.name = alarm.name;
          occ.machineName = alarm.machineName;
          occ.machinePath = alarm.machinePath;
          occ.dateTime = pipe.transform(new Date(occurrence.alarmStart), 'HH:mm')
          occ.speed = 0;
          occ.date = new Date(occurrence.alarmStart).getTime();
          alarmOccurrencesToProcess.push(occ);
        });
      });
      this.alarmOccurrences = alarmOccurrencesToProcess.sort((firstItem, secondItem) => firstItem.date - secondItem.date);

      this.componentDataMachineHistory.serverError = false;
      this.componentDataMachineHistory.isLoading = false;
      this.componentDataMachineHistory.noData = this.productionCounter.length == 0 && this.parameterSpeeds.length == 0 && this.machineSpeeds.length == 0;

    }).catch(error => {
      this.componentDataMachineHistory.serverError = true;
      this.componentDataMachineHistory.isLoading = false;
    });
  }

  addAlarmDescriptionToChart(componentData: any) {

    componentData.chartData.forEach(data => {
      const machine = data.machineName;
      const alarmName = data.name;
      const duration = data.duration;
      const id = data.alarmId;

      data[alarmName] = duration;
      this.translate.get(['SHARED.id']).subscribe((translations) => {
        data['alarmDescription'] = machine + ' - ' + alarmName + ' (' + translations['SHARED.id'] + ': ' + id + ')'
      });
    });

  }
  //#endregion

  getMachineActulStatus(){
    this.integrationService.getLastMachineStatus(this.selectedMachinePath).then((res: ActualMachineStatus_BE) =>{
      this.machineStatusCard.machineActualStatus = res;
      this.machineStatusCard.isLoadingActualStatus = false;
      this.machineStatusCard.serverErrorActualStatus = false;
    }).catch(error => {
      this.machineStatusCard.serverErrorActualStatus = true;
      this.machineStatusCard.isLoadingActualStatus = false;
    });
  }


  getMachineStatusInMinutes(){
    this.integrationService.getStatusInMinutesByMachine(this.selectedMachinePath, this.dateStart, this.dateEnd, null).then((res: MachineStatusInMinutes) =>{
      this.machineStatusCard.machineStatusInMinutes = res;
      this.machineStatusCard.isLoadingStatusInMin = false;
      this.machineStatusCard.serverErrorStatusInMin = false;
    }).catch(error => {
      this.machineStatusCard.serverErrorStatusInMin = true;
      this.machineStatusCard.isLoadingStatusInMin = false;
    });
  }

  getMachineStatusHistory(){
    const [startDate, endDate] = this.calculateStartEndDate();

    this.integrationService.getMachineHistoryStateByProcessCellPath(startDate, endDate, this.selectedMachinePath, null,true).then((res: MachinesStatusHistory)=>{
      this.machineStatusCard.machineStatusHistory = res;
      this.machineStatusCard.isLoadingStatusHistory = false;
      this.machineStatusCard.serverErrorStatusHistory = false;
    }).catch(error => {
      this.machineStatusCard.serverErrorStatusHistory = true;
      this.machineStatusCard.isLoadingStatusHistory = false;
    });
  }

  //#region Current Order

  getOverviewBatch() {
    if (this.id) {
      this.integrationService.getTotalProducedAndDefectiveParts(this.selectedProcessCellPath, this.actualOrder?.timeSeriesStart, this.actualOrder?.timeSeriesEnd).then(batchActualQuantity =>   {
        // this.dataLoading = false;
        this.batchActualQuantity = batchActualQuantity;
        if (!this.batchActualQuantity.response){
          this.batchActualQuantity.response.goodCount = 0;
          this.batchActualQuantity.response.rejectedCount = 0;
          this.batchActualQuantity.response.lostCount = 0;
            }
        else{
          this.batchActualQuantity.response.goodCount = Math.round((batchActualQuantity.response.goodCount + Number.EPSILON) * 10) / 10;
          this.batchActualQuantity.response.rejectedCount = Math.round((batchActualQuantity.response.rejectedCount + Number.EPSILON) * 10) / 10;
          this.batchActualQuantity.response.lostCount = Math.round((batchActualQuantity.response.lostCount + Number.EPSILON) * 10) / 10;
          }
          this.actualOrderCard.totalGoodPieces = this.batchActualQuantity.response.goodCount;
          this.actualOrderCard.totalDefectivePieces = Math.round((this.batchActualQuantity.response.rejectedCount + this.batchActualQuantity.response.lostCount) * 10) / 10


          if (this.actualOrder) {
            this.actualOrderCard.noData = false;
            this.actualOrderCard.batch = this.actualOrder;

          } else {
            this.actualOrderCard.batch = null;
            this.actualOrderCard.noData = true;
            var pc = (this.selectedProcessCell ? this.selectedProcessCell : this.selectedProcessCellPath);
          }
      });
    } else {
      this.actualOrderCard.batch = null;
      this.actualOrderCard.noData = true;
      this.actualOrderCard.isLoading = false;
    }
  }

  BatchDataChanged() {
    this.getActualOrderAndShift();
  }


  startProduction(){
    this.scheduleService.startBatch(this.id).then(() => {},
    error => {
      this.translate.get(["CALENDAR.WARNING","OVERVIEW.Error_while_starting_production"]).subscribe((translations) => {
        this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["OVERVIEW.Error_while_starting_production"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
      });
    });
  }

  stopProduction(){
    const obj = {
      goodCount: this.batchActualQuantity.response.goodCount,
      rejectedCount: this.batchActualQuantity.response.rejectedCount,
      uom: this.actualOrder.uom,
      processCellPath: this.selectedProcessCell.path,
      isStopProduction: true,
    };
    this.dialogService.open(AdjustOrderPiecesModalComponent, {
      context: obj as Partial<AdjustOrderPiecesModalComponent>,
    })
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.scheduleService.stopBatch(this.id).then(() => {},
            error => {
              this.translate.get(["CALENDAR.WARNING","OVERVIEW.Error_while_stopping_production"]).subscribe((translations) => {
                this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["OVERVIEW.Error_while_stopping_production"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
              });
            });
        }
      }
    });
  }
  //#endregion

  resumeProduction(){
    this.scheduleService.resumeBatch(this.id).then(() => {},
    error => {
      this.translate.get(["CALENDAR.WARNING","OVERVIEW.Error_while_resuming_production"]).subscribe((translations) => {
        this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["OVERVIEW.Error_while_starting_production"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
      });
    });
  }

  pauseProduction(){
    this.scheduleService.pauseBatch(this.id).then(() => {},
    error => {
      this.translate.get(["CALENDAR.WARNING","OVERVIEW.Error_while_pausing_production"]).subscribe((translations) => {
        this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["OVERVIEW.Error_while_starting_production"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
      });
    });
  }

  //#region LineStatus

  getLineStatus(){
    this.integrationService.getMachineLineStatus(this.selectedProcessCellPath, false).then(lineStatus => {
      this.lineStatusCard.lineStatus = lineStatus;
      this.lineStatusCard.isLoading = false;

      if (this.lineStatusCard.lineStatus.currentSpeed  > 1) {
        this.endLineSpeedCard.actualSpeed = Math.round(this.lineStatusCard.lineStatus.currentSpeed * 10) / 10;
      } else {
        this.endLineSpeedCard.actualSpeed = Math.round(this.lineStatusCard.lineStatus.currentSpeed * 100) / 100;
      }
      if (this.lineStatusCard.lineStatus.setpointSpeed  > 1) {
        this.endLineSpeedCard.setPointSpeed = Math.round(this.lineStatusCard.lineStatus.setpointSpeed * 10) / 10;
      } else {
        this.endLineSpeedCard.setPointSpeed = Math.round(this.lineStatusCard.lineStatus.setpointSpeed * 100) / 100;
      }
      this.endLineSpeedCard.UoM = this.lineStatusCard.lineStatus.uoM;
      this.translate.get(["SHARED.min"]).subscribe((translations) => {
        this.endLineSpeedCard.timeUoM = translations["SHARED.min"];
      })

    })
    .catch(() =>{
      this.lineStatusCard.lineStatus = null
      this.lineStatusCard.isLoading = false;
      this.lineStatusCard.serverError = true;
    });
  }

  //#endregion


  updateOEECards() {
    if (this.shiftIsActive || this.orderIsActive) {
      this.getCurrentOrderOEE();
      this.getCurrentShiftOEE();
    } else {
      this.currentOrderOEE.isLoading = false;
      this.actualOrderCard.isLoading = false;
      this.orderMachineOEELoading = false;
      this.currentShiftOEE.isLoading = false;
      this.currentShiftCard.isLoading = false;
      this.shiftMachineOEELoading = false;

      this.actualOrderCard.performancePercentage = null;
      this.actualOrderCard.oeePercentage = null;
      this.actualOrderCard.status = ''
      this.currentShiftCard.status = '';
      this.getLineStatus();
    }
  }

  updateCards() {
    this.getAlarmSummaryData();
    this.getDowntimeAlarmsChartData();

    if (this.selectedMachinePath) {
      this.updateMachinesCards();
    } else {
      this.getLineStatus();
      this.getSpeedAndSetPoints();
      this.getLiveDatas();
    }
  }

  updateMachinesCards() {
    this.getMachineActulStatus();
    this.getMachineStatusInMinutes();
    this.getMachineStatusHistory();
    this.getMachineFullHistory();
    this.getMachineLiveDatas();
  }

   updateComponent() {
    this.getActualOrderAndShift()
  }

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.resetTabSel = this.resetTabSel + 1;
        this.primaryFilterValue = PrimaryType.Order;
        this.selectedMachinePath = null;

        this.updatePeriodicRefresh();
        this.getDisplayGroups();
        this.gePCData();
        this.loadingComponents();
        this.updateComponent();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true && this.firstLoad === true) {
        this.setHelpPage()
        this.getDisplayGroups();
        this.gePCData ();
        this.loadingComponents();
        this.updateComponent();
        this.firstLoad = false;
      }
    });
  }

  gePCData () {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.selectedProcessCellPath = this.selectedProcessCell.path;

    this.hoursToDisplay = this.selectedProcessCell.areaSettings.numberOfHoursDisplayedOnOverview

  }

  loadingComponents() {

    this.id = null;
    this.selectedMachinePath = null;
    this.orderIsActive = false
    this.shiftIsActive = false

    this.actualOrderCard.isLoading = true;
    this.currentShiftCard.isLoading = true;

    this.shiftMachineOEELoading = true;
    this.orderMachineOEELoading = true;
    this.currentShiftOEE.isLoading = true;
    this.currentOrderOEE.isLoading = true;
    this.oeeCard.isLoading = true;

    this.lineStatusCard.isLoading = true;
    this.endLineSpeedCard.isLoading = true;
    this.liveDataCard.isLoading = true;
    this.downtimeAlarmCard.isLoading = true;
  }

  ngOnDestroy() {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    this.cancelPeriodicRefresh();
  }


  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  getComponentSignalRListenersNames(){
    return this.signalRListenersNames;
  }


  getComponentSignalRListenersNamesIntegration(){
    return this.signalRListenersNamesIntegration;
  }

  getComponentSignalRListenersNamesLiveData(){
    return this.signalRListenersNamesLiveData;
  }


  MachinesStatusChanged(message) {
    this.getLineStatus();
    // this.getSpeedAndSetPoints();

    if (this.selectedMachinePath) {
      this.getMachineStatusHistory();
    }
  }

  LineStatusLiveDataChanged(message) {
    this.getLineStatus();
    this.getLiveDatas();
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

}
