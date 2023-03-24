import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { DataTableDirective } from 'angular-datatables';
import { QualityData } from '../../../../@core/data/quality';
import { Subject } from 'rxjs';
import { NbDialogRef } from '@nebular/theme';

import { ConfigurationData } from '../../../../@core/data/configuration';
import { CorrectiveActionsComponent } from './corrective-actions/corrective-actions.component';
import { ConfigService } from '../../../../@core/utils/services/config.service';
import {TranslateService} from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-quality-report-table-modal',
  styleUrls: ['./quality-report-table-modal.component.scss'],
  templateUrl: './quality-report-table-modal.component.html',
})

export class QualityReportTableModalComponent  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  @Input() from: any;
  @Input() to: any;
  @Input() processCellPath: any;

  helpLinkPage = 'quality-report-table-modal';
  helpPageLinkDestination = '#';

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  data: any = [];
  defaultValue = false;

  toggleArray: any[] = [];
  selectedProcessCell: any;
  selectedProcessCellPath: any;
  report: any[] = [];
  rewinderHeaders: any[] = [];
  packingHeaders: any[]  = [];
  reportType: number= 0;
  headers: any[] =[];
  numberOfRowsInsideModal: number = 100;
  fieldGroupHeaders: any[];
  lang;
  isDtInitialized:boolean = false;
  isLoading = false;
  serverError = false;
  loadSub: Subscription;

  constructor(
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private qualityService: QualityData,
    private config: ConfigService,
    public translate: TranslateService,
    private route: ActivatedRoute,
    protected ref: NbDialogRef<QualityReportTableModalComponent>,
  ) {
    this.numberOfRowsInsideModal = this.config.getNumberOfRowsInsideModal();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    const extras = JSON.parse(localStorage.getItem('reportDetailsExtras'));
    if (extras) {
      this.selectedProcessCellPath = (extras.processCell ? extras.processCell : this.selectedProcessCellPath);
    }


  }

  ngOnInit() {

    // this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
    this.loadDataTableOptions(0);
    this.setHelpPage();
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngAfterViewInit(): void {
    //this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }

  async updateTargetProcessCellData() {
    // this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    // this.selectedProcessCellPath = this.selectedProcessCell.path;
    await this.getReport();
    this.updateTable();



  }

  closeModal() {
    this.ref.close(true);
  }

  getReport(){
    this.isLoading = true;
    this.qualityService.getQualityCheckReport(this.selectedProcessCellPath, this.from, this.to).then(report => {

      this.report = report;

      this.toggleArray = [];

      this.report.forEach(reportTab => {
        this.toggleArray.push({
          key    : this.report.indexOf(reportTab),
          value  : reportTab.formName,
        });
      });

      this.report.forEach(tab => {
        tab.table = JSON.parse(tab.formStructure);
        tab.checks.forEach(check => {
          const formVal = JSON.parse(check.formValues)
          //Remove corrective actions & notes from array
          const filtForm = formVal.values.filter(value => !value.key.includes('correctiveActions') && !value.key.includes('text'));
          //Add field type to array
          for (var item = 0; item < filtForm.length; item++) {
            filtForm[item]["type"] = formVal.structure[0].fieldGroup[0].fieldGroup[item].type
          }
          check.table = filtForm
          //Create corrective action array
          check.correctiveActions = formVal.values.filter(value => (value.key.includes('correctiveActions')) || value.key.includes('text'));
        });



        // tab.checks[0].map((val, index) => tab.checks.map(row => row[index]).reverse())
      });

      this.report.forEach(tab => {

        this.fieldGroupHeaders = [];
        tab.table[0].fieldGroup[0].fieldGroup.forEach(fieldGroup => {
          this.fieldGroupHeaders.push(fieldGroup.templateOptions.label !== undefined ?
                                      fieldGroup.templateOptions.label + (fieldGroup.templateOptions.um  ? ' (' + fieldGroup.templateOptions.um + ')' : '') :
                                      fieldGroup.templateOptions.name);
        });

        this.headers.push(this.fieldGroupHeaders);

        tab.checks.unshift({
          occurredDateTimeUtc: 'OVERVIEW.Occurred_Date_Time',
          acknowledgeDateTimeUtc: 'OVERVIEW.Acknowledge_date_time',
          table: this.fieldGroupHeaders.map(el => { return { title: el }}),
        });
        tab.transposedChecks = this.transpose(tab.checks);

      });
      console.log("FIGA",this.report)

      // this.report.forEach((tab, index) => {
      //   tab.checks.unshift({
      //     occurredDateTimeUtc: 'OVERVIEW.Occurred_Date_Time',
      //     acknowledgeDateTimeUtc: 'OVERVIEW.Acknowledge_date_time',
      //     table: this.headers[reportType].map(el => { return { title: el }}),
      //   });
      //   tab.transposedChecks = this.transpose(tab.checks);

      // });

      this.isLoading = false;
    })
    .catch(() =>{
      this.isLoading = false;
      this.serverError = false;
    });
  }

  transpose(matrix) {
    const reducedMatrix = matrix.map(el => [el.occurredDateTimeUtc, el.acknowledgeDateTimeUtc, ...el.table]);
    const m = reducedMatrix.reduce((prev, next) => next.map((item, i) =>
      (prev[i] || []).concat(next[i])
    ), []);
    return m;
  }

  toggleChange(value: any) {
    this.defaultValue = value;
    this.reportType = value;
    //this.loadDataTableOptions(value);
    this.updateTable();

  }

  updateTable() {
    //this.isLoading = true;
      this.drawTable();

  }

  drawTable() {
    if (this.isDtInitialized)
    {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    }
    else
    {
      this.isDtInitialized = true;
      this.dtTrigger.next();
    }
  }

  loadDataTableOptions(index) {
    const datatableTranslations = require(`../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      // columnDefs: [
      //   this.headers[index]?.map(function(el, elIndex) { return {width: '212px', targets: elIndex}; })
      // ],
      // fixedHeader: true,

      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
      scrollY:        "500px",
      scrollX:        true,
      scrollCollapse: false,

    };
  }


  openCorrectiveActions(check) {

    const obj = {
      occurredDateTimeUtc : check.occurredDateTimeUtc,
      acknowledgeDateTimeUtc : check.acknowledgeDateTimeUtc,
      correctiveActions: check.correctiveActions,
    };

    this.dialogService.open(CorrectiveActionsComponent, {
      context: obj as Partial<CorrectiveActionsComponent>,
    });
  }

  /**
   * LISTENERS
   */



  waitConfigurationServiceLoaded() {
    this.loadSub =  this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
