import { Component, Input, ElementRef, Output, EventEmitter, ViewChildren, QueryList, OnInit, SimpleChanges, OnChanges, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { ConfigService } from '../../services';
import { ReportOEEDetailsTableOrdersModel } from '../../models/presentation/miscellanous/report-oee-details-table-orders-model';


@Component({
  selector: 'ngx-report-oee-details-table-orders',
  templateUrl: './report-oee-details-table-orders.html',
  styleUrls: ['./report-oee-details-table-orders.scss']
})
export class ReportOEEDetailsTableOrders implements OnChanges, AfterViewInit, OnDestroy {

  @Input() data: Array<any> = [];
  @Input() isLoading = false;

  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();
  ordersData: ReportOEEDetailsTableOrdersModel[] = [];

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  lang;

  firstLoad: boolean = true;
  dtOptionLoaded = false;

  tableHeight = 600;
  tooltipText = ''

  constructor(
    private config: ConfigService,
    // private configurationService: ConfigurationData,
    // private scheduleService: SchedulingData,
    private translate: TranslateService,
    private ref: ElementRef,
    // private integrationService: IntegrationData,
    // private signalR: SignalRNotificationService,
    private router: Router
    ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const lang = config.getSelectedLanguage();
    translate.use(lang);
    this.lang = lang;

    this.translate.get("REPORT.At_least_one_quality_check_not_compliant").subscribe((translation) => {
      this.tooltipText = translation
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit(): void {

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.ordersData = []
    if (this.data && this.data.length > 0) {
      this.fetchData();
      this.loadDataTableOptions();
      setTimeout(() => {
        this.drawTable();
      }, 500);

      // this.drawTable();
    }
  }

  fetchData(){
    this.data.forEach(item =>{

      let machines = [];
      item.machinesOEEs.forEach(children=>{
        let machine = {
          name: children.machineName,
          isParent: false,
          hasNoCompliantQualityChecks: false,
          oee: children.oee.resultOverallPercentage,
          availability: children.oee.resultAvailabilityPercentage,
          performance: children.oee.resultPerformancePercentage,
          quality: children.oee.resultQualityPercentage,
          targetPieces: children.oee.orderTargetPieces,
          goodPieces: children.oee.goodPieces,
          defectivePieces: children.oee.lostPieces + children.oee.rejectedPieces,
          uom: children.oee.uoM,
          childrens: []
        } as ReportOEEDetailsTableOrdersModel;

        machines.push(machine);
      });

      let startTimeDateTime = new Date(item.startDate).toUTCString();
      let endTimeDateTime = new Date(item.endDate).toUTCString();

      let orderItem = {
        code: item.productCode,
        name: item.orderID,
        isParent: true,
        hasNoCompliantQualityChecks: item.hasNoCompliantQualityChecks,
        startTime: startTimeDateTime,
        endTime: endTimeDateTime,
        processCell: item.processCell,
        processCellPath: item.processCellPath,
        oee: item.batchOEE.resultOverallPercentage,
        availability: item.batchOEE.resultAvailabilityPercentage,
        performance: item.batchOEE.resultPerformancePercentage,
        quality: item.batchOEE.resultQualityPercentage,
        targetPieces: item.batchOEE.orderTargetPieces,
        goodPieces: item.batchOEE.goodPieces,
        defectivePieces: item.batchOEE.lostPieces + item.batchOEE.rejectedPieces,
        uom: item.batchOEE.uoM,
        childrens: machines
      } as ReportOEEDetailsTableOrdersModel;

      this.ordersData.push(orderItem);
    })
  }

  toggleRow(e: any) {
    var key = e.component.getKeyByRowIndex(e.rowIndex);
    var expanded = e.component.isRowExpanded(key);
    if (expanded) {
        e.component.collapseRow(key);
    }
    else {
        e.component.expandRow(key);
    }
  }

  drawTable() {
    if (this.datatableElement?.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.dtTrigger.next();
  }

  getValueColorClass(value: number): string {
    let colorClass = '';
    switch (true) {
      case (value >= 70) :
      colorClass = 'success';
      break;
      case (value >= 30 && value < 70) :
      colorClass = 'warning';
      break;
      case (value < 30) :
      colorClass = 'danger';
      break;
      default:
      colorClass = 'danger';
      break;
    }
    return colorClass;
  }

  openDetails(row) {
    this.rowClick.emit(row)
  }

  loadDataTableOptions() {
    if (this.dtOptionLoaded) {return}
    this.dtOptionLoaded = true;
    const datatableTranslations = require(`../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      stateSave: true,
      lengthChange: false,
      processing: true,
      paging: false,
      pagingType: 'full_numbers',
      pageLength: 10,
      info: true,
      searching: false, // Search Bar
      ordering: false,
    };
  }

  someClickHandler(info: any): void {
    console.log(info);
  }

}


