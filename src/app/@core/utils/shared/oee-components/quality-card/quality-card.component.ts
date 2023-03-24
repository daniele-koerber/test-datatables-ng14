import { Component, Input } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../../common/base-class/base-class';
import { OEE } from '../../../models/presentation/integration/oee';
import { ReportQualityDetailsModalComponent } from '../quality-chart/report-quality-details-modal/report-quality-details-modal.component';


@Component({
  selector: 'ngx-quality-card',
  styleUrls: ['./quality-card.component.scss'],
  templateUrl: './quality-card.component.html',
})

export class QualityCardComponent extends BaseClass {

  @Input() chartId = "quality-chart";
  @Input() oee: OEE = {};

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
  }


  goToDetails() {
    const obj = {
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      processCellPath: this.processCellPath,
      chartId: "quality-details-chart-id",
    };
    this.dialogService.open(ReportQualityDetailsModalComponent, {
      context: obj as Partial<ReportQualityDetailsModalComponent>,
    }).onClose.subscribe({
      next: (closed: any) => {
      },
      error: (err: any) => {},
    });

  }


}
