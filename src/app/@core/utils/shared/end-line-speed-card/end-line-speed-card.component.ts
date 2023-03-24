import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationData } from '../../../data/configuration';
import { IntegrationData } from '../../../data/integration';
import { BaseClass } from '../../common/base-class/base-class';
import { SmoothLineChartModel } from '../../models/presentation/integration/smooth-line-chart-model';
import { MachinesSpeedModalComponent } from '../line-status-chart/machines-speed-modal/machines-speed-modal.component';


@Component({
  selector: 'ngx-end-line-speed-card',
  templateUrl: './end-line-speed-card.component.html',
  styleUrls: ['./end-line-speed-card.component.scss']
})

export class EndLineSpeedCardComponent extends BaseClass implements OnInit {

  @Input() chartData?: SmoothLineChartModel[];
  @Input() chartId?: string;
  @Input() UoM?: string;
  @Input() actualSpeed?: number;
  @Input() setPointSpeed?: number;
  @Input() timeUoM?: string;
  @Input() hideDateAxis: boolean = false;

  @Input() hoursToDisplay: number;
  @Input() showActualValue: boolean = false;

  speedUoM:string = '';

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService) 
    {
    super(nbAuthService);
  }

  ngOnInit(): void {


  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.UoM && this.timeUoM) {
      this.speedUoM = this.UoM + '/' + this.timeUoM;
    }
    
  }

  goToMachinesSpeed(){
    const obj = {
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      processCellPath: this.processCellPath,
      canExportData: this.canExportData,
      showActualValue: this.showActualValue
    };

    const ref = this.dialogService.open(MachinesSpeedModalComponent, {
      context: obj as Partial<MachinesSpeedModalComponent>,

    }
    );
    ref.onClose.subscribe(e => {
    });
    ref.onBackdropClick.subscribe(e => {
    });
  }
}
