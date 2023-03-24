import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NbDialogService, NbToastrService, NbDialogRef} from '@nebular/theme';
import { SchedulingData } from '../../../@core/data/scheduling';
import { ConfigService } from '../../../@core/utils/services';
import { Subject } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { ConfigurationData } from '../../../@core/data/configuration';
import { DeleteModalConfirmComponent } from '../../../@core/utils/shared/delete-modal-confirm/delete-modal-confirm.component';
import { Subscription } from 'rxjs';
@Component({
  selector: 'ngx-orders-modal',
  styleUrls: ['./orders-modal.component.scss'],
  templateUrl: './orders-modal.component.html',
})

export class OrdersModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective, {static: false}) datatableElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};
  data: any = [];
  filteredData: any = [];

  helpLinkPage = 'orders-modal';
  helpPageLinkDestination = '#';

  canDeleteOrders = false;

  selectedProcessCell: any;
  defaultValue = null;
  toggleArray: any[];
  processCellsArray: any;
  isLoading
  lang;
  pcSub: Subscription;
  loadSub: Subscription;

  baseUM = '';
  plantHierarchy;

  constructor(
    private configurationService: ConfigurationData,
    private dialogService: NbDialogService,
    private scheduleService: SchedulingData,
    private config: ConfigService,
    private toastService: NbToastrService,
    public translate: TranslateService,
    private authService: NbAuthService,
    protected ref: NbDialogRef<OrdersModalComponent>,
  ) {
    this.config.translateOrderStatus();
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);

    this.toggleArray = [
      { key: null, value: 'All' },
      { key: 2, value: 'NotScheduled' },
      { key: 3, value: 'Scheduled' },
      { key: 4, value: 'Active' },
    ];

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

  ngOnInit() {
    this.loadDataTableOptions();
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();

    this.translate.get([...this.toggleArray.map(el => 'CALENDAR.' + el.value)]).subscribe((translations) => {
      for (const [index, [key, value]] of Object.entries(Object.entries(translations))) {
        this.toggleArray[index].value = value;
      }
    });


    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanDeleteOrders")) {
        this.canDeleteOrders = true;
      }
    });
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

  deleteOrder(productOrder) {
    const self = this;
    this.dialogService.open(DeleteModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.scheduleService.deleteOrder(productOrder)
          //   this.updateTable();
          // });
          .then(
            (success) => { // Success
              this.translate.get(["CALENDAR.SUCCESS", "CALENDAR.Order_deleted"]).subscribe((translations) => {
                self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Order_deleted"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
              });
              self.updateTargetProcessCellData();
            },
            (error) => { // Error
              this.translate.get(["CALENDAR.WARNING", "CALENDAR.Errors_deleting_the_order"]).subscribe((translations) => {
                self.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (translations.type !== undefined && translations.type === 'UserDismiss' ? translations.detail :  translations["CALENDAR.Errors_deleting_the_order"]), (error && error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
              });
              // this.ref.close();
            },
          );
        }
      },
      error: (err: any) => {},
    });
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.processCellsArray = this.configurationService.getProcessCellsArray();
    this.updateTable();
  }

  updateTable() {
    this.isLoading = true;
      this.scheduleService.getOrders().then(orders => {

        orders.map(order => {
          order.processCellNamesArray = [...order.processCellPaths.map(path => {
            return this.configurationService.getProcessCell(path).name;
          })]
          order.processCellNames = order.processCellNamesArray.join(', ');
        });
        this.data = [...orders];

        this.processCellsArray.forEach(cell => {
          this.data.filter(el => cell.path === el.processCellPath).forEach(order => {
            order.processCellName = cell.name;
          });
        });

        this.filteredData =
          this.defaultValue ?
          this.data.filter(el => +el.status === +this.defaultValue) : this.data;

        this.filteredData.map(el => {
          el.um = this.getUM(el.processCellPaths[0])
        })

        this.drawTable();
      });
  }

  getOrderStatus(val) {
    return this.config.getOrderStatus(val);
  }

  getUM(orderPc){
    const pcArray = [];
    if(orderPc){
      this.plantHierarchy[0].sites.map(site => {
        site.areas.map(area => {
          pcArray.push(area.processCells.find(pc => { return pc.fullPath === orderPc; }));
        })
      })
    }
    return (pcArray.length && pcArray[0] !== undefined ? pcArray[0].uoM : '');
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
    const datatableTranslations = require(`../../../../assets/i18n/dataTables/${this.lang}.json`);
    this.dtOptions = {
      errMode: 'none',
      language: datatableTranslations,
      // columnDefs: [
      //   { width: '20%', targets: 0 },
      //   { width: '10%', targets: 1 },
      //   { width: '10%', targets: 2 },
      //   { width: '20%', targets: 3 },
      //   { width: '10%', targets: 4 },
      //   { width: '20%', targets: 5 },
      // ],
      pagingType: 'full_numbers',
     // pageLength: 10,
      lengthChange: false,
      processing: true,
      paging: false,
      info: false,
      searching: true, // Search Bar
      order: [3, 'desc'],
      columnDefs: [
        { targets: 3, type: 'date'  },
        { targets: [6], orderable: false }
      ],
      // scrollY:        true,
      // scrollX:        false,
      // scrollCollapse: false,
     fixedHeader:  {
         header: true,
         footer: true
     }

    };
  }

  showFiltered(value: any) {
    this.defaultValue = value;

    this.filteredData = (JSON.parse(value) !== null ? this.data.filter(el => el.status === JSON.parse(value) && JSON.parse) : this.data);
    this.drawTable();
  }

  getOrderStatusColor(val) {
    return this.config.getOrderStatusColor(val);
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
    this.loadSub =  this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.plantHierarchy = this.configurationService.getPlantHierarchy();
        this.updateTargetProcessCellData();
      }
    });
  }

}
