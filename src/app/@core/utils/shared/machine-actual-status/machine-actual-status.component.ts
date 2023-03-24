import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { BaseClass } from '../../common/base-class/base-class';
import { ActualMachineStatus } from '../../models/presentation/integration/actual-machine-status';
import { ConfigService } from '../../services';


@Component({
  selector: 'ngx-machine-actual-status',
  templateUrl: './machine-actual-status.component.html',
  styleUrls: ['./machine-actual-status.component.scss']
})
export class MachineActualStatusComponent extends BaseClass implements OnInit, OnChanges {

  @Input() componentData: ActualMachineStatus = {};

  colorStatus: string;
  statusDescription: string;

  constructor(
    private config: ConfigService,
    private nbAuthService: NbAuthService
  ) { 
    super(nbAuthService);

  }

  ngOnInit(): void {
    this.setDotColor();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.machinePath?.currentValue || this.componentData)
      this.setDotColor();
  }

  setDotColor() {
    this.colorStatus = this.config.getMachineStatusColorFromStatusValue(this.componentData?.statusValue)
  }



}
