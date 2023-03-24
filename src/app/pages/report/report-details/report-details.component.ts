import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IntegrationData } from '../../../@core/data/integration';
import { SchedulingData } from '../../../@core/data/scheduling';
import { ConfigService } from '../../../@core/utils/services/config.service';
import {TranslateService} from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

import { DownloadPdfConfirmComponent } from '../../../@core/utils/shared/download-pdf-confirm/download-pdf-confirm.component';
import { NbDialogService } from '@nebular/theme';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { ConfigurationData } from '../../../@core/data/configuration';
import { BaseClass } from '../../../@core/utils/common/base-class/base-class';
import { CalendarTimeSlotWOrderTime } from '../../../@core/utils/models/presentation/scheduling/calendar-time-slot-workorder-time';
import { ClientProducedDefectiveParts } from '../../../@core/utils/models/presentation/integration/client-produced-defective-parts';
import { Shift } from '../../../@core/utils/models/presentation/scheduling/shift';
import { MachineStatusInMinutes_BE } from '../../../@core/utils/models/backend/integration/machine-status-in-minutes';
import { MachineStatusInMinutes } from '../../../@core/utils/models/presentation/integration/machine-status-in-minutes';
import { machinesArrayElement, PrimaryType } from '../../../@core/utils/models/presentation/miscellanous/tabs';
import { MachineOEE } from '../../../@core/utils/models/backend/integration/machine-oee';
import { OEE } from '../../../@core/utils/models/presentation/integration/oee';
import { AlarmSummary } from '../../../@core/utils/models/presentation/integration/alarm-summary';
import { SmoothLineChartModel } from '../../../@core/utils/models/presentation/integration/smooth-line-chart-model';
import { AggregatedMachineHistoryResponse_FE, AlarmHeldOccurencies_FE, MachineParameterSpeed_FE, MachineSpeed_FE, ProgressiveMachineProductionCounter_FE } from '../../../@core/utils/models/presentation/integration/machine-history';

@Component({
  selector: 'ngx-report-details',
  styleUrls: ['./report-details.component.scss'],
  templateUrl: './report-details.component.html',
})

export class ReportDetailsComponent extends BaseClass implements OnInit, OnDestroy {

  processCellName: string;
  batch: CalendarTimeSlotWOrderTime;
  nextBatch: CalendarTimeSlotWOrderTime;
  prevBatch: CalendarTimeSlotWOrderTime;
  batchQuantity: ClientProducedDefectiveParts;
  isOrderReport: boolean;
  isShiftReport: boolean;

  shift: Shift;
  nextShift: Shift;
  prevShift: Shift;

  helpLinkPageOrder = 'report-details_order';
  helpLinkPageShift = 'report-details_shift';

  prevPage = "report";
  storageData: any;
  dateStart: string;
  dateEnd: string;
  UoM:string =''
  resetTabSel = 0

  donwloadInProgress = false;

  acutalOrderCard: any = {};
  actualShiftCard: any = {};
  ordersListCard: any = {};
  machineStatusInMinutes: MachineStatusInMinutes = {};
  machineStatusInMinutesFull: MachineStatusInMinutes = {};
  selectedMachinePath: string;
  tabMachinesArray: any[];
  orderMachineOEEServerError: boolean;
  orderMachineOEELoading: boolean;
  shiftMachineOEELoading: boolean;
  orderMachineOEE: MachineOEE;
  shiftMachineOEE: MachineOEE;
  shiftMachineOEEServerError: boolean;
  oeeCard: any = {};
  lineOEE: any = {};
  downtimeAlarmCard: any = {};
  tempDowntimeAlarmChartData: any = {};
  alarmSummaryCard: any = {};
  tempAlarmSummaryChartData: any = {};
  endLineSpeedCard: any = {};
  lineStatusCard: any = {};
  liveDataCard: any = {};
  machineStatusCard: any = {};
  machineSpeeds: Array<MachineSpeed_FE>;
  parameterSpeeds: Array<MachineParameterSpeed_FE>;
  productionCounter: Array<ProgressiveMachineProductionCounter_FE>;
  alarmOccurrences: Array<AlarmHeldOccurencies_FE>;
  componentDataMachineHistory: AggregatedMachineHistoryResponse_FE = {}

  liveDataName1:string;
  liveDataName2:string;


  hoursToDisplay: number = 12
  machineSpeedUoM: string = "";
  lineText: string = "Line";

  goFullScreenAndPrint = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private scheduleService: SchedulingData,
    private nbAuthService: NbAuthService,
    public translate: TranslateService,
    private dialogService: NbDialogService,
  ) {
    super(nbAuthService);

    this.translate.get(["REPORT.Line"]).subscribe((translations) => {
      this.lineText = translations["REPORT.Line"];
    });



  }
  ngOnInit(): void {
    const self = this;
    this.storageData = JSON.parse(localStorage.getItem('reportDetailsExtras'));

    this.checkFeatures();
    this.waitConfigurationServiceLoaded();
    this.setHelpPage();

    document.addEventListener("fullscreenchange", function () {
      self.onFullscreen();
    });
    document.addEventListener("webkitfullscreenchange", function () {
      self.onFullscreen();
    });
    document.addEventListener("mozfullscreenchange", function () {
      self.onFullscreen();
    });
  }

  ngOnDestroy() {
    document.removeEventListener("fullscreenchange", function () {});
    document.removeEventListener("webkitfullscreenchange", function () {});
    document.removeEventListener("mozfullscreenchange", function () {});
  }

  onFullscreen() {
    const self = this;
    if(self.goFullScreenAndPrint) {
      self.openPDF();
      self.goFullScreenAndPrint = false;
    }
  }

  changeBatch(isNext: boolean){
    this.resetTabSel++

    if(isNext) {
      this.storageData.id = this.nextBatch.productionOrder;
      this.storageData.from = this.nextBatch.timeSeriesStart;
      this.storageData.to = this.nextBatch.timeSeriesEnd;
    }
    else {
      this.storageData.id = this.prevBatch.productionOrder;
      this.storageData.from = this.prevBatch.timeSeriesStart;
      this.storageData.to = this.prevBatch.timeSeriesEnd;
    }

    localStorage.setItem('reportDetailsExtras',JSON.stringify(this.storageData));

    this.loadingComponents();
    this.updateComponent();
  }

  changeShift(isNext: boolean){
    this.resetTabSel++

    if(isNext){
      this.storageData.from = this.nextShift.shiftStartDatetime;
      this.storageData.to = this.nextShift.shiftEndDatetime;
    }else{
      this.storageData.from = this.prevShift.shiftStartDatetime;
      this.storageData.to = this.prevShift.shiftEndDatetime;
    }

    localStorage.setItem('reportDetailsExtras',JSON.stringify(this.storageData));

    this.loadingComponents();
    this.updateComponent();
  }

  updateComponent(){

    if (this.storageData) {
      this.prevPage = this.storageData.prevPage;
      this.processCellPath = this.storageData.processCell;
      this.processCellName = this.configurationService.getProcessCell(this.processCellPath)?.name;
      this.isOrderReport = this.storageData.domain === 'true' || this.storageData.domain === true;
      this.isShiftReport = this.storageData.domain === 'false' || this.storageData.domain === false;

      this.UoM = this.configurationService.getUoMByProcessCellPath(this.processCellPath);

      const [liveDataName1, liveDataName2]  = this.configurationService.getLiveDataByProcessCellPath(this.processCellPath);
      this.liveDataName1 = liveDataName1
      this.liveDataName2 = liveDataName2


      this.dateStart = this.storageData.from;
      this.dateEnd = this.storageData.to;
      const now = new Date()
      const endDate = new Date(this.dateEnd)
      if (endDate > now) {
        this.dateEnd = now.toISOString();
      }


    }

    this.selectedMachinePath = null;

    if(this.isOrderReport){
      this.getBatch();
    }
    else{
      this.getShift();
      this.getShiftBatches();
    }
    this.getOEE().then(() =>{ this.getMachineOEE(); })
    this.getMachinesStatusInMinutes();
    this.getAlarmSummaryData();
    this.getDowntimeAlarmsChartData();
    this.getSpeedAndSetPoints()
    this.getLiveDatas();


  }



/* View in fullscreen */
  public openFullscreen(elem): void {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }

  }


  public print(): void {
    const self = this;
    if (window.innerHeight == screen.height) {
      this.openPDF();
    }
    else {
      this.dialogService.open(DownloadPdfConfirmComponent)
        .onClose.subscribe({
          next: (goFullScreen: any) => {
            if (goFullScreen) {
              self.goFullScreenAndPrint = true;
              const elem = document.documentElement;
              this.openFullscreen(elem);
            }
            return;
          },
        });
    }
  }

  public openPDF(): void {
    this.donwloadInProgress = true;
    var fileName = this.acutalOrderCard?.batch.productionOrder + '_report-export.pdf'

    // $("html, body").scrollTop(0);
    // DATA.style.overflow = 'visible';

    window.setTimeout(() => {
      let DATA: HTMLElement = document.getElementById('exportArea');
      DATA.style.height = "";
      html2canvas(DATA).then((canvas) => {

        let pageHeight = 295;  
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;

        const FILEURI = canvas.toDataURL('image/png');
        // let PDF = new jsPDF('p', 'mm', 'a4');
        // let position = 0;
        // PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        // PDF.save('report-export.pdf');
        // this.donwloadInProgress = false;
        // const pdf = new jsPDF("p", "mm", "a4");
        // const imgProps = pdf.getImageProperties(FILEURI);
        // const pdfWidth = pdf.internal.pageSize.getWidth();
        // const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        // pdf.addImage(FILEURI, "JPEG", 0, 0, pdfWidth, pdfHeight);
        // pdf.save('report-export.pdf');

        const pdf = new jsPDF("p", "mm");
        var position = 0;
        var heightLeft = fileHeight;
        pdf.addImage(FILEURI, "JPEG", 0, position, fileWidth, fileHeight);

        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - fileHeight;
          pdf.addPage();
          pdf.addImage(FILEURI, 'JPEG', 0, position, fileWidth, fileHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(fileName);


        this.donwloadInProgress = false;
        
      });
    }, 100)


    // let fileWidth = 208;

    // var element = document.getElementById('exportArea');
    // var opt = {
    //     margin:       1,
    //     filename:     'report-export.pdf',
    //     image:        { type: 'png', quality: 0.98, width: fileWidth,  },
    //     html2canvas:  {  },
    //     jsPDF:        {  orientation: 'portrait' }
    // };
    // // New Promise-based usage:
    // html2pdf().from(element).set(opt).save();

  }

  setHelpPage() {
    const destination = this.config.getHelpPage(this.storageData?.id ? this.helpLinkPageOrder : this.helpLinkPageShift, this.config.getSelectedLanguage());
    this.config.setHelpPageLinkDestination(destination);
  }

  redirectToReport() {
    localStorage.setItem('fromReportDetailsExtras',JSON.stringify(this.storageData));
    if (this.prevPage === "calendar") {
      this.router.navigate(['pages/calendar']);
    } else if (this.prevPage === "overview") {
        this.router.navigate(['pages/overview']);
    } else {
      this.router.navigate(['pages/report']);
    }
  }


  getBatch(){
    this.scheduleService.getNearestBatches(this.processCellPath, this.storageData.id, true).then(nearestBatches => {
      this.batch = nearestBatches.requestedElement;
      this.nextBatch = nearestBatches.nextElement;
      this.prevBatch = nearestBatches.previousElement;
      this.acutalOrderCard.serverError = false;
      this.acutalOrderCard.isNextOrderEnable = this.nextBatch !== null;
      this.acutalOrderCard.isPrevOrderEnable = this.prevBatch !== null;

      this.acutalOrderCard.nextOrderPC = this.nextBatch ? this.configurationService.getProcessCell(this.nextBatch.processCellPath[0]).name : null;
      this.acutalOrderCard.prevOrderPC = this.prevBatch ? this.configurationService.getProcessCell(this.prevBatch.processCellPath[0]).name : null;
      this.integrationService.getTotalProducedAndDefectiveParts(this.processCellPath, this.dateStart, this.dateEnd).then(batchQuantity =>{
        this.batchQuantity = batchQuantity;

        this.acutalOrderCard.batch = this.batch;
        this.acutalOrderCard.batchQuantity = this.batchQuantity;
        this.acutalOrderCard.isLoading = false;
      })
      .catch(() =>{
        this.acutalOrderCard.serverError = true;
        this.acutalOrderCard.isLoading = false;
      });
    })
    .catch(() =>{
      this.acutalOrderCard.serverError = true;
      this.acutalOrderCard.isLoading = false;
    });
  }

  getShift(){
    this.scheduleService.getNearestShifts(this.processCellPath, this.dateStart, this.storageData.to, true).then((nearestShifts => {
      this.shift = nearestShifts.requestedElement;
      this.nextShift = nearestShifts.nextElement;
      this.prevShift = nearestShifts.previousElement;


      this.actualShiftCard.isNextShiftEnable = this.nextShift !== null;
      this.actualShiftCard.isPrevShiftEnable = this.prevShift !== null;

      // this.actualShiftCard.nextShiftPC = this.configurationService.getProcessCell(this.nextShift.processCellPath[0]).name;
      // this.actualShiftCard.prevShiftPC = this.configurationService.getProcessCell(this.prevShift.processCellPath[0]).name;

      this.integrationService.getTotalProducedAndDefectiveParts(this.processCellPath, this.dateStart, this.dateEnd).then(batchQuantity =>{
        this.actualShiftCard.shift = this.shift;
        this.actualShiftCard.shiftQuantities = batchQuantity;
        this.actualShiftCard.isLoading = false;
      })
      .catch(() =>{
        this.actualShiftCard.serverError = true;
        this.actualShiftCard.isLoading = false;
      });
    }))
    .catch(() =>{
      this.actualShiftCard.serverError = true;
      this.actualShiftCard.isLoading = false;
    });
  }

  getShiftBatches(){
    this.scheduleService.getBatchesWithinShift(this.processCellPath, this.dateStart, this.dateEnd).then(shiftBatches => {
      let batches = shiftBatches.batches;
      this.ordersListCard.ordersList = batches;
      batches.forEach(batch => {
        this.integrationService.getTotalProducedAndDefectiveParts(this.processCellPath, batch.timeSeriesStart, batch.timeSeriesEnd)
        .then(batchQuantity =>{
          batch.goodCount = (Math.round(batchQuantity.response.goodCount * 10.0) / 10.0);
          batch.rejectedCount = (Math.round(batchQuantity.response.rejectedCount * 10.0) / 10.0);
          batch.lostCount = (Math.round(batchQuantity.response.lostCount * 10.0) / 10.0);
          batch.defectiveCount = (Math.round(batchQuantity.response.rejectedCount + batchQuantity.response.lostCount * 10.0) / 10.0);
        });
      });

      this.ordersListCard.isLoading = false;
    });
  }


  getOEE(): Promise<any> {
      const promise = new Promise<any>(() => {
        if (this.processCellPath) {
          this.integrationService.getOEE(this.processCellPath, this.dateStart, this.dateEnd, this.isShiftReport).then((res: OEE) =>   {

            const oee = {
              ...res,
              dateStart: res.consideredTimeRange.startTimestamp,
              dateEnd: res.consideredTimeRange.endTimestamp,
              OEEPercentageRounded: Math.round(res.resultOverallPercentage * 100) / 100,
              availabilityPercentageRounded: Math.round(res.resultAvailabilityPercentage * 100) / 100,
              performancePercentageRounded: Math.round(res.resultPerformancePercentage * 100) / 100,
              qualityPercentageRounded: Math.round(res.resultQualityPercentage * 100) / 100,
            };

            this.lineOEE.oee = oee;
            this.lineOEE.isOrder = this.isOrderReport;
            this.lineOEE.isShift = this.isShiftReport,
            this.lineOEE.isLine = true,
            this.lineOEE.processCellPath = this.processCellPath;
            this.lineOEE.isLoading = false;
            this.lineOEE.noData = res || res?.uoM ? false : true;
            this.lineOEE.serverError = false;
            this.lineOEE.machinePath = null;

            if (!this.selectedMachinePath) {
              this.oeeCard =  { ...this.lineOEE };
            }

            this.getMachineOEE();
          }).catch(error => {
            this.lineOEE.serverError = true;
            this.lineOEE.isLoading = false;
            if (!this.selectedMachinePath) {
              this.oeeCard =  { ...this.lineOEE };
            }
          });
        }
      });
    return promise;

  }


  getMachineOEE() {

    if (this.processCellPath) {
        this.integrationService.getMachinesOEEData(this.processCellPath, this.dateStart, this.dateEnd, null,this.isShiftReport).then((res: MachineOEE) =>   {

        this.orderMachineOEE = res
        this.orderMachineOEEServerError = false;
        this.orderMachineOEELoading = false;

        this.copySelMachineOEEData()

        this.tabMachinesArray = [];

        res.response.map(el => {
          let oee = +el.oee.resultOverallPercentage.toFixed(0);
          this.tabMachinesArray.push({
            title: el.machineName,
            value: +el.oee.resultOverallPercentage.toFixed(0),
            path: el.machinePath,
            status: oee < 30 ? 'error' : ((oee >= 30 && oee < 70) ? 'warning' : (oee >= 70 && oee <= 100 ? 'success' : ''))
          })
        })


        const lineOEE = this.lineOEE.oee.OEEPercentageRounded
        this.tabMachinesArray.unshift({
                                        title: this.lineText,
                                        value: lineOEE,
                                        status: lineOEE < 30 ? 'error' : ((lineOEE >= 30 && lineOEE < 70) ? 'warning' : (lineOEE >= 70 && lineOEE <= 100 ? 'success' : '')),
                                        path: null});
      }).catch(error => {
        this.orderMachineOEEServerError = true;
        this.shiftMachineOEELoading = false;
      });
    }

  }

  copySelMachineOEEData() {
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
          this.oeeCard.isOrder = false;
          this.oeeCard.isShift = true,
          this.oeeCard.isLine = false,
          this.oeeCard.processCellPath = this.processCellPath;
          this.oeeCard.isLoading = this.shiftMachineOEELoading;
          this.oeeCard.noData = item.oee || item.oee?.uoM ? false : true;
          this.oeeCard.serverError = this.shiftMachineOEEServerError;
          this.oeeCard.machinePath = this.selectedMachinePath;
        }
      })
    } else {
      this.oeeCard =  { ...this.lineOEE };
    }

  }

  getMachinesStatusInMinutes(){
    this.integrationService.getMachineStatusInMinutes(this.processCellPath, this.dateStart, this.dateEnd, false).then((macStates) => {

      this.machineStatusInMinutes =  {
        ...macStates,
        isLoading: false,
        serverError: false,
      };

      this.integrationService.getMachineStatusInMinutes(this.processCellPath, this.dateStart, this.dateEnd, true).then((macStates) => {

        this.machineStatusInMinutesFull =  {
          ...macStates,
          isLoading: false,
          serverError: false,
        };
      }).catch(error => {
        this.machineStatusInMinutesFull.serverError = true;
        this.machineStatusInMinutesFull.isLoading = false;
      });

    }).catch(error => {
      this.machineStatusInMinutes.serverError = true;
      this.machineStatusInMinutes.isLoading = false;
    });
  }

  getAlarmSummaryData() {
    // this.componentDataAlarms.serverError = false;

    if (this.processCellPath) {
        this.integrationService.getAlarmsSummaryByProcessCellPath(this.processCellPath, true, this.dateStart, this.dateEnd).then((res: AlarmSummary) => {

          this.tempAlarmSummaryChartData = res.response;
          this.alarmSummaryCard.alarms = {
              ...res,
              chartData: this.tempAlarmSummaryChartData,
              dateStart: res.start,
              endDate: res.end,
              rowNumberToShow: 5,
              status: 'error',
          } ;

          this.filterAlarmSummaryByMachinePath()
          this.alarmSummaryCard.isLoading = false;
          this.alarmSummaryCard.serverError = false;

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
    this.alarmSummaryCard.noData = this.alarmSummaryCard.alarms.chartData && this.alarmSummaryCard.alarms.chartData?.length > 0 ? false : true;

  }


  //#region  DOWNTIME ALARMS
  getDowntimeAlarmsChartData() {

      if (this.processCellPath) {
        this.integrationService.getDowntimeAlarmsByProcessCellPath(this.processCellPath, this.dateStart, this.dateEnd).then((res: AlarmSummary) => {

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
          this.downtimeAlarmCard.isLoading = false,
          this.downtimeAlarmCard.serverError = false,

          this.addAlarmDescriptionToChart(this.downtimeAlarmCard.downtimes);
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
    this.downtimeAlarmCard.noData = this.downtimeAlarmCard.downtimes.chartData && this.downtimeAlarmCard.downtimes.chartData?.length > 0  ? false : true;

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

  getSpeedAndSetPoints(){

    this.integrationService.getSpeedAndSetPoints(this.processCellPath,this.dateStart, this.dateEnd, null).then((res)=>{
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

getLiveDatas(){

  this.integrationService.getMachinesLiveData(this.processCellPath, this.dateStart, this.dateEnd, null).then((res)=>{

    let tempChartData1 = [];
    let tempChartData2 = [];

    res.machinesLiveData.forEach(machineLiveData => {
      machineLiveData.liveData.forEach(data => {
        if(data.name === this.liveDataName1){
          this.liveDataCard.UoM1 = data.uom;
          this.liveDataCard.titleChart1 = data.description;
          tempChartData1 = data.values;
        }

        if(data.name === this.liveDataName2){
          this.liveDataCard.UoM2 = data.uom;
          this.liveDataCard.titleChart2 = data.description;
          tempChartData2= data.values;
        }
      });
    })

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
    this.liveDataCard.serverError = false;
    this.liveDataCard.noData = tempData1.length == 0 && tempData2.length == 0;
  }).catch(error => {
    this.liveDataCard.serverError = true;
    this.liveDataCard.isLoading = false;
  });
}

getMachineLiveDatas(){
  this.integrationService.getLiveData(this.selectedMachinePath, this.dateStart, this.dateEnd, null).then((res)=>{

    let tempChartData1 = [];
    let tempChartData2 = [];

    if (res.liveData.length >= 2) {
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

  getMachineFullHistory(){
    const pipe = new DatePipe(this.translate.currentLang);

    this.integrationService.getMachineFullHistory(this.selectedMachinePath, this.dateStart, this.dateEnd, null).then((res) => {
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

      this.alarmOccurrences = [];
      let alarmOccurrencesToProcess: Array<AlarmHeldOccurencies_FE> = [];
      res.machinesHistory.alarmsResponse.forEach(alarm => {
        alarm.occurrencesList.forEach(occurrence => {
          let occ: AlarmHeldOccurencies_FE = occurrence;
          occ.name = alarm.name;
          occ.machineName = alarm.machineName;
          occ.machinePath = alarm.machinePath;
          occ.dateTime = pipe.transform(new Date(occ.alarmStart), 'HH:mm')
          occ.speed = 0;
          occ.date = new Date(occ.alarmStart).getTime();
          alarmOccurrencesToProcess.push(occ);
        });
      });
      // this.alarmOccurrences = alarmOccurrencesToProcess
      this.alarmOccurrences = alarmOccurrencesToProcess.sort((firstItem, secondItem) => firstItem.date - secondItem.date);


      this.componentDataMachineHistory.serverError = false;
      this.componentDataMachineHistory.isLoading = false;
      this.componentDataMachineHistory.noData = this.productionCounter.length == 0 && this.parameterSpeeds.length == 0 && this.machineSpeeds.length == 0;

    }).catch(error => {
      this.componentDataMachineHistory.serverError = true;
      this.componentDataMachineHistory.isLoading = false;
    });
  }

getMachineStatusInMinutes(){
  this.integrationService.getStatusInMinutesByMachine(this.selectedMachinePath, this.dateStart, this.dateEnd, null).then((res: MachineStatusInMinutes_BE) =>{
    this.machineStatusCard.machineStatusInMinutes = res;
    this.machineStatusCard.isLoading= false;
    this.machineStatusCard.serverError = false;
  }).catch(error => {
    this.machineStatusCard.serverError= true;
    this.machineStatusCard.isLoading = false;
  });
}


  async onMachinesTabChanged(element: machinesArrayElement): Promise<machinesArrayElement> {
    this.selectedMachinePath = element.path;

    this.copySelMachineOEEData()
    this.filterDowntimeAlarmsByMachinePath();
    this.filterAlarmSummaryByMachinePath();

    this.liveDataCard.isLoading = true;
    if (this.selectedMachinePath) {
      this.componentDataMachineHistory.isLoading = true;
      this.machineStatusCard.isLoading = true;

      this.getMachineLiveDatas()
      this.getMachineFullHistory()
      this.getMachineStatusInMinutes();
    } else {
      this.getLiveDatas();
    }


    return
  }

  loadingComponents(){
    this.orderMachineOEELoading = true;

    this.acutalOrderCard.isLoading = true;
    this.actualShiftCard.isLoading = true;
    this.ordersListCard.isLoading = true;
    this.lineOEE.isLoading = true;
    this.oeeCard.isLoading = true;
    this.machineStatusInMinutes.isLoading = true;
    this.machineStatusInMinutesFull.isLoading = true;

    this.endLineSpeedCard.isLoading = true;
    this.liveDataCard.isLoading = true;
    this.alarmSummaryCard.isLoading = true,
    this.downtimeAlarmCard.isLoading = true;
  }

  waitConfigurationServiceLoaded() {
    this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.loadingComponents();
        this.updateComponent();
      }
    });
  }
}
