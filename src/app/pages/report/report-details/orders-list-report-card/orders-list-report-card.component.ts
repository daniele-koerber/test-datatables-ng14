import { Component, Input, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../../../@core/utils/common/base-class/base-class';
import { BatchClient } from '../../../../@core/utils/models/presentation/scheduling/batch-client';
import { BatchModalComponent } from '../../../../@core/utils/shared/batch-modal/batch-modal.component';

@Component({
  selector: 'ngx-orders-list-report-card',
  templateUrl: './orders-list-report-card.component.html',
  styleUrls: ['./orders-list-report-card.component.scss']
})
export class OrdersListReportCardComponent extends BaseClass implements OnInit {

  @Input() ordersList: BatchClient[];

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService) {
    super(nbAuthService);
  }

  ngOnInit(): void {
  }

  goToDetail(productionOrder){

    const batch = this.ordersList.filter(order => order.productionOrder === productionOrder)[0];

    const obj = {
      batch: batch,
    };
    this.dialogService.open(BatchModalComponent, {
      context: obj as Partial<BatchModalComponent>,
    }).onClose.subscribe({
      next: (closed: any) => {
      },
      error: (err: any) => {},
    });
  }
}
