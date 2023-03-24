import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { DowntimeAcknowledgeModalFormComponent } from './downtime-acknowledge-modal-form/downtime-acknowledge-modal-form.component';
import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../../@core/data/configuration';
import { DowntimeData } from '../../../../@core/data/downtime';
import { ConfigService } from '../../../../@core/utils/services';

@Component({
  selector: 'ngx-downtime-acknowledge-modal',
  styleUrls: ['./downtime-acknowledge-modal.component.scss'],
  templateUrl: './downtime-acknowledge-modal.component.html',
})

export class DowntimeAcknowledgeModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  data: any = [];
  filteredData: any = [];
  @Input() initialData: any;

  selectedProcessCell: any;
  defaultValue = false;
  toggleArray: any[];
  numberOfRowsInsideModal: number = 100;
  pcSub: Subscription;
  loadSub: Subscription;

  serverNotificationstopic: string = 'ApiGateway';
  lang
  isLoading
  allowedToOpen = false;

  helpLinkPage = 'downtime-acknowledge-modal';
  helpPageLinkDestination = '#';

  constructor(
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private downtimeService: DowntimeData,
    private config: ConfigService,
    public translate: TranslateService,
    protected ref: NbDialogRef<DowntimeAcknowledgeModalComponent>,
    private authService: NbAuthService
  ) {

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.toggleArray = [
      { key: false, value: 'Not_justified' },
      { key: true, value: 'Justified' },
    ];
    this.translate.get([...this.toggleArray.map(el => 'COMMON.' + el.value)]).subscribe((translations) => {
      for (const [index, [key, value]] of Object.entries(Object.entries(translations))) {
        this.toggleArray[index].value = value;
      }
    });
    this.numberOfRowsInsideModal = this.config.getNumberOfRowsInsideModal();
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  // displayTime(ticks) {
  //   var date = new Date(ticks).toISOString(); // gives e.g. 2015-10-06T16:34:23.062Z
  //   var time = date.substring(11,19);
  //   return time;
  // }

  displayTime(ticks) {
    ticks = Math.floor(ticks/ 10000);
    const hh = Math.floor(ticks / 3600);
    const mm = Math.floor((ticks % 3600) / 60);
    const ss = ticks % 60;
    return( this.pad(hh, 2) + ":" + this.pad(mm, 2) + ":" + this.pad(ss, 2) );
  }

  pad(n, width) {
    const m = n + '';
    return m.length >= width ? m : new Array(width - m.length + 1).join('0') + m;
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngOnInit() {
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
    this.loadDataTableOptions();

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();

      if (payload.features.includes("CanJustifyDowntime")) {
        this.allowedToOpen = true;
      }
    });
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

  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  DowntimesCountChanged(message) {
    this.updateTargetProcessCellData();
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.updateTable();
  }

  updateTable(refresh: boolean = false) {
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        this.isLoading = true;
        if (canBypass) {
          if (this.selectedProcessCell !== undefined) {
            this.downtimeService.getDowntimesByProcessCellPath(this.selectedProcessCell.path).then(downtimes => {
              this.data = [...downtimes];
              this.data.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))

              this.filteredData = this.data.filter(el => el.isJustified === this.defaultValue);

              if(this.filteredData.length === 0 && refresh === true && this.defaultValue === false) {
                this.dtTrigger.unsubscribe();
                this.ref.close();
              } else {
                this.drawTable();
              }
            });
          }
        } else {
          const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
          this.downtimeService.getDowntimesByDisplayGroupId(fIlteredDisplayGroup).then(downtimes => {
            this.data = [...downtimes];
            this.data.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))
            this.filteredData = this.data.filter(el => el.isJustified === this.defaultValue);

            if(this.filteredData.length === 0 && refresh === true && this.defaultValue === false) {
              this.dtTrigger.unsubscribe();
              this.ref.close();
            } else {
              this.drawTable();
            }
        });
        }
      });

  }

  initializeTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.filteredData = [...this.initialData];
    this.drawTable();
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

  loadDataTableOptions() {
    const datatableTranslations = require(`../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      stateSave: true,
      pagingType: 'full_numbers',
      pageLength: this.numberOfRowsInsideModal,
      paging: false,
      info: false,
      searching: true, // Search Bar
      lengthChange: false,
      processing: true,
      autoWidth: true,
      order: [2, 'desc'],
      columnDefs: [
        { targets: 2, type: 'date'  },
        { targets: 3, orderable: false },
        { targets: 4, orderable: false }
      ],
    };
  }

  async showFiltered(value: any) {
    // await this.updateTargetProcessCellData()
    this.defaultValue = value;
    this.filteredData = this.data.filter(el => el.isJustified === JSON.parse(value));
    this.drawTable();
  }

  checkVisibility(val, defaultValue){
    return JSON.parse(defaultValue) === val;
  }

  openDialog(row) {
    const obj = { downtime: this.data.find(el => el.id === row.id), row: row };
    this.dialogService.open(DowntimeAcknowledgeModalFormComponent, {
      context: obj as Partial<DowntimeAcknowledgeModalFormComponent>,
    }).onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          const refresh = true;
          if (this.defaultValue == false) {
            this.updateTable(refresh);
          }
        }
      },
      error: (err: any) => {},
    });
  }

  closeModal() {
    this.ref.close(true);
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
        this.setHelpPage();
        this.updateTargetProcessCellData();
      }
    });
  }

}
