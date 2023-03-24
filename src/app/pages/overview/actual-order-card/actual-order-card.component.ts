import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ConfigService, BatchStatus } from '../../../@core/utils/services/config.service';
import { Router } from '@angular/router';
import { NextOrdersModalComponent } from '../../../@core/utils/shared/next-orders-modal/next-orders-modal.component';
import { NbDialogService } from '@nebular/theme';
import { BatchModalComponent } from '../../../@core/utils/shared/batch-modal/batch-modal.component';
import { BaseClass, IBaseClass } from '../../../@core/utils/common/base-class/base-class';
import { BatchClient } from '../../../@core/utils/models/presentation/scheduling/batch-client';
import { ClientProducedDefectiveParts } from '../../../@core/utils/models/presentation/integration/client-produced-defective-parts';
import { NbAuthService } from '@nebular/auth';

export interface ActualOrderCardComponentModel extends IBaseClass{
  totalGoodPieces?: number,
  totalDefectivePieces?: number,
  batch?: BatchClient,
  piecesQty?: ClientProducedDefectiveParts
  performancePercentage?: number
  oeePercentage?: number,
  isStartEnable?: boolean,
  isStopEnable?: boolean,
  isPauseEnable?: boolean,
  status?: string,
}

@Component({
  selector: 'ngx-actual-order-card',
  styleUrls: ['./actual-order-card.component.scss'],
  templateUrl: './actual-order-card.component.html',
})

export class ActualOrderCardComponent extends BaseClass implements ActualOrderCardComponentModel {

  @Input() batch: BatchClient;
  @Input() piecesQty: ClientProducedDefectiveParts;

  @Input() performancePercentage: number = 0;
  @Input() oeePercentage: number = 0;
  @Input() isStartEnable: boolean = false;
  @Input() isStopEnable: boolean = false;
  @Input() isPauseEnable: boolean = false;
  @Input() status: string;

  @Output() startProductionClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() stopProductionClick: EventEmitter<void> = new EventEmitter<void>();

  @Output() pauseProductionClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() resumeProductionClick: EventEmitter<void> = new EventEmitter<void>();


  batches: any[] = [];
  hierarchy: any;
  id: number;
  updateStatus = 0;
  team: any;
  totalGoodPieces = 0;
  totalDefectivePieces = 0;

  periodicRepeat;
  refresh = 0;

  batchStatus = BatchStatus;

  constructor(
    private dialogService: NbDialogService,
    private router: Router,
    private config: ConfigService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
    this.config.translateBatchStatus();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.piecesQty) {
      this.totalGoodPieces = this.piecesQty?.response?.goodCount;
      this.totalDefectivePieces = Math.round((this.piecesQty?.response?.rejectedCount + this.piecesQty?.response?.lostCount) * 10) / 10
      //Force to 0 pieces in case order is scheduled or delayed
      if (!this.isBatchActive(this.batch?.status)) {
        this.totalGoodPieces = 0;
        this.totalDefectivePieces = 0;
      }
    }
  }

  getBatchStatus(batchStatus){
    return this.config.getBatchStatus(batchStatus)
  }

  getBatchStatusColor(batchStatus){
    return this.config.getBatchStatusColor(batchStatus)
  }

  getNotTranslatedBatchStatus(batchStatus) {
    return this.config.getNotTranslatedBatchStatus(batchStatus)
  }

  isBatchActive(batchStatus: BatchStatus): boolean {
    return this.config.isBatchActive(batchStatus);
  }

  goToDetails(id) {

    var dataToModal = {
      ...this.batch,
      ...this.piecesQty.response
    }


    const obj = {
      batch: dataToModal,
    };
    this.dialogService.open(BatchModalComponent, {
      context: obj as Partial<BatchModalComponent>,
    }).onClose.subscribe({
      next: (closed: any) => {
      },
      error: (err: any) => {},
    });

  }

  goToNextOrders() {

    const obj = {
    };

    const ref = this.dialogService.open(NextOrdersModalComponent, {
      context: obj as Partial<NextOrdersModalComponent>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {
    });

  }

  gotoReport() {
    const now = new Date()
    const start = new Date(this.batch.batchExpectedStart)
    const end = new Date(this.batch.batchExpectedEnd)

    const extras = {
      processCell: this.processCellPath,
      id: this.batch.productionOrder,
      domain: true, // Order or Team
      prevPage: this.router.url == '/pages/calendar' ? "calendar" : "overview",
      from: start,
      to: end > now ? now.toISOString() : this.batch.batchExpectedEnd
    };
    localStorage.setItem('reportDetailsExtras',JSON.stringify(extras));
    this.router.navigate(['pages/report-details']);
  }

  startProduction(){
    this.startProductionClick.emit();
  }

  stopProduction(){
    this.stopProductionClick.emit();
  }

  pauseProduction(){
    this.pauseProductionClick.emit();
  }

  resumeProduction(){
    this.resumeProductionClick.emit();
  }
}
