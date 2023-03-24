import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { QualityCheckListComponent } from './quality-check-list/quality-check-list.component';
import { QualityCheckFormModalComponent } from './quality-check-modal-form/quality-check-modal-form.component';
import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../../@core/data/configuration';
import { QualityData } from '../../../../@core/data/quality';
import { ConfigService } from '../../../../@core/utils/services';

@Component({
  selector: 'ngx-quality-check-modal',
  styleUrls: ['./quality-check-modal.component.scss'],
  templateUrl: './quality-check-modal.component.html',
})

export class QualityCheckModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  dtColumnDefs = [];
  data: any = [];
  filteredData: any = [];
  @Input() initialData: any;

  disableAddNew = true;

  selectedProcessCell: any;
  defaultValue = false;
  toggleArray: any[];
  allowedToOpen = false;

  columnTranslations;
  columnTitle;

  serverNotificationstopic: string = 'ApiGateway';
  lang;
  isLoading;
  loadSub: Subscription;

  helpLinkPage = 'quality-check-modal';
  helpPageLinkDestination = '#';
  compliantcy = [];

  constructor(
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private qualityService: QualityData,
    public translate: TranslateService,
    private config: ConfigService,
    protected ref: NbDialogRef<QualityCheckModalComponent>,
    private authService: NbAuthService
  ) {

    this.compliantcy = [
      { key: true, color: this.config.getColor('success')},
      { key: false, color: this.config.getColor('error')},
    ];

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.toggleArray = [
      { key: false, value: 'Not_done' },
      { key: true, value: 'Done' },
    ];
    this.translate.get([...this.toggleArray.map(el => 'COMMON.' + el.value)]).subscribe((translations) => {
      for (const [index, [key, value]] of Object.entries(Object.entries(translations))) {
        this.toggleArray[index].value = value;
      }
    });

    this.translate.get(["OVERVIEW.Occurred_Date_Time", "OVERVIEW.Done_Date_Time"]).subscribe((translations) => {
      this.columnTranslations =  Object.entries(translations);
      this.columnTitle = this.columnTranslations[Number(this.defaultValue)][1];
    });
  }

  getValue(val) {
    return this.compliantcy.find(el => +el.key === +val).color;
  }

  ngOnInit() {
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
    //this.dtTrigger.next();
  }

  openHelp () { 
    window.open(this.helpPageLinkDestination, "_blank");
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.updateTable();
  }

  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  DowntimesCountChanged(message) {
    this.updateTargetProcessCellData();
  }

  async updateTable(refresh: boolean = false) {
    const self = this;

    this.selectedProcessCell = await this.configurationService.getSelectedProcessCell();
    if (this.selectedProcessCell !== undefined) {
      this.qualityService.getGenerableQualityForms(this.selectedProcessCell.path).then(res => {
        self.disableAddNew = (res.length == 0)
      })
    }


    this.configurationService.canBypassDisplayGroup().then(canBypass=>{
      this.isLoading = true;
      if (canBypass) {
        if (this.selectedProcessCell !== undefined) {
          const showAll = false;
          this.qualityService.getQualityChecksByProcessCellPath(this.selectedProcessCell.path, showAll).then(qualityCheks => {
            this.data = [...qualityCheks];
            this.filteredData = this.data.filter(el => el.isDone === this.defaultValue);
            if(this.filteredData.length === 0 && refresh === true) {
              this.dtTrigger.unsubscribe();
              this.ref.close();
            }
            this.drawTable();
          });
        }
      } else {
        const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
        this.qualityService.getQualityChecksByDisplayGroupId(fIlteredDisplayGroup).then(qualityCheks => {
          this.data = [...qualityCheks];
          this.filteredData = this.data.filter(el => el.isDone === this.defaultValue);
          if(this.filteredData.length === 0 && refresh === true) {

          }
          this.drawTable();
        });
      }
    });
  }

  initializeTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.filteredData = [...this.initialData];
    this.drawTable();
  }


  drawTable() {
    if (this.datatableElement.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy()
      });
    }
    this.isLoading = false;
    this.dtTrigger.next();


  }




  loadDataTableOptions() {
    const datatableTranslations = require(`../../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      autoWidth: true,
      searching: true, // Search Bar
      order: [2, 'desc'],
      columnDefs: [
        { targets: 2, type: 'date',  },
        { targets: 4, orderable: false,    },
        { targets: 5, orderable: false,    },
      ],

      fixedHeader:  {
        header: true,
        footer: true
    }

    };

      // columnDefs: [
      //   { width: '25%', targets: 0 },
      //   { width: '25%', targets: 1 },
      //   { width: '25%', targets: 2 },
      //   { width: '20%', targets: 3 },
      //   { width: '5%', targets: 4 },
      // ],

    // this.dtColumnDefs = [
    //   DTColumnDefBuilder.newColumnDef([3,4,5,11]).withOption('type', 'date')
    // ]

  }

  async showFiltered(value: any) {
    this.filteredData = this.data.filter(el => el.isDone === (value == 'true'));
    this.defaultValue = (value == 'true' ? true : false);
    this.columnTitle = this.columnTranslations[Number(this.defaultValue)][1];
    this.drawTable();
  }

  openDialog(row, id) {
    if(row.isDone === true) {
      const obj = { qualityCheck: this.data.find(el => el.id === id), row: row };
      if (obj.qualityCheck.formId !== undefined) {
        this.qualityService.getFormStructureAndValues(obj.qualityCheck.id).then(structure => {
          obj.qualityCheck.form = structure;
          this.dialogService.open(QualityCheckFormModalComponent, {
            context: obj as Partial<QualityCheckFormModalComponent>,
          }).onClose.subscribe({
            next: (closed: any) => {
              if (closed) {
                const refresh = true;
                this.updateTable(refresh);
              }
            },
            error: (err: any) => {},
          });
        });
      }
    } else {
      const obj = { qualityCheck: this.data.find(el => el.id === id), row: row };
      if (obj.qualityCheck.formId !== undefined) {
        this.qualityService.getFormStructure(this.selectedProcessCell.path, row.productionOrderId, obj.qualityCheck.formId).then(structure => {
          obj.qualityCheck.form = structure;
          this.dialogService.open(QualityCheckFormModalComponent, {
            context: obj as Partial<QualityCheckFormModalComponent>,
          }).onClose.subscribe({
            next: (closed: any) => {
              if (closed) {
                const refresh = true;
                this.updateTable(refresh);
              }
            },
            error: (err: any) => {},
          });
        });
      }
    }
  }

  closeModal() {
    this.ref.close(true);
  }


  addNew() {
    this.translate.get("COMMON.Add_new_product_definition").subscribe((Add_new_product_definition) => {
      const obj = { id: null, title: Add_new_product_definition, definitions: this.data };
      this.dialogService.open(QualityCheckListComponent, {
        context: obj as Partial<QualityCheckListComponent>,
      }).onClose.subscribe({
        next: (qf: any) => {
          if (qf) {
            // this.parametersService.duplicateProductDefinitionById(obj, definition).then(
            //   (definition) => {
            //     this.editProductDefinition(definition.id);
            //   }, error => {
            //     this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
            //       this.showToast('top-right', 'danger', translations["CALENDAR.SUCCESS"], translations["PRODUCT_DEFINITION.System_Error_Occurred"]);
            //     });
            //     this.updateTable();
            //   }
            // );
          }
          this.updateTargetProcessCellData();
        },
        error: (err: any) => {
        },
      });
    });
  }


  /**
   * LISTENERS
   */

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
        this.setHelpPage();
      }
    });
  }

}
