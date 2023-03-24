
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../../common/base-class/base-class';
import { OEE } from '../../../models/presentation/integration/oee';
import { OeeDetailsModalComponent } from '../OEE-chart/oee-details-modal/oee-details-modal.component';


@Component({
  selector: 'ngx-oee-card',
  styleUrls: ['./oee-card.component.scss'],
  templateUrl: './oee-card.component.html',
})

export class OeeCardComponent extends BaseClass  {
  @Input() chartId = "oee-chart";

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
      processCell: this.processCellPath,
      isOrder: this.isOrder,
      isShift: this.isShift,
    };
    const ref = this.dialogService.open(OeeDetailsModalComponent, {
      context: obj as Partial<OeeDetailsModalComponent>,
    });
  }

}

