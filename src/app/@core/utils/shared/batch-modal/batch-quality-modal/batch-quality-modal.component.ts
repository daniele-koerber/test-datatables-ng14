import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { DataTableDirective } from 'angular-datatables';
import { ConfigurationData } from '../../../../data/configuration';
import { QualityData } from '../../../../data/quality';
import { ConfigService } from '../../../services';
import { Subject } from 'rxjs';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

import { TabDisabledInterface } from '../tabs.interface';
import { BatchQualityReportModalComponent } from './batch-quality-report-modal/batch-quality-report-modal.component';
import {TranslateService} from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-batch-quality-modal',
  styleUrls: ['./batch-quality-modal.component.scss'],
  templateUrl: './batch-quality-modal.component.html',
})

export class BatchQualityModalComponent implements OnInit, AfterViewInit, OnDestroy{

  @Input() batch: any;
  @Input() processCellPath: any;
  @Input() tabIndex: number;
  @Output() tabDisabled: EventEmitter<TabDisabledInterface> = new EventEmitter<TabDisabledInterface>();
  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  data: any[];

  productionOrder: any;
  from: any;
  to: any;
  compliantcy = [];
  lang
  isLoading = false;
  serverError = false;
  pcSub: Subscription;
  loadSub: Subscription;


  constructor(
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private qualityService: QualityData,
    private config: ConfigService,
    public translate: TranslateService,
  ) {

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.compliantcy = [
      { key: true, color: this.config.getColor('success')},
      { key: false, color: this.config.getColor('error')},
    ];
  }

  getValue(val) {
    return this.compliantcy.find(el => +el.key === +val).color;
  }

  ngOnInit() {
    //Disable tab during data loading
    const disabled: boolean = true;
    const tab: TabDisabledInterface = {
      index: this.tabIndex,
      disabled: disabled,
    };
    this.tabDisabled.emit(tab);
    this.from = this.batch.timeSeriesStart; 
    this.to = this.batch.timeSeriesEnd;
    this.productionOrder = this.batch;
    this.loadDataTableOptions();
    this.waitConfigurationServiceLoaded();
  }

  ngAfterViewInit(): void {
    // this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
    this.dtTrigger.unsubscribe();
  }

  openQualityReport(row, id) {
    const obj = { qualityCheck: this.data.find(el => el.id === id), row: row };
    if (obj.qualityCheck.formId !== undefined) {
      this.qualityService.getArchivedQualityForm(id).then(form => {
        obj.qualityCheck.form = form;
        this.dialogService.open(BatchQualityReportModalComponent, {
          context: obj as Partial<BatchQualityReportModalComponent>,
        }).onClose.subscribe({
          next: (closed: any) => {
            if (closed) {
              this.updateTable();
            }
          },
          error: (err: any) => {},
        });
      });
    }
  }


  updateTargetProcessCellData() {
    this.updateTable();
  }


  // #region DATATABLE METHODS

  updateTable() {
    this.serverError = false;
    if (this.from && this.to && this.processCellPath) {
      this.isLoading = true;
      this.qualityService.getQualityChecksTimeFiltered(this.processCellPath, this.from, this.to, true).then(report => {
        this.data = [...report];
        this.drawTable();
        //Disable tab if no data in the table
        const disabled: boolean = this.data.length <= 0;
        const tab: TabDisabledInterface = {
          index: this.tabIndex,
          disabled: disabled,
        };   
        this.tabDisabled.emit(tab);   
      })
      .catch(error => {
        this.isLoading = false;
        this.serverError = true;
        //Enable tab to display server error
        const tab: TabDisabledInterface = {
          index: this.tabIndex,
          disabled: false,
        };   
        this.tabDisabled.emit(tab);        
       });
    }

}

  drawTable() {
    if (this.datatableElement.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.dtTrigger.next();
    this.isLoading = false;
  }

  loadDataTableOptions() {
    const datatableTranslations = require(`../../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      // columnDefs: [
      //   { width: '25%', targets: 0 },
      //   { width: '25%', targets: 1 },
      //   { width: '25%', targets: 2 },
      //   { width: '25%', targets: 3 },
      //   { width: '5%', targets: 4 },
      // ],
      pagingType: 'full_numbers',
      //pageLength: 5,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
      // scrollY:        true,
      // scrollX:        false,
      // scrollCollapse: false,
      order: [1, 'desc'],
      columnDefs: [
        { targets: 1, type: 'date'  },
        { targets: [3,4], orderable: false }
      ],
      fixedHeader:  {
        header: true,
        footer: true
    }
    };
  }

  //#endregion

  //#region LISTENERS
  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
