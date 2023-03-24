import { Component, Input, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogRef } from '@nebular/theme';
import { BaseClass } from '../../../common/base-class/base-class';

@Component({
  selector: 'ngx-machines-speed-modal',
  templateUrl: './machines-speed-modal.component.html',
  styleUrls: ['./machines-speed-modal.component.scss']
})
export class MachinesSpeedModalComponent extends BaseClass implements OnInit {

  @Input() showActualValue: boolean = false;

  constructor(
    protected ref: NbDialogRef<MachinesSpeedModalComponent>,
    private nbAuthService: NbAuthService) {
    super(nbAuthService);
  }

  ngOnInit(): void {
    this.isLoading = true;
  }

  loadingFinish(){
    this.isLoading = false;
  }

  closeModal(){
    this.ref.close();
  }
}
