import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { BaseClass } from '../../../../@core/utils/common/base-class/base-class';
import { ClientProducedDefectiveParts } from '../../../../@core/utils/models/presentation/integration/client-produced-defective-parts';
import { BatchClient } from '../../../../@core/utils/models/presentation/scheduling/batch-client';
import { Shift } from '../../../../@core/utils/models/presentation/scheduling/shift';

@Component({
  selector: 'ngx-actual-shift-report-card',
  templateUrl: './actual-shift-report-card.component.html',
  styleUrls: ['./actual-shift-report-card.component.scss']
})
export class ActualShiftReportCardComponent extends BaseClass implements OnInit, OnChanges {

  @Input() shift: Shift;
  @Input() shiftQuantities: ClientProducedDefectiveParts;
  @Input() processCellName: string;
  @Input() isPrevShiftEnable: boolean;
  @Input() isNextShiftEnable: boolean;
  @Input() prevShiftPC: string;
  @Input() nextShiftPC: string;
  @Input() UoM:string =''

  @Output() prevShiftClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() nextShiftClick: EventEmitter<void> = new EventEmitter<void>();

  defectiveCount = 0;

  constructor(
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
  }

  ngOnInit(): void {
    this.isLoading = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.shift || changes.shiftQuantities){
      this.updateCurrentBatchData();
    }
  }

  updateCurrentBatchData(){

    if(this.shift === undefined || this.shiftQuantities === undefined) return;

    this.shiftQuantities.response.goodCount = this.trim(this.shiftQuantities?.response?.goodCount,0);
    // this.shiftQuantities.response.rejectedCount = this.trim(this.shiftQuantities?.response?.rejectedCount,0);
    this.defectiveCount = this.trim(this.shiftQuantities?.response?.rejectedCount + this.shiftQuantities?.response?.lostCount,0);

    this.isLoading = false;
  }

  prevShiftClickEvent(){
    this.prevShiftClick.emit();
  }

  nextShiftClickEvent(){
    this.nextShiftClick.emit();
  }
}
