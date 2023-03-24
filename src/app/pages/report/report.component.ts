import { filter } from 'rxjs/operators';
import { Component, ComponentFactoryResolver, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IntegrationData } from '../../@core/data/integration';

import { ConfigService } from '../../@core/utils/services/config.service';
import { ConfigurationData } from '../../@core/data/configuration';
import {TranslateService} from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import {
  timeRange_FE,
  itemOEE_FE,
  MachinesScatter_FE,
  ScatterChartOrders_FE,
  ScatterChartShifts_FE,
  ScatterChartSummaryShifts_FE,
} from "../../@core/utils/models/presentation/integration/scatterchart-orders";

import {
  timeRange_BE,
  itemOEE_BE,
  MachinesScatter_BE,
  ScatterChartOrders_BE,
  ScatterChartShifts_BE,
  ScatterChartSummaryShifts_BE,
} from "../../@core/utils/models/backend/integration/scatterchart-orders";

import * as moment from 'moment';
import { ParametersData } from '../../@core/data/parameters';
import { SchedulingData } from '../../@core/data/scheduling';
import { ExportWorkerData } from '../../@core/data/exportworker';
import { DatePipe } from '@angular/common';

import { SignalRNotificationService } from '../../@core/utils/services/signalR-notification.service';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { SelectProcessCellComponent } from '../../@core/utils/shared/select-process-cell-modal/select-process-cell-modal.component';
import { NbDialogService } from '@nebular/theme';

import { primaryArrayElement, PrimaryType, machinesArrayElement } from '../../@core/utils/models/presentation/miscellanous/tabs';
import { ReportOEEDetailsTableTeamsSummaryModel } from '../../@core/utils/models/presentation/miscellanous/report-oee-details-table-teams-summary-model';
import { BaseClass } from '../../@core/utils/common/base-class/base-class';

interface Order {
  $id: string;
  startedAt: string;
  stoppedAt: string;
  productionOrder: string;
  processCellPath: string[];
}

@Component({
  selector: 'ngx-report',
  styleUrls: ['./report.component.scss'],
  templateUrl: './report.component.html',
})
export class ReportComponent extends BaseClass implements OnInit, OnDestroy {

  signalRSubscription: Subscription;
  signalRListenersNames: string[] = ['GetExportPercentage'];
  serverNotificationstopic: string = 'ApiGateway';


  data: any = [];
  filteredData: any = [];
  reportScatterTeams: ReportOEEDetailsTableTeamsSummaryModel[] = [];
  filterReportScatterTeams: boolean = false;

  tabMachinesArray: any[] = [];
  resetTabSel = 0

  defaultValue = true;
  toggleArray: any[];

  hiddenBubble = {
    timeStamp: '2022-02-01T03:51:10.3969244Z',
    oeeValue: 0,
    hidden: true,
  }

  chartConfig
  pointsColors = [
    { min: 0, max: 30, color: this.config.getColor('error') },
    { min: 30, max: 70, color: this.config.getColor('accent_1') },
    { min: 70, max: 100, color: this.config.getColor('success') },
  ];
  reportArray: any[] = [];
  reportValues: any[] = [];
  toggleValue: any;

  timeRangeMin;
  timeRangeMax;
  timeRangeMinInput;
  timeRangeMaxInput;
  pcText = '';
  productCodeText = '';

  numberOfDays
  numberOfDaysString

  exportReportId = { path: null };

  unchangedReportValue: any[] = [];
  startTime: any = null;
  endTime: any = null;
  filterProcessCell: any = undefined;
  domain
  updateDataReq = false;
  pcSub: Subscription;
  loadSub: Subscription;
  helpLinkPage = 'report';
  isLoading: boolean = false;
  serverError: boolean = false;
  summaryisLoading: boolean = false;
  summaryServerError: boolean = false;

  selectedProcessCell: any = null;
  selectedPO: any = null;
  selectedTeam: any = null;
  selectedProductionOrder: Order = null;
  productionOrderArray: any[];
  teamArray: any;
  processCellsArray: any;

  pipe = new DatePipe('en-US');
  destroyExtras: boolean = true;datesFromExtras: boolean;
  products: any;

  exportReportButtonEnabled: boolean = true;
  exportInProgress: boolean = false;
  poAutocompleteList: Order[];
  autocompleteText: string;
  debounceTimer: NodeJS.Timeout;

  pinText: string = '';
  reportValuesForTable: any[] = [];


  constructor(
    private router: Router,
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private parametersService: ParametersData,
    private scheduleService: SchedulingData,
    private exportWorkerService: ExportWorkerData,
    private signalR: SignalRNotificationService,
    private nbAuthService: NbAuthService,
    private dialogService: NbDialogService,
  ) {
    super(nbAuthService);
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    translate.use(config.getSelectedLanguage());
    moment.locale(config.getSelectedLanguage());

    const extras = JSON.parse(localStorage.getItem('fromreportDetailsExtras'));
    if (extras) {
      this.defaultValue = (extras.domain ? extras.domain : this.defaultValue);
    }

    this.translate.get(['REPORT.Order', 'REPORT.Shift']).subscribe((translations) => {
      this.toggleArray = [
        { key: 'true', value: translations['REPORT.Order'] },
        { key: 'false', value: translations['REPORT.Shift'] },
      ];
    });

    this.translate.get('REPORT.Process_Cell').subscribe((translation) => {
      this.pcText = translation;
    });
    this.translate.get('OVERVIEW.Product_Code').subscribe((translation) => {
      this.productCodeText = translation;
    });

    this.getTeams();
    // this.getProductCodeList();
    // this.selectedProcessCell = this.configurationService.getSelectedProcessCell();

    this.exportWorkerService.ExportInProgress_Listener.subscribe(exportInProgress => {
      this.exportInProgress = exportInProgress;
    })

  }


  ngOnInit() {
    // this.listenForSelectedProcessCellChanges();
    const extras = JSON.parse(localStorage.getItem('fromReportDetailsExtras'));
    this.selectedProcessCell = '';
    this.selectedPO = '';
    this.selectedTeam = '';
    if (extras) {
      this.selectedTeam =  extras.actualTeam ? extras.actualTeam : '';
      this.selectedProcessCell = extras.selectedProcessCell ? extras.selectedProcessCell : '';
      this.selectedPO = extras.selectedPO ? extras.selectedPO : '';
      this.startTime = extras.globalFrom ? extras.globalFrom : null;
      this.endTime = extras.globalTo ? extras.globalTo : null;
      this.datesFromExtras = extras.globalFrom && extras.globalTo ? true : false;
      this.defaultValue = (extras.domain ? extras.domain : this.defaultValue);
      this.toggleValue = (extras.domain ? extras.domain : this.defaultValue);
      this.updateDataReq = true;
      this.pinText = extras.pinText ? extras.pinText : '';
      localStorage.removeItem('fromReportDetailsExtras');
    } else {
      this.selectedProcessCell = '';
      this.selectedPO = '';
      this.selectedTeam = '';
      this.datesFromExtras = false;
      this.toggleValue = true;
    }
    this.waitConfigurationServiceLoaded();
  }

  getComponentSignalRListenersNames(){
    return this.signalRListenersNames;
  }
  getComponentTopic() {
    return this.serverNotificationstopic;
  }
  getComponentSignalRSubscriptionType(){
    return "group";
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.value === o2.value;
  }

  setHelpPage() {
    this.config.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  toggleChanged(value) {
    if (value !== undefined) {
      this.toggleValue = value;
      if (this.toggleValue === 'true' || this.toggleValue === true || !this.toggleValue) {
        this.getBatchOEEData();
      } else {
        this.getShiftOEEData();
      }
    }
  }

  getOEEColor(value) {
    if (value !== null) {
      const res = this.pointsColors.find(color => {
        return color.min <= value && value <= color.max;
      });
      if ( res?.color) {
        return res.color;
      }
    }
  }


  getBatchOEEData(): void {
    this.isLoading = true;
    this.serverError = false;
    const pipe = new DatePipe(this.translate.currentLang);
    if (this.startTime !== 'null' && this.endTime !== 'null' && this.startTime !== null && this.endTime !== null) {
      // const endTimeISO = new Date(new Date(this.endTime).setHours(23, 59, 59)).toISOString();
      // const startTimeISO = new Date(new Date(this.startTime).setHours(0, 0, 0)).toISOString();

      let endTimeISO = new Date(new Date(pipe.transform(this.endTime, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
      let startTimeISO = new Date(new Date(pipe.transform(this.startTime, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

      const self = this;
      if (startTimeISO && endTimeISO) {
        this.integrationService.getBatchOEEData(startTimeISO, endTimeISO).then((data: ScatterChartOrders_BE) => {
          if (data && data.response) {
            // if (this.products) { // using already saved Idenfitiers
            this.modifyBatchOEEData(data);
            // } else {
            //   // this.parametersService.getIdentifiers().then(products => { // get Identifiers and sets select list and products
            //     this.productionOrderArray = [];
            //     this.products = products;
            //     const list = new Set([...products]);


            const listArr: Array<any> = [...data.response].map((el: itemOEE_BE) => {
              return {
                value: el.productCode,
                name: el.productCode,
                productDescription: el.productDescription,
              };
            });
            // const list =[...new Set(listArr.map(JSON.stringify()))].map(JSON.parse);
            // const list = listArr.filter((v,i) => !listArr.includes(v,i+1))

            const list = [
              ...new Map(listArr.map((item) => [item["value"], item])).values(),
            ];

            this.productionOrderArray = list;

            this.isLoading = false;
          }
        }).catch(error => {
          this.isLoading = false;
          this.serverError = true;
        });
      }
    }
  }

  modifyBatchOEEData(data) {
    if (data.response) {
      data.response.forEach(el => {
        if (el.timeStamp) {
          el.detail = {};
          el.detail.processCell = el.processCell;
          // el.productDescription = this.products.find(product => product.productCode === el.productCode)?.productDescription;
          el.detail.numberOfHoursDisplayedOnOverview = this.selectedProcessCell?.areaSettings?.numberOfHoursDisplayedOnOverview;
          el.detail.productionCode = el.productCode;
          el.color = this.getOEEColor(el.oeeValue);
          el.startDate = new Date(el.startTime).getTime();
          el.endDate = new Date(el.endTime).getTime();
          el.timeStampDate = new Date(el.timeStamp).getTime();
        }
      });
    }

    this.reportValues = data.response;
    this.reportValuesForTable = this.reportValues.filter(val => { return new Date(val.timeStamp).getTime() >= new Date(new Date(this.startTime).setHours(0, 0, 0)).getTime() && new Date(new Date(this.endTime).setHours(23, 59, 59)).getTime() >= new Date(val.timeStamp).getTime()});
    this.unchangedReportValue = JSON.parse(JSON.stringify(this.reportValues));
    this.changedFilters();
  }

  getScatterShiftsSummary() {
    this.summaryisLoading = true;
    this.summaryServerError = false;
    if (this.startTime !== 'null' && this.endTime !== 'null' && this.startTime !== null && this.endTime !== null) {
      const endTimeISO = new Date(new Date(this.endTime).setHours(23, 59, 59)).toISOString();
      const startTimeISO = new Date(new Date(this.startTime).setHours(0, 0, 0)).toISOString();


      if (startTimeISO && endTimeISO) {
        this.integrationService.getScatterShiftsSummary(startTimeISO, endTimeISO, null).then((data) => {
          this.fetchScatterShiftsSummary(data.shiftsOEE)
          this.summaryisLoading = false;
        }).catch(error => {
          this.summaryisLoading = false;
          this.summaryServerError = true;
        });
      }
    }
  }

  fetchScatterShiftsSummary(data: any[]){
    this.reportScatterTeams = [];
    let tempArray = [];

    data.forEach(item =>{

      let shiftSummaryItem = {
        id: item.$id,
        name: item.teamName,
        color: item.teamColor,
        oee: item.oee.resultOverallPercentage,
        availability: item.oee.resultAvailabilityPercentage,
        performance: item.oee.resultPerformancePercentage,
        quality: item.oee.resultQualityPercentage,
        targetPieces: item.oee.idealPieces,
        goodPieces: item.oee.goodPieces,
        defectivePieces: item.oee.lostPieces + item.oee.rejectedPieces,
        uom: item.oee.uoM,
      } as ReportOEEDetailsTableTeamsSummaryModel;

      tempArray.push(shiftSummaryItem);
    })

    this.reportScatterTeams = tempArray;
  }

  getShiftOEEData() {
    this.isLoading = true;
    this.serverError = false;
    const pipe = new DatePipe(this.translate.currentLang);
    this.getScatterShiftsSummary();
    if (this.startTime !== 'null' && this.endTime !== 'null' && this.startTime !== null && this.endTime !== null) {
      // const endTimeISO = new Date(new Date(this.endTime).setHours(23, 59, 59)).toISOString();
      // const startTimeISO = new Date(new Date(this.startTime).setHours(0, 0, 0)).toISOString();
      let endTimeISO = new Date(new Date(pipe.transform(this.endTime, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
      let startTimeISO = new Date(new Date(pipe.transform(this.startTime, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

      if (startTimeISO && endTimeISO) {
        this.integrationService.getShiftOEEData(startTimeISO, endTimeISO).then((data: ScatterChartShifts_FE) => {

          if (data.response !== undefined && data.response !== null) {

            this.reportValues = data.response;

            this.reportValues.forEach(el => {
              if (el.timeStamp) {
                el.detail = {};
                el.detail.processCell = el.processCell;
                el.detail.team = el.teamName;
                el.color = this.getOEEColor(el.oeeValue);
                el.startDate = new Date(el.startTime);
                el.endDate = new Date(el.endTime);
                el.timeStampDate = new Date(el.timeStamp).getTime();
              }
            });

            this.unchangedReportValue =  this.reportValues;
            this.reportValuesForTable = this.reportValues.filter(val => { return new Date(val.timeStamp).getTime() >= new Date(new Date(this.startTime).setHours(0, 0, 0)).getTime() && new Date(new Date(this.endTime).setHours(23, 59, 59)).getTime() >= new Date(val.timeStamp).getTime()});
            this.changedFilters();
            this.isLoading = false;
          }
        }).catch(error => {
          this.isLoading = false;
          this.serverError = true;
        });
      }
    }
  }

  changedFilters () {
    this.reportValues = this.unchangedReportValue;

    if (this.toggleValue === 'true' || this.toggleValue === true || this.toggleValue === null){
      if (this.selectedPO) {
        this.reportValues = this.reportValues.filter(report => report.productCode === this.selectedPO.name);
        this.reportValuesForTable = this.reportValues.filter(val => { return new Date(val.timeStamp).getTime() >= new Date(new Date(this.startTime).setHours(0, 0, 0)).getTime() && new Date(new Date(this.endTime).setHours(23, 59, 59)).getTime() >= new Date(val.timeStamp).getTime()});
      }
    } else {
      if (this.selectedTeam) {
        this.reportValues = this.reportValues.filter(report => report.teamName === this.selectedTeam.name);
        this.reportValuesForTable = this.reportValues.filter(val => { return new Date(val.timeStamp).getTime() >= new Date(new Date(this.startTime).setHours(0, 0, 0)).getTime() && new Date(new Date(this.endTime).setHours(23, 59, 59)).getTime() >= new Date(val.timeStamp).getTime()});

        this.reportScatterTeams = this.reportScatterTeams.filter(report => report.name === this.selectedTeam.name);
        this.filterReportScatterTeams = true;
      } {
        this.filterReportScatterTeams = false;
      }
    }

    if (this.selectedProcessCell) {
      this.reportValues = this.reportValues.filter(report => report.processCellPath.includes(this.selectedProcessCell.path));
      this.reportValuesForTable = this.reportValues.filter(val => { return new Date(val.timeStamp).getTime() >= new Date(new Date(this.startTime).setHours(0, 0, 0)).getTime() && new Date(new Date(this.endTime).setHours(23, 59, 59)).getTime() >= new Date(val.timeStamp).getTime()});
    }
  }

  beginExportReport(){
    this.exportReportButtonEnabled = false;
    this.exportWorkerService.beginExportReport(this.startTime, this.endTime, this.toggleValue, this.selectedProcessCell, this.selectedPO, this.selectedTeam).then((res) =>{
      sessionStorage.setItem('exportReportId', res.taskId);
       // subscribe notifications
      this.exportWorkerService.showProgressBar(true);
      this.exportWorkerService.ExportInProgress(true);

      // this.exportInProgress = true;
      this.exportReportId.path = res.taskId;
      // draw progress
      // this.signalRSubscription = this.signalR.signalR_Listener.subscribe( () => {
      //   //
      // });

      // on notifications draw
      // on notifications close
      // ...
      this.exportReportButtonEnabled = true;

    })
  }

  getTeams() {
    this.scheduleService.getTeams().then(teams => {
      this.teamArray = teams.map(el => {
        return {
          value: el.teamName,
          name: el.teamName,
        };
      });
    });
  }

  updateProcessCellsArray() {
    this.processCellsArray = this.configurationService.getProcessCellsArray();

    this.processCellsArray.forEach(processCell => {
      processCell.value = +processCell.key;
    });


  }

  dateFilterChanged(dates) {
    if(dates.startTime !== undefined) {

      // this.reportValues = JSON.parse(JSON.stringify(this.unchangedReportValue));
      const extras = JSON.parse(localStorage.getItem('fromReportDetailsExtras'));
      if (extras) {
        this.startTime = extras.globalFrom ? extras.globalFrom : null;
        this.endTime = extras.globalTo ? extras.globalTo : null;
      } else {
        this.startTime = this.pipe.transform( dates.startTime, 'yyyy-MM-dd');
        this.endTime = this.pipe.transform( dates.endTime, 'yyyy-MM-dd');
      }

      if (this.toggleValue === 'true' || this.toggleValue === true || !this.toggleValue) {
        this.getBatchOEEData();
      } else {
        this.getShiftOEEData();
      }
    }
  }

  processCellFilterChanged() {
    if(this.toggleValue === 'true' || this.toggleValue === true || !this.toggleValue) {
      this.getBatchOEEData();
    } else {
      this.getShiftOEEData();
    }
  }

  teamChanged() {
      this.getShiftOEEData();
  }

  productionOrderFilterChanged() {
      this.getBatchOEEData();
  }

  tableClicked(activeRow) {
    const domain = this.toggleArray.find(toggle => toggle.key === '' + this.toggleValue).key; // True = Order, False = Team
    let extras;

    if (domain === true || domain === 'true') {
      extras = {
        processCell: activeRow.processCellPath,
        id: activeRow.name,
        selectedProductCode: activeRow.code,
        from: activeRow.startTime,
        to: activeRow.endTime,
        numberOfDaysString: this.numberOfDaysString,
        numberOfDays: this.numberOfDays,
        globalFrom: this.startTime,
        globalTo: this.endTime,
        selectedProcessCell: this.selectedProcessCell,
        selectedPO: this.selectedPO,
        domain: this.toggleValue,
        pinText: this.pinText,
        prevPage: "report",
      };
    } else {
      extras = {
        processCell: activeRow.processCellPath,
        from: activeRow.startTime,
        to: activeRow.endTime,
        numberOfDaysString: this.numberOfDaysString,
        numberOfDays: this.numberOfDays,
        globalFrom: this.startTime,
        globalTo: this.endTime,
        team: activeRow.name,
        selectedProcessCell: this.selectedProcessCell,
        actualTeam: this.selectedTeam,
        domain: this.toggleValue,
        pinText: this.pinText,
        prevPage: "report",
      };
    }

    this.destroyExtras = false;
    localStorage.setItem('reportDetailsExtras',JSON.stringify(extras));
    this.router.navigate(['pages/report-details']);
  }

  chartClicked(activePoint) {

    const domain = this.toggleArray.find(toggle => toggle.key === '' + this.toggleValue).key; // True = Order, False = Team
    let extras;

    if (domain === true || domain === 'true') {
      extras = {
        processCell: activePoint.processCellPath,
        id: activePoint.orderID,
        selectedProductCode: activePoint.productCode,
        from: activePoint.startTime,
        to: activePoint.endTime,
        numberOfDaysString: this.numberOfDaysString,
        numberOfDays: this.numberOfDays,
        globalFrom: this.startTime,
        globalTo: this.endTime,
        selectedProcessCell: this.selectedProcessCell,
        selectedPO: this.selectedPO,
        domain: this.toggleValue,
        pinText: this.pinText,
        prevPage: "report",
      };
    } else {
      extras = {
        processCell: activePoint.processCellPath,
        from: activePoint.startTime,
        to: activePoint.endTime,
        numberOfDaysString: this.numberOfDaysString,
        numberOfDays: this.numberOfDays,
        globalFrom: this.startTime,
        globalTo: this.endTime,
        team: activePoint.detail.team,
        selectedProcessCell: this.selectedProcessCell,
        actualTeam: this.selectedTeam,
        domain: this.toggleValue,
        pinText: this.pinText,
        prevPage: "report",
      };
    }

    this.destroyExtras = false;
    localStorage.setItem('reportDetailsExtras',JSON.stringify(extras));
    this.router.navigate(['pages/report-details']);
  }

  autocompleteTextChange(event: string) {

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer  = setTimeout(() => {
      if (event.length > 0) {
        this.scheduleService.searchProductionOrder(event).then(products => {
          this.poAutocompleteList = products;
          this.selectedProductionOrder = this.poAutocompleteList.find(product => product.productionOrder === event);
        });
      }
      this.debounceTimer = null;

    }, 400);
  }

  autocompleteSelectionChange(event) {
    this.selectedProductionOrder = event;
  }

  goToReport() {
    if (this.selectedProductionOrder.processCellPath.length === 1) {
      let extras;

      extras = {
        processCell: this.selectedProductionOrder.processCellPath[0],
        id: this.selectedProductionOrder.productionOrder,
        selectedProductCode: null,
        from: this.selectedProductionOrder.startedAt,
        to: this.selectedProductionOrder.stoppedAt,
        numberOfDaysString: null,
        numberOfDays: null,
        globalFrom: null,
        globalTo: null,
        selectedProcessCell: null,
        selectedPO: null,
        domain: true,
        pinText: this.pinText,
        prevPage: "report",
      };

      this.destroyExtras = false;
      localStorage.setItem('reportDetailsExtras',JSON.stringify(extras));
      this.router.navigate(['pages/report-details']);
    } else if (this.selectedProductionOrder.processCellPath.length > 1) {
      const obj = {
        processCellList: this.selectedProductionOrder.processCellPath,
      };
      this.dialogService.open(SelectProcessCellComponent, {
        context: obj as Partial<SelectProcessCellComponent>,
      }).onClose.subscribe({
        next: (closed: any) => {
          if (closed) {
            let extras;

            extras = {
              processCell: closed,
              id: this.selectedProductionOrder.productionOrder,
              selectedProductCode: null,
              from: this.selectedProductionOrder.startedAt,
              to: this.selectedProductionOrder.stoppedAt,
              numberOfDaysString: null,
              numberOfDays: null,
              globalFrom: null,
              globalTo: null,
              selectedProcessCell: null,
              selectedPO: null,
              domain: true,
              pinText: this.pinText,
              prevPage: "report",
            };

            this.destroyExtras = false;
            localStorage.setItem('reportDetailsExtras',JSON.stringify(extras));
            this.router.navigate(['pages/report-details']);
          }
        },
        error: (err: any) => {},
      });
    }
  }


  rangeChanged(event){
    this.numberOfDays = event.days;
    this.numberOfDaysString = event.text;
  }

  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    if (this.destroyExtras) {
      localStorage.removeItem('reportDetailsExtras');
    } else {
      this.destroyExtras = true;
    }
  }

  /**
   * LISTENERS
   */


  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.setHelpPage();
        if (this.updateDataReq) {
          this.toggleChanged(this.defaultValue);
          this.updateDataReq = false;
        }
        this.updateProcessCellsArray();
      }
    });
  }

}
