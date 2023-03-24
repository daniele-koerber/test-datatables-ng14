import { Component, Input, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../../@core/utils/common/base-class/base-class';
import { ActualMachineStatus } from '../../../@core/utils/models/presentation/integration/actual-machine-status';
import { MachinesStatusHistory } from '../../../@core/utils/models/presentation/integration/machine-status-history';
import { MachineStatusInMinutes } from '../../../@core/utils/models/presentation/integration/machine-status-in-minutes';
import { MachineStatusHistoryModalComponent } from '../../../@core/utils/shared/machine-status-history-modal/machine-status-history-modal.component';

@Component({
  selector: 'ngx-machine-status-card',
  templateUrl: './machine-status-card.component.html',
  styleUrls: ['./machine-status-card.component.scss']
})
export class MachineStatusCardComponent extends BaseClass implements OnInit {


  @Input() actualStatusComponentData: ActualMachineStatus = {};
  @Input() statusInMinComponentData: MachineStatusInMinutes = {};
  @Input() machineStatusHistory: MachinesStatusHistory = {};
  @Input() isReport: boolean = false;

  @Input() hoursToDisplay: number;



  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService) {
    super(nbAuthService);
  }

  ngOnInit(): void {
  }

  goToDetails(){
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
