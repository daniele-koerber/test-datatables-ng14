import { Component, Input, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogRef } from '@nebular/theme';
import { IntegrationData } from '../../../data/integration';
import { BaseClass } from '../../common/base-class/base-class';
import { MachinesStatusHistory } from '../../models/presentation/integration/machine-status-history';

@Component({
  selector: 'ngx-machine-status-history-modal',
  templateUrl: './machine-status-history-modal.component.html',
  styleUrls: ['./machine-status-history-modal.component.scss']
})
export class MachineStatusHistoryModalComponent extends BaseClass implements OnInit {
  
  chartData: MachinesStatusHistory = {}

  constructor(
    protected ref: NbDialogRef<MachineStatusHistoryModalComponent>,
    private integrationService: IntegrationData,
    private nbAuthService: NbAuthService
    ) {
    super(nbAuthService);
  }

  ngOnInit(): void {
    this.serverError = false;
    // this.isLoading = true;
    // this.getMachineStatusHistory();
  }


  dataIsLoading(event) {
    this.isLoading = event;
  }

  getMachineStatusHistory(){
    this.integrationService.getMachineHistoryStateByProcessCellPath(this.dateStart, this.dateEnd, this.machinePath, null,true).then((res: MachinesStatusHistory)=>{
      this.chartData = res;
      this.serverError = false;
      this.isLoading = false;
    }).catch(error => {
      this.serverError = true;
      this.isLoading = false;
    });
  }


  closeModal(){
    this.ref.close();
  }
}
