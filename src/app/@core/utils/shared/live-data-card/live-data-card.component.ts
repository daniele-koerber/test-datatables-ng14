import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { Observable } from 'rxjs';
import { BaseClass } from '../../common/base-class/base-class';
import { SmoothLineChartModel } from '../../models/presentation/integration/smooth-line-chart-model';
import { LiveDataModalComponent } from '../live-data-modal/live-data-modal.component';

@Component({
  selector: 'ngx-live-data-card',
  templateUrl: './live-data-card.component.html',
  styleUrls: ['./live-data-card.component.scss']
})
export class LiveDataCardComponent extends BaseClass implements OnInit, OnChanges {

  @Input() titleChart1?: string;
  @Input() titleChart2?: string;

  @Input() chartData1?: SmoothLineChartModel[] = [];
  @Input() chartData2?: SmoothLineChartModel[] = [];

  @Input() UoM1?: string;
  @Input() UoM2?: string;
  @Input() hideDateAxis: boolean = false;

  @Input() hoursToDisplay: number;
  @Input() showActualValue: boolean = true;

  currentValueChart1: number = 0;
  currentValueChart2: number = 0;

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService) {
    super(nbAuthService);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.chartData1 || changes.chartData2)
      this.updateCurrentValues();
  }

  updateCurrentValues() {
    if((this.chartData1?.length - 1) > 0)
      this.currentValueChart1 = this.trim(this.chartData1[this.chartData1?.length - 1].value, 2)

    if((this.chartData2?.length - 1) > 0)
      this.currentValueChart2 = this.trim(this.chartData2[this.chartData2?.length - 1].value, 2)
  }

  goToDetails(){
    const obj = {
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      processCellPath: this.processCellPath,
      machinePath: this.machinePath,
      showActualValue: this.showActualValue
    };

    const ref = this.dialogService.open(LiveDataModalComponent, {
      context: obj as Partial<LiveDataModalComponent>,
    }
    );
    ref.onClose.subscribe(e => {
    });
    ref.onBackdropClick.subscribe(e => {
    });
  }
}
