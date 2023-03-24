import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { ActivatedRoute } from '@angular/router';

import { ConfigurationData } from '../../../../data/configuration';
import { ParametersData } from '../../../../data/parameters';
import { SchedulingData } from '../../../../data/scheduling';
import { BatchStatus, ConfigService } from '../../../../../@core/utils/services/config.service';
import { SaveModalConfirmComponent } from '../../save-modal-confirm/save-modal-confirm.component';
import { DeleteModalConfirmComponent } from '../../delete-modal-confirm/delete-modal-confirm.component';
import { TabDisabledInterface } from '../tabs.interface';
import { IntegrationData } from '../../../../data/integration';
import {TranslateService} from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { AdjustOrderPiecesModalComponent } from '../../adjust-order-pieces/adjust-order-pieces-modal.component';
import { EditOrderTargetPiecesModalComponent } from '../../edit-order-target-pieces/edit-order-target-pieces-modal.component';

@Component({
  selector: 'ngx-batch-details-modal',
  styleUrls: ['./batch-details-modal.component.scss'],
  templateUrl: './batch-details-modal.component.html',
})

export class BatchDetailsModalComponent implements OnInit, OnChanges {

  @Input() batch: any;
  @Input() tabIndex: number;
  @Output() tabDisabled: EventEmitter<TabDisabledInterface> = new EventEmitter<TabDisabledInterface>();

  controlRecipe;
  canPlanOrder = false;
  toggleArray: any[] = [ {key: 0, value: 'From ERP'}, {key: 1, value: 'From Scratch'}];
  isFromERP: boolean = true;
  lang = null;
  hideErpOrders = true;

  uomPC

  batchStatus = BatchStatus;
  status: any;
  statusEng: any;
  estimatedDuration: String;
  productOrder: String;
  scratchProductCode = '';
  productCode = '';
  productDescription = '';
  targetQuantity: String;
  actualQuantity: String;
  parametersModified;
  translated_text_with_changes;

  goodCount: number = 0;
  rejectedCount: number = 0;
  lostCount: number = 0;
  defectiveCount: number = 0;


  uom: String  = '';

  productionOrder: any;
  scratchProductionOrder = '';

  productCodeFormControl = new FormControl('');
  quantityFormControl = new FormControl('');
  selectedProcessCell: any;
  selectedProcessCellPath: any;
  processCellPath;
  pipe = new DatePipe('en-US');
  startDateTime: Date = null;
  endDateTime: Date = null;
  selectedProductionOrder: any = null;
  startDateTimeUCT: string;
  endDateTimeUCT: string;
  version = 0;
  canAdjustPieces = false;
  canViewReportPage = false;
  canEditTargetQuantity = false;
  duration: string;
  isLoading = false;

  constructor(private scheduleService: SchedulingData,
              private configurationService: ConfigurationData,
              private parametersService: ParametersData,
              private config: ConfigService,
              private dialogService: NbDialogService,
              protected ref: NbDialogRef<BatchDetailsModalComponent>,
              private router: Router,
              //private timeSeriesDatabaseService: TimeSeriesDatabaseData,
              private integrationService: IntegrationData,
              private toastService: NbToastrService,
              public translate: TranslateService,
              private authService: NbAuthService,
              private route: ActivatedRoute,

  ) {
    this.isLoading = true;

    this.config.translateBatchStatus();
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    this.lang = browserLang;
    let pc
    const extras = JSON.parse(localStorage.getItem('reportDetailsExtras'));
    if (extras && (this.router.url !== '/pages/calendar' && this.router.url !== '/pages/overview')) {
      pc = extras.processCell;
    }
    if(this.selectedProcessCell === undefined) {
      this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    }
    this.processCellPath = (pc ? pc : this.selectedProcessCell.path);

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();

      if (payload.features.includes("CanPlanOrder")) {
        this.canPlanOrder = true;
      }
      if (payload.features.includes("CanEditTargetQuantity")) {
        this.canEditTargetQuantity = true;
      }
      if (payload.features.includes("CanAdjustPieces")) {
        this.canAdjustPieces = true;
      }
      const reportDetailsExtras = JSON.parse(localStorage.getItem("reportDetailsExtras"));
      if (payload.features.includes("CanViewReportPage") &&
      (this.router.url !== '/pages/report-details' || reportDetailsExtras.domain === false )
      )  {
        this.canViewReportPage = true;
      }
    });

    this.translate.get("CALENDAR.with_changes").subscribe((translation) => {
      this.translated_text_with_changes = translation;
    });
  }

  getMachinesName(array) {
    const res = [];
    array.map(el => {
      res.push(this.configurationService.getMachineNameByMachinePath(el));
    });
    return res.toString();
  }

  ngOnChanges(changes: SimpleChanges) {

    const unit = this.configurationService.getUnitByProcessCellPath(this.processCellPath);
    this.parametersService.getControlRecipe(unit, this.batch.productionOrder).then((controlRecipe) => {
      this.controlRecipe = controlRecipe;
    });

    this.version = this.batch.version;
    this.productOrder = this.batch.productionOrder;
    this.productCode = this.batch.productCode;
    this.productDescription = this.batch.productDescription;
    this.targetQuantity = this.batch.targetQuantity;
    this.uom = this.batch.uom;
    this.parametersModified = this.batch.parametersModified

    this.duration = this.batch.currentDurationTicks
    this.estimatedDuration = this.batch.estimatedDurationTicks;

    this.status = this.config.getBatchStatus(this.batch.status);
    this.statusEng  = this.config.getNotTranslatedBatchStatus(this.batch.status);

    this.startDateTime = new Date(this.batch.batchExpectedStart);
    this.endDateTime = new Date(this.batch.batchExpectedEnd);

    if ((this.batch.goodCount || this.batch.goodCount == 0) && (this.batch.rejectedCount || this.batch.rejectedCount == 0)  && (this.batch.lostCount || this.batch.lostCount == 0)) {
      this.goodCount = Math.round((this.batch.goodCount + Number.EPSILON) * 10) / 10;
      this.rejectedCount = Math.round((this.batch.rejectedCount + Number.EPSILON) * 10) / 10;
      this.lostCount = Math.round((this.batch.lostCount + Number.EPSILON) * 10) / 10;
      this.defectiveCount = Math.round((this.rejectedCount + this.lostCount + Number.EPSILON) * 10) / 10;

      this.isLoading = false;

    } else {
      this.goodCount = 0;
      this.rejectedCount = 0;
      this.lostCount = 0;
      this.defectiveCount = 0;
      if (this.statusEng !== 'Planned' && this.statusEng !== 'Delayed') {
        this.getActualQuantity();
      } else {
        this.isLoading = false;
      }
    }

  }

  ngOnInit() {
    const disabled: boolean = false;
    const tab: TabDisabledInterface = {
      index: this.tabIndex,
      disabled: disabled,
    };
    this.tabDisabled.emit(tab);
  }


  deleteOrder(productOrder) {
    const self = this;
    this.dialogService.open(DeleteModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.scheduleService.unplanOrder(this.processCellPath, productOrder)
          .then(
            (success) => { // Success
              this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Order_deleted"]).subscribe((translations) => {
                self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Order_deleted"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
              });
              self.ref.close(true);
            },
            (error) => { // Error
              this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_deleting_the_order"]).subscribe((translations) => {
                self.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_deleting_the_order"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
              });
              // this.ref.close();
            },
          );

        }
      },
      error: (err: any) => {},
    });
  }


  editTargetQuantity(){
    const obj = {
      actualTargetQuantity: this.targetQuantity,
      uom: this.uom,
      orderId: this.productOrder,
    };
    this.dialogService.open(EditOrderTargetPiecesModalComponent, {
      context: obj as unknown as Partial<EditOrderTargetPiecesModalComponent>,
    })
    .onClose.subscribe({
      next: (newTargertQty: any) => {
        if (newTargertQty) {
          this.updateTargetQuantity(newTargertQty)        
        }
      },
      error: (err: any) => {},
    });
  }

  updateTargetQuantity(value){
    this.targetQuantity = value;
  }


  adjustQuantity(){
    const obj = {
      goodCount: this.goodCount,
      rejectedCount: this.rejectedCount,
      uom: this.uom,
      processCellPath: this.processCellPath,
    };
    this.dialogService.open(AdjustOrderPiecesModalComponent, {
      context: obj as Partial<AdjustOrderPiecesModalComponent>,
    })
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.getActualQuantity();
        }
      },
      error: (err: any) => {},
    });
  }



  getActualQuantity() {
    if(this.batch) {
      this.integrationService.getTotalProducedAndDefectiveParts(this.processCellPath, this.batch?.timeSeriesStart, this.batch?.batchExpectedEnd).then(batchActualQuantity =>   {

        if (batchActualQuantity ){
          this.goodCount = Math.round((batchActualQuantity.response.goodCount + Number.EPSILON) * 10) / 10;
          this.rejectedCount = Math.round((batchActualQuantity.response.rejectedCount + Number.EPSILON) * 10) / 10;
          this.lostCount = Math.round((batchActualQuantity.response.lostCount + Number.EPSILON) * 10) / 10;
          this.defectiveCount = Math.round((this.rejectedCount + this.lostCount + Number.EPSILON) * 10) / 10;
        }
        this.isLoading = false;
      }).catch(error => {
        this.goodCount = 0;
        this.rejectedCount = 0;
        this.lostCount = 0;
        this.defectiveCount = 0;
        this.isLoading = false;
      });
    }
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }


  gotoReport(orderId) {
    const now = new Date()
    const start = new Date(this.batch?.startDate === undefined ? this.batch?.batchExpectedStart : this.batch?.startDate)
    const end = new Date(this.batch?.endDate === undefined ? this.batch?.batchExpectedEnd : this.batch?.endDate)


    const extras = {
      processCell: this.processCellPath,
      id: orderId,
      domain: true, // Order or Team
      prevPage: this.router.url == '/pages/calendar' ? "calendar" : "overview",
      from: this.batch?.startDate === undefined ? this.batch?.batchExpectedStart : this.batch?.startDate,
      to: end > now ? now.toISOString() : this.batch?.endDate === undefined ? this.batch?.batchExpectedEnd : this.batch?.endDate
    };
    localStorage.setItem('reportDetailsExtras',JSON.stringify(extras));
    this.router.navigateByUrl('pages/report-details', { skipLocationChange: false });
    if(this.router.url === '/pages/report-details') {
      window.location.reload();
    }
    this.ref.close();
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
  secondsToHm(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + "h " : "";
    var mDisplay = m > 0 ? m + "min" : "";
    var sDisplay = s > 0 ? s + "s" : "";
    return hDisplay + mDisplay ;
  }
  getStatusColor(val) {
    return this.config.getBatchStatusColor(val);
  }

  isBatchActive(batchStatus: BatchStatus): boolean {
    return this.config.isBatchActive(batchStatus);
  }

  isBatchCompleted(batchStatus: BatchStatus): boolean {
    return this.config.isBatchCompleted(batchStatus);
  }

  getBatchStatus(batchStatus: BatchStatus): boolean {
    return this.config.getBatchStatus(batchStatus);
  }

}
