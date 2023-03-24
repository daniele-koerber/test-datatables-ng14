import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit, SimpleChanges, OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ConfigService, SignalRNotificationService } from '../../services';

@Component({
  selector: 'ngx-report-oee-details-table-teams-summary',
  templateUrl: './report-oee-details-table-teams-summary.html',
  styleUrls: ['./report-oee-details-table-teams-summary.scss']
})
export class ReportOEEDetailsTableTeamsSummary implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() reportScatterTeamsArr: [] = [];
  @Input() isLoading: boolean = false;

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  lang;

  firstLoad: boolean = true;

  tableHeight = 600;

  constructor(
    private config: ConfigService,
    private translate: TranslateService,
    private ref: ElementRef
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

  async drawTable() {
    if (this.datatableElement?.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.dtTrigger.next();
    this.isLoading = false;
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(this.reportScatterTeamsArr){
      this.drawTable();
    }
  }

  ngOnInit(): void {
    this.loadDataTableOptions();
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
    }
    return colorClass;
  }


  loadDataTableOptions() {
    const datatableTranslations = require(`../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
    };
    this.drawTable();
  }

}
