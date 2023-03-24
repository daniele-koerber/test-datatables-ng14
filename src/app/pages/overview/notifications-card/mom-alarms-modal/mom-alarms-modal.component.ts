import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogRef} from '@nebular/theme';
import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../../@core/data/configuration';
import { IntegrationData } from '../../../../@core/data/integration';
import { ConfigService } from '../../../../@core/utils/services';

@Component({
  selector: 'ngx-mom-alarms-modal',
  styleUrls: ['./mom-alarms-modal.component.scss'],
  templateUrl: './mom-alarms-modal.component.html',
})

export class MomAlarmsModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  @Input() initialData: any;

  data: any = [];
  isLoading: boolean;

  selectedProcessCell: any;
  defaultValue = false;
  numberOfRowsInsideModal: number = 100;
  lang
  pcSub: Subscription;
  loadSub: Subscription;

  helpLinkPage = 'mom-alarms-modal';
  helpPageLinkDestination = '#';

  //serverNotificationstopic: string = 'Downtime';

  constructor(
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private config: ConfigService,
    public translate: TranslateService,
    protected ref: NbDialogRef<MomAlarmsModalComponent>,

  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.numberOfRowsInsideModal = this.config.getNumberOfRowsInsideModal();
  }

  ngOnInit() {
    this.loadDataTableOptions();
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
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

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() {  
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  getComponentTopic() {
    //return this.serverNotificationstopic;
  }

  // DowntimesCountChanged(message) {
  //   this.updateTargetProcessCellData();
  // }

  initializeTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.data = [...this.initialData];
    this.drawTable();
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.updateTable();
  }

  updateTable() {
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        this.isLoading = true;
        if (canBypass) {
          if (this.selectedProcessCell !== undefined) {
            this.integrationService.getMomAlarmsNotificationsByProcessCellPath(this.selectedProcessCell.path).then(alarm => {
              this.data = [...alarm];
              this.drawTable();
            });
          }
        } else {
          const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
          this.integrationService.getMomAlarmsNotificationsByDisplayGroupId(fIlteredDisplayGroup).then(alarms => {
            this.data = [...alarms];
            this.drawTable();
          });
        }
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
      // columnDefs: [
      //   { width: '30%', targets: 0 },
      //   { width: '70%', targets: 1 },
      // ],
      stateSave: true,
      pagingType: 'full_numbers',
      pageLength: this.numberOfRowsInsideModal,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: true, // Search Bar

    };

  }

  closeModal() {
    this.ref.close(true);
  }


  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if (selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.setHelpPage();
        this.updateTargetProcessCellData();
      }
    });
  }
}
