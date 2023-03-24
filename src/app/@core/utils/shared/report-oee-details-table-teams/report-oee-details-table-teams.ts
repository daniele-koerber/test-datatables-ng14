import { Component, Input, ElementRef, Output, EventEmitter, ViewChildren, QueryList, OnInit, SimpleChanges, OnChanges, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService, SignalRNotificationService } from '../../services';
import { ReportOEEDetailsTableTeamsModel } from '../../models/presentation/miscellanous/report-oee-details-table-teams-model';

@Component({
  selector: 'ngx-report-oee-details-table-teams',
  templateUrl: './report-oee-details-table-teams.html',
  styleUrls: ['./report-oee-details-table-teams.scss']
})
export class ReportOEEDetailsTableTeams implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() data: Array<any> = [];
  @Input() isLoading: boolean = false;
  @Input() toggleValue: any = true;
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  shiftsData: ReportOEEDetailsTableTeamsModel[] = [];
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  lang;
  dtOptionLoaded = false;

  firstLoad: boolean = true;

  tableHeight = 600;

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
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.firstLoad) {
      this.firstLoad = false;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.loadDataTableOptions();

    this.shiftsData = [];
    if(this.data && this.data?.length > 0){
      this.fetchData();
    }

    this.loadDataTableOptions();
    setTimeout(() => {
      this.drawTable();
    }, 500);
  }

  ngOnInit(): void {
    // this.loadDataTableOptions();
  }

  fetchData(){
    this.data.forEach(item =>{

      let machines = [];
      item.machinesOEEs.forEach(children=>{
        let machine = {
          name: children.machineName,
          isParent: false,
          hasNoCompliantQualityChecks: false,
          color: null,
          oee: children.oee.resultOverallPercentage,
          availability: children.oee.resultAvailabilityPercentage,
          performance: children.oee.resultPerformancePercentage,
          quality: children.oee.resultQualityPercentage,
          targetPieces: children.oee.orderTargetPieces,
          goodPieces: children.oee.goodPieces,
          defectivePieces: children.oee.lostPieces + children.oee.rejectedPieces,
          uom: children.oee.uoM,
          childrens: []
        } as ReportOEEDetailsTableTeamsModel;

        machines.push(machine);
      });

      let shiftItem = {
        name: item.teamName,
        isParent: true,
        hasNoCompliantQualityChecks: item.hasNoCompliantQualityChecks,
        color: item.teamColor,
        startTime: item.startDate,
        endTime: item.endDate,
        processCell: item.processCell,
        processCellPath: item.processCellPath,
        oee: item.shiftOEE.resultOverallPercentage,
        availability: item.shiftOEE.resultAvailabilityPercentage,
        performance: item.shiftOEE.resultPerformancePercentage,
        quality: item.shiftOEE.resultQualityPercentage,
        targetPieces: item.shiftOEE.orderTargetPieces,
        goodPieces: item.shiftOEE.goodPieces,
        defectivePieces: item.shiftOEE.lostPieces + item.shiftOEE.rejectedPieces,
        uom: item.shiftOEE.uoM,
        childrens: machines
      } as ReportOEEDetailsTableTeamsModel;

      this.shiftsData.push(shiftItem);
    })
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
    console.log(row);
    this.rowClick.emit(row)
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

  loadDataTableOptions() {
    if (this.dtOptionLoaded) {return}
    this.dtOptionLoaded = true;
    const datatableTranslations = require(`../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      lengthChange: false,
      processing: true,
      paging: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      info: true,
      searching: false, // Search Bar
    };

    this.drawTable();

  }

}
