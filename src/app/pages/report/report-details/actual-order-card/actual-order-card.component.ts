import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../../../@core/utils/common/base-class/base-class';
import { CalendarTimeSlotWOrderTime } from '../../../../@core/utils/models/presentation/scheduling/calendar-time-slot-workorder-time';
import { ClientProducedDefectiveParts } from '../../../../@core/utils/models/presentation/integration/client-produced-defective-parts';
import { BatchModalComponent } from '../../../../@core/utils/shared/batch-modal/batch-modal.component';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-actual-order-card',
  styleUrls: ['./actual-order-card.component.scss'],
  templateUrl: './actual-order-card.component.html',
})

export class ActualOrderCardComponent extends BaseClass implements OnInit, OnChanges{
  @Input() batch: CalendarTimeSlotWOrderTime;
  @Input() batchQuantities: ClientProducedDefectiveParts;
  @Input() processCellName: string;
  @Input() isPrevOrderEnable: boolean;
  @Input() isNextOrderEnable: boolean;
  @Input() prevOrderPC: string;
  @Input() nextOrderPC: string;
  @Input() UoM:string =''

  @Output() prevOrderClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() nextOrderClick: EventEmitter<void> = new EventEmitter<void>();

  defectiveCount = 0;

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
  }

  ngOnInit() {
    this.isLoading = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.batch || changes.batchQuantities){
      this.updateCurrentBatchData();
    }
  }

  updateCurrentBatchData(){

    if(this.batch === undefined || this.batchQuantities === undefined) return;

    this.batch.targetQuantity = (Math.round(this.batch.targetQuantity * 10.0) / 10.0);
    this.batchQuantities.response.goodCount = (Math.round(this.batchQuantities?.response?.goodCount * 10.0) / 10.0);
    // this.batchQuantities.response.rejectedCount = this.trim(this.batchQuantities?.response?.rejectedCount,0);
    this.defectiveCount = (Math.round((this.batchQuantities?.response?.rejectedCount + this.batchQuantities?.response?.lostCount) * 10.0) / 10.0);


    this.isLoading = false;
  }

  goToDetails(){
    var dataToModal = {
      ...this.batch,
      ...this.batchQuantities.response
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

  prevOrderClickEvent(){
    this.prevOrderClick.emit();
  }

  nextOrderClickEvent(){
    this.nextOrderClick.emit();
  }
}
