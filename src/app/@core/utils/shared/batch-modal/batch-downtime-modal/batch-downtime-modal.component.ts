import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ConfigurationData } from '../../../../data/configuration';
import { DowntimeData } from '../../../../data/downtime';
import { Subject } from 'rxjs';
import { IntegrationData } from '../../../../data/integration';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../../services/config.service';

//import { TimeSeriesDatabaseData } from '../../../../@core/data/timeSeriesDatabase';
import { TabDisabledInterface } from '../tabs.interface';
import 'datatables.net-fixedheader'
import { sort } from '@amcharts/amcharts4/.internal/core/utils/Iterator';
import { SortedListTemplate } from '@amcharts/amcharts4/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-batch-downtime-modal',
  styleUrls: ['./batch-downtime-modal.component.scss'],
  templateUrl: './batch-downtime-modal.component.html',
})

export class BatchDowntimeModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() batch: any;
  @Input() processCellPath: any;
  @Input() tabIndex: number;
  @Output() tabDisabled: EventEmitter<TabDisabledInterface> = new EventEmitter<TabDisabledInterface>();
  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  data: any[];

  status;
  estimatedDuration;
  productOrder;
  productCode;
  targetQuantity;
  productionOrder: any;
  lang;
  isLoading = false;
  serverError = false;
  pcSub: Subscription;
  loadSub: Subscription;

  constructor(
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private downtimeService: DowntimeData,
    public translate: TranslateService,
    private config: ConfigService,
  ) {
    this.data = [];

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
  }

  ngOnInit() {
  //Disable tab during data loading
    const disabled: boolean = true;
    const tab: TabDisabledInterface = {
      index: this.tabIndex,
      disabled: disabled,
    };
    this.tabDisabled.emit(tab);
    this.loadDataTableOptions();
    this.productionOrder = this.batch;





    this.waitConfigurationServiceLoaded();
  }
  ngAfterViewInit(): void {
   //  this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }


  updateTargetProcessCellData() {
    this.updateTable();
  }

  // #region DATATABLE METHODS

  updateTable() {

    this.serverError = false;
    if((this.batch) && (this.batch.timeSeriesStart) && (this.batch.timeSeriesEnd) ){
      this.isLoading = true;
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        this.integrationService.getDowntimes(this.processCellPath, this.batch.timeSeriesStart, this.batch.timeSeriesEnd, 0).then(downtimes => {
          this.data = downtimes.response;
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

  getNote(json){
    const el = JSON.parse(json);
    return el.Note;
  }

  getMachine(path){
    const machine = this.configurationService.getMachineByMachinePath(path);
    return (machine ? machine : '');
  }

  getMachineName(path){
    const machine = this.configurationService.getMachineByMachinePath(path);
    return (machine ? machine.name : '');
  }

  getComponent(path){
    const component = this.configurationService.getComponentByComponentPath(path);
    return (component ? component : '');
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
      language: datatableTranslations,
      // columnDefs: [
      //   { width: '20%', targets: 0 },
      //   { width: '10%', targets: 1 },
      //   { width: '10%', targets: 2 },
      //   { width: '15%', targets: 3 },
      //   { width: '15%', targets: 4 },
      //   { width: '15%', targets: 5 },
      //   { width: '15%', targets: 6 },
      // ],
      pagingType: 'full_numbers',
    //  pageLength: 5,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: false, // Search Bar
      //  scrollY:        "545px",
       scrollX:        false,
     scrollCollapse: true,
     order: [0, 'asc'],
     columnDefs: [
       { targets: 0, type: 'date'  },
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
    this.loadSub =this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }
}
