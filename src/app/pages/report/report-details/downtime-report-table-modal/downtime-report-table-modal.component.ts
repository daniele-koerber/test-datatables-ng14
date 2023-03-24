import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { IntegrationData } from '../../../../@core/data/integration';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';

//import { TimeSeriesDatabaseData } from '../../../../../@core/data/timeSeriesDatabase';
import { ConfigService } from '../../../../@core/utils/services/config.service';
import { ConfigurationData } from '../../../../@core/data/configuration';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'ngx-downtime-report-table-modal',
  styleUrls: ['./downtime-report-table-modal.component.scss'],
  templateUrl: './downtime-report-table-modal.component.html',
})

export class DowntimeReportTableModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  data: any = [];
  lang
  isLoading
  pcSub: Subscription;
  loadSub: Subscription;

  @Input() from: any;
  @Input() to: any;
  @Input() processCellPath: any;

  selectedProcessCell: any;

  helpLinkPage = 'downtime-report-table-modal';
  helpPageLinkDestination = '#';

  constructor(
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    public translate: TranslateService,
    private config: ConfigService,
    protected ref: NbDialogRef<DowntimeReportTableModalComponent>,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
}

  ngOnInit() {
    this.loadDataTableOptions();
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
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
    // this.dtTrigger.next();
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

  closeModal() {
    this.ref.close(true);
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.updateTable();
  }


  updateTable() {
    this.integrationService.getDowntimes(this.processCellPath, this.from, this.to, this.selectedProcessCell.areaSettings.numberOfHoursDisplayedOnOverview).then(downtimes => {
      this.isLoading = true;
      const data = [];
      if(downtimes){
        const downtimesArr = downtimes.response;
        downtimesArr.map(downtime => {
          data.push({
            dateTime : downtime.startTime,
            duration : downtime.duration,
            user : downtime.userName,
            machine : downtime.machineName,
            component : downtime.componentName,
            reson : downtime.reasonName,
            note : downtime.note,
          });
        });
      }
      this.data = data;
      this.drawTable();
    });
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
    const datatableTranslations = require(`../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      columnDefs: [
        { width: '16%', targets: 0 },
        { width: '10%', targets: 1 },
        { width: '10%', targets: 2 },
        { width: '10%', targets: 3 },
        { width: '12%', targets: 4 },
        { width: '12%', targets: 5 },
        { width: '30%', targets: 6 },
        { targets: 0, type: 'date'  },
      ],
      order: [0, 'asc'],
      pagingType: 'full_numbers',
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      scrollX:        false,
      // scrollY:        true,
      scrollY:        "500px",
      scrollCollapse: true,

      // fixedHeader:  {
      //   header: true,
      //   footer: true
      // }
    };
  }



  /**
   * LISTENERS
   */

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
