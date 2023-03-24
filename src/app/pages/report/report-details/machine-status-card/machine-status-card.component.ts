import { BaseClass } from './../../../../@core/utils/common/base-class/base-class';
import { Component, Input, OnInit  } from '@angular/core';

import {TranslateService} from '@ngx-translate/core';
import { NbDialogService } from '@nebular/theme';

import { MachineStatusInMinutes } from '../../../../@core/utils/models/presentation/integration/machine-status-in-minutes';
import { MachineStatusDetailCardComponent } from './machine-status-detail-card/machine-status-detail-card.component';
import { MachineStatusInMinutes_BE } from '../../../../@core/utils/models/backend/integration/machine-status-in-minutes';
import { LineStatusModalComponent } from '../../../../@core/utils/shared/line-status-chart/details-modal/line-status-modal.component';
import { MachineStatusHistoryModalComponent } from '../../../../@core/utils/shared/machine-status-history-modal/machine-status-history-modal.component';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-machine-status-card',
  styleUrls: ['./machine-status-card.component.scss'],
  templateUrl: './machine-status-card.component.html',
})

export class MachineStatusCardComponent extends BaseClass implements OnInit {

  @Input() machinesStatus: MachineStatusInMinutes;
  @Input() machinesStatusFull: MachineStatusInMinutes;
  @Input() machineStatus: MachineStatusInMinutes_BE;
  @Input() showMachineInUse
  @Input() isDetails = false;

  @Input() chartId = "report-machine-status-chart-Id";

  noData = false;
  drawChart = false;
  

  constructor(
    public translate: TranslateService,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
      setTimeout(() => {
        this.drawChart = true;
      }, 2000);
  }

  showNoData(event) {
    this.noData = event;
  }

  goToDetailsOLD() {
    const obj = {
      isDetails: true,
      serverError: this.serverError,
      machinesStatus: this.machinesStatus,
      showMachineInUse: this.showMachineInUse,
    };
    const ref = this.dialogService.open(MachineStatusDetailCardComponent, {
      context: obj as Partial<MachineStatusDetailCardComponent>,
    });
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {

    });

  }

  goToDetails() {
    const obj = {
      processCellPath: this.processCellPath,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      isReport: true ,
      machinesStatus: this.machinesStatusFull,
      showMachineInUse: this.showMachineInUse,
      isDetails: true

    };

    const ref = this.dialogService.open(LineStatusModalComponent, {
      context: obj as Partial<LineStatusModalComponent>,
    }
    );
    ref.onClose.subscribe(e => {

    });
    ref.onBackdropClick.subscribe(e => {
    });

  }


  goToDetailsMachine(){
    const obj = {
      processCellPath: this.processCellPath,
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      machinePath: this.machinePath,
    };

    const ref = this.dialogService.open(MachineStatusHistoryModalComponent, {
      context: obj as Partial<MachineStatusHistoryModalComponent>,
    }
    );
    ref.onClose.subscribe(e => {
    });
    ref.onBackdropClick.subscribe(e => {
    });
  }


}
