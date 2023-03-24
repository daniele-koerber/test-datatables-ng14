import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../../common/base-class/base-class';
import { OEE } from '../../../models/presentation/integration/oee';
import { AvailabilityDetailsModalComponent } from '../availability-chart/Details/availability-details-modal.component';

@Component({
  selector: 'ngx-availability-card',
  styleUrls: ['./availability-card.component.scss'],
  templateUrl: './availability-card.component.html',
})

export class AvailabilityCardComponent extends BaseClass {

  @Input() chartId = "availability-chart";
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
    };
    const ref = this.dialogService.open(AvailabilityDetailsModalComponent, {
      context: obj as Partial<AvailabilityDetailsModalComponent>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {

    });
  }

}
