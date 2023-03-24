import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

import { SchedulingData } from '../../../@core/data/scheduling';
import { ConfigurationData } from '../../../@core/data/configuration';
import { ParametersData } from '../../../@core/data/parameters';
import { ConfigService } from '../../../@core/utils/services';
import { SaveModalConfirmComponent } from '../../../@core/utils/shared/save-modal-confirm/save-modal-confirm.component';
import { IntegrationData } from '../../../@core/data/integration';
import {TranslateService} from '@ngx-translate/core';

import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-plan-order-modal',
  styleUrls: ['./plan-order-modal.component.scss'],
  templateUrl: './plan-order-modal.component.html',
})

export class PlanOrderModalComponent implements OnInit, OnChanges {

  @Input() batch: any;

  batchParameters = [];
  canPlanOrder = false;
  productionOrderList: any[];
  productCodeList: any[];
  toggleArray: any[];
  isFromERP: boolean = true;
  toggleDefaultValue = 1;
  lang = null;

  uomPC

  status: any;
  scratchProductCode: any = '';
  productCode = '';
  targetQuantity: String;
  parametersModified;
  translated_text_with_changes;

  oldValueStartDateTime
  oldValueEndDateTime


  pcSub: Subscription;
  loadSub: Subscription;

  uom: String  = '';

  productionOrder: any;
  scratchProductionOrder = '';

  productCodeFormControl = new FormControl('');
  quantityFormControl = new FormControl('');
  selectedProcessCell: any;
  selectedProcessCellPath: any;
  pipe = new DatePipe('en-US');
  startDateTime: Date = null;
  endDateTime: Date = null;
  selectedProductionOrder: any = null;

  helpLinkPage = 'plan-order-modal';
  helpPageLinkDestination = '#';

  start; end;

  enableCalculationFromStart: boolean = true;
  isLoading = false;
  isSaving = false;
  isGeneratingPO = false;

  hideErpOrders = true;

  constructor(private scheduleService: SchedulingData,
              private configurationService: ConfigurationData,
              private parametersService: ParametersData,
              private config: ConfigService,
              private dialogService: NbDialogService,
              protected ref: NbDialogRef<PlanOrderModalComponent>,
              private router: Router,
              //private timeSeriesDatabaseService: TimeSeriesDatabaseData,
              private integrationService: IntegrationData,
              private toastService: NbToastrService,
              public translate: TranslateService,
              private authService: NbAuthService,

  ) {

    this.config.translateBatchStatus();
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    this.lang = browserLang;

    this.setHelpPage();

    this.toggleArray = [
      { key: 0, value: 'from_ERP' },
      { key: 1, value: 'from_scratch' },
    ];
    this.translate.get([...this.toggleArray.map(el => 'COMMON.' + el.value)]).subscribe((translations) => {
      for (const [index, [key, value]] of Object.entries(Object.entries(translations))) {
        this.toggleArray[index].value = value;
      }
    });


    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanPlanOrder")) {
        this.canPlanOrder = true;
      }
    });

    this.translate.get("CALENDAR.with_changes").subscribe((translation) => {
      this.translated_text_with_changes = translation;
    });
  }

  ngOnChanges(changes: SimpleChanges) {

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

closeModal() {
  this.ref.close(true);
}

  ngOnInit() {
    this.isSaving = false;
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();

  }

  productionOrderChange(productionOrder: any) {
    this.selectedProductionOrder = productionOrder;
    this.productionOrder = productionOrder.productionOrder;
    this.productCode = productionOrder.productCode;
    this.targetQuantity = productionOrder.quantity;
    this.parametersModified = productionOrder.parametersModified;
    this.uom = productionOrder.uom;
    this.getCustomParameters();

  }

  toggleChange() {
    this.isFromERP = !this.isFromERP;
    this.selectedProductionOrder = null
    this.scratchProductionOrder = '';
    this.productCode = null;
    this.scratchProductCode = null;
    this.targetQuantity = '';
    this.startDateTime = null;
    this.endDateTime = null;
    this.parametersModified = false;

    this.productionOrderList = [];
    this.productCodeList = [];
    this.updateTargetProcessCellData();

  }

  emitChangeF(){
    this.calculateTime();
  }

  productCodeChange(productCode: any){
    this.productCode = productCode.productCode;
    this.getCustomParameters();
  }
  getCustomParameters() {
    if(this.isFromERP === false) {
      this.productCode = this.scratchProductCode.productCode;
    }
    this.batchParameters = [];
    this.parametersService.getBatchParameters(this.productCode, this.selectedProcessCellPath).then(res => {
      this.batchParameters = [...res];
      // if (this.batchParameters.length === 0) {
        this.calculateTime();
      // }
    })
  }

  generateNewPO(){
    this.isGeneratingPO = true;
    this.scheduleService.generateProductionOrder().then(res => {
      this.scratchProductionOrder = res.batchName;
      this.isGeneratingPO = false;
    })
    .catch(error => {
      this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
        this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
      });
      this.isGeneratingPO = false;
    })

  }

  calculateTime() {
    const self = this;
    if (this.productCode && (this.productCode || this.scratchProductionOrder) && this.targetQuantity) {
      this.isLoading = true;
      this.scheduleService.availableTimeSlot(this.selectedProcessCellPath, this.productCode, this.targetQuantity, this.batchParameters).then(res => {
        this.startDateTime = res.scheduledStartTime;
        this.endDateTime = res.scheduledEndTime;
        this.oldValueStartDateTime = this.startDateTime;
        this.oldValueEndDateTime = this.endDateTime;

        this.isLoading = false;
      }).catch(err => {
        this.startDateTime = null;
            this.endDateTime = null;

            // window.setTimeout(() => {
            //   this.startDateTime = this.oldValueStartDateTime;
            //   this.endDateTime = this.oldValueEndDateTime;
            // })
        this.isLoading = false;



        this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_saving_the_order"]).subscribe((translations) => {
          self.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], err.error.detail, true);
        });
      })
    }
  }


  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  getOrderList() {
      this.scheduleService.getOrdersList(this.selectedProcessCellPath).then(orders => {
      this.productionOrderList = [...orders.sort((a,b) => a.productionOrder > b.productionOrder ? 1 : (a.productionOrder < b.productionOrder ? -1 : 0))];
    });
  }
  getProductCodeList() {
    this.parametersService.getProducts(this.selectedProcessCellPath).then(products => {
      this.productCodeList = [...products.sort((a,b) => a.productCode > b.productCode ? 1 : (a.productCode < b.productCode ? -1 : 0))];

    });
  }

  validateTimeSlotFromERP(date, isStartDate) {
    const arr = date.target.value.split(/[- :T/]/); // split any of "- :T/"
    const d = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], 0);
    const dateToValidate = d.toISOString();

    if (date) {
      if (isStartDate) {
        this.isLoading = true;
        this.scheduleService.validateTimeSlot(this.selectedProcessCellPath, this.productionOrder, null, +this.targetQuantity, dateToValidate, null, this.batchParameters)
        .then((result) => {
          if (result.scheduledStartTime !== null && result.scheduledEndTime !== null) {
            this.startDateTime = new Date(result.scheduledStartTime);
            this.start = this.startDateTime;
            this.endDateTime = new Date(result.scheduledEndTime);
            this.end = this.endDateTime;
            this.oldValueStartDateTime = this.startDateTime;
            this.oldValueEndDateTime = this.endDateTime;
            this.isLoading = false;
          }
        })
        .catch(error => {


          this.startDateTime = null;
          this.endDateTime = null;

          window.setTimeout(() => {
            this.startDateTime = this.oldValueStartDateTime;
            this.endDateTime = this.oldValueEndDateTime;
          })

          this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
          });
          this.isLoading = false;
        })
      } else {
        this.isLoading = true;
        this.scheduleService.validateTimeSlot(this.selectedProcessCellPath, this.productionOrder, null, +this.targetQuantity, null, dateToValidate, this.batchParameters)
        .then((result) => {
          this.isLoading = false;
          if (result.scheduledStartTime !== null && result.scheduledEndTime !== null) {
            this.startDateTime = new Date(result.scheduledStartTime);
            this.start = this.startDateTime;
            this.endDateTime = new Date(result.scheduledEndTime);
            this.end = this.endDateTime;

            this.oldValueStartDateTime = this.startDateTime;
            this.oldValueEndDateTime = this.endDateTime;



          }
        })
        .catch(error => {
          this.isLoading = false;



          this.startDateTime = null;
          this.endDateTime = null;

          window.setTimeout(() => {
            this.startDateTime = this.oldValueStartDateTime;
            this.endDateTime = this.oldValueEndDateTime;
          })

          this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
          });
        })
      }

    }
  }

  validateTimeSlotFromScratch(date,isStartDate) {
    if (date && date?.target?.value) {
      const arr = date.target.value.split(/[- :T/]/); // split any of "- :T/"
      // const darr = arr[0].split("/");
      // const d = new Date(darr[0], darr[1]-1, darr[2], arr[1], arr[2], 0);
      const d = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], 0);
      const dateToValidate = d.toISOString();
      const oldDate = dateToValidate;

      this.productCode = this.scratchProductCode.productCode

      if (isStartDate) {
        this.isLoading = true;
        this.scheduleService.validateTimeSlot(this.selectedProcessCellPath, '', this.productCode, +this.targetQuantity, dateToValidate, null, this.batchParameters).then((result) => {
          if (result.scheduledStartTime !== null && result.scheduledEndTime !== null) {
            this.startDateTime = new Date(result.scheduledStartTime);
            this.endDateTime = new Date(result.scheduledEndTime);

            this.oldValueStartDateTime = this.startDateTime;
            this.oldValueEndDateTime = this.endDateTime;



          }
          this.isLoading = false;
        })
        .catch(error => {
          this.isLoading = false;
          this.startDateTime = null;
          this.endDateTime = null;

          window.setTimeout(() => {
            this.startDateTime = this.oldValueStartDateTime;
            this.endDateTime = this.oldValueEndDateTime;
          })

          this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
          });
        })
      } else {
        this.isLoading = true;
        this.scheduleService.validateTimeSlot(this.selectedProcessCellPath, '', this.productCode, +this.targetQuantity, null, dateToValidate, this.batchParameters).then((result) => {
          if (result.scheduledStartTime !== null && result.scheduledEndTime !== null) {
            this.isLoading = false;
            this.startDateTime = new Date(result.scheduledStartTime);
            this.endDateTime = new Date(result.scheduledEndTime);
            this.oldValueStartDateTime = this.startDateTime;
            this.oldValueEndDateTime = this.endDateTime;


          }
        })
        .catch(error => {
          this.isLoading = false;
          this.startDateTime = null;
            this.endDateTime = null;

            window.setTimeout(() => {
              this.startDateTime = this.oldValueStartDateTime;
              this.endDateTime = this.oldValueEndDateTime;
            })


          this.translate.get(["CALENDAR.WARNING","PRODUCT_DEFINITION.System_Error_Occurred"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["PRODUCT_DEFINITION.System_Error_Occurred"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
          });
        })
      }
    } else {
      this.startDateTime = null;
      this.endDateTime = null;



    }
  }

  saveOrder() {
    const self = this;
    const obj = {
      isPlanConfirmation: true,
    };
    const ref = this.dialogService.open(SaveModalConfirmComponent, {
      context: obj as Partial<SaveModalConfirmComponent>,
    });
    ref.onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.isSaving = true;
          if(this.isFromERP) {
            this.scheduleService.planPOFromERP( this.batchParameters,
                                                this.selectedProcessCellPath,
                                                this.productionOrder,
                                                this.productCode,
                                                new Date(this.startDateTime).toISOString(),
                                                new Date(this.endDateTime).toISOString())
            .then(
              (success) => { // Success
                this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Order_planned"]).subscribe((translations) => {
                  self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Order_planned"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
                });
                this.isSaving = false;
                self.ref.close(true);
              },
              (error) => { // Error
                this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_saving_the_order"]).subscribe((translations) => {
                  self.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_saving_the_order"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
                });
                this.isSaving = false;
              },
            );

          } else {
            // processCellPath, productionOrder, productCode, targetQuantity, scheduledStartTime, scheduledEndTime
            this.scheduleService.planPOFromScratch( this.batchParameters, this.selectedProcessCellPath,
                                                    this.scratchProductionOrder,
                                                    this.scratchProductCode.productCode,
                                                    +this.targetQuantity,
                                                    new Date(this.startDateTime).toISOString(),
                                                    new Date(this.endDateTime).toISOString())
            .then(
              (success) => { // Success
                this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Order_planned"]).subscribe((translations) => {
                  self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Order_planned"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
                });
                this.isSaving = false;
                self.ref.close(true);
              },
              (error) => { // Error
                this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_saving_the_order"]).subscribe((translations) => {
                  self.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_saving_the_order"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
                });
                this.isSaving = false;
              },
            );
          }
        }
      },
      error: (err: any) => {
        this.ref.close();
        this.translate.get(["CALENDAR.WARNING","COMMON.Errors_saving_the_order"]).subscribe((translations) => {
          self.showToast('top-right', 'danger', (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? err.error.detail :  translations["CALENDAR.WARNING"]), translations["CALENDAR.Errors_saving_the_order"], (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? true : false));
        });
},
    });
  }

  ticksTohours(data: number) {
    const hh = (Math.round((data / 10_000_000) * 10) / 10) / 60 / 60;
    let mm;
    if(+hh.toString().split('.')[1]) {
      mm = (Math.round((+hh.toString().split('.')[1].substring(0, 2) * 60) / 100));
    } else {
      mm = 0;
    }

    const MM =  mm > 9 ? '' + mm : '0' + mm;
    return   hh.toString().split('.')[0] + ':' + MM;
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.selectedProcessCellPath = this.selectedProcessCell.path;

    this.uomPC = this.selectedProcessCell.uom;

    this.getOrderList();
    this.getProductCodeList();
  }

  ngOnDestroy(): void {
    // Clean up chart when the component is removed
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
   }

   //#region LISTENERS

  listenForSelectedProcessCellChanges() {
    this.pcSub =this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.hideErpOrders = !this.configurationService.getCustomSettings().ERP_orders_enabled;
        this.toggleDefaultValue =  this.hideErpOrders ? 1 : 0;
        if(this.hideErpOrders) { this.isFromERP = false; }
        this.updateTargetProcessCellData();
      }
    });
  }

 //#endregion LISTENERS


}
