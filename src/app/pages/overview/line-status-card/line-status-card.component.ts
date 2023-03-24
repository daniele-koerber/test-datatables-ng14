import { Component, Input, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { LineStatusModalComponent } from '../../../@core/utils/shared/line-status-chart/details-modal/line-status-modal.component';


import { Subscription } from 'rxjs';
import { BaseClass } from '../../../@core/utils/common/base-class/base-class';
import { LineStatus_FE } from '../../../@core/utils/models/presentation/integration/line-status';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-line-status-card',
  styleUrls: ['./line-status-card.component.scss'],
  templateUrl: './line-status-card.component.html',
})

export class LineStatusCardComponent extends BaseClass implements OnInit {

  @Input() isReport: boolean = false;
  @Input() lineStatusChartData: LineStatus_FE;

  detailsOpen: boolean = false;

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
  ) { 
    super(nbAuthService)
  }


  goToDetails() {
    this.detailsOpen = true;
    const obj = {
      processCellPath: this.processCellPath,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      isReport: this.isReport 
    };

    const ref = this.dialogService.open(LineStatusModalComponent, {
      context: obj as Partial<LineStatusModalComponent>,
    }
    );
    ref.onClose.subscribe(e => {
      this.detailsOpen = false;

    });
    ref.onBackdropClick.subscribe(e => {
    });

  }

  showNoData(event) {
    this.noData = event;
  }

  ngOnInit() {
    this.detailsOpen = false
  }
}
