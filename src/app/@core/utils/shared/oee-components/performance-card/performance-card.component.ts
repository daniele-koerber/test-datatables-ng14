import { Component, Input, } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../../common/base-class/base-class';
import { OEE } from '../../../models/presentation/integration/oee';
import { PerformanceDetailsModal } from '../performance-chart/Details/performance-details-modal.component';

@Component({
  selector: 'ngx-performance-card',
  styleUrls: ['./performance-card.component.scss'],
  templateUrl: './performance-card.component.html',
})

export class PerformanceCardComponent extends BaseClass{

  @Input() chartId = "performance-chart";
  @Input() oee: OEE = {};

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
  }


  goToDetails(){
    const obj = {
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      processCellPath: this.processCellPath,
    };
    const ref = this.dialogService.open(PerformanceDetailsModal, {
      context: obj as Partial<PerformanceDetailsModal>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {

    });
  }


}
