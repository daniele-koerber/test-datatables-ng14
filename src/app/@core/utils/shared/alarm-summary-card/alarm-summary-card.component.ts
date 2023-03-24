import { Component, Input, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { BaseClass } from '../../common/base-class/base-class';
import { AlarmSummary } from '../../models/presentation/integration/alarm-summary';
import { AlarmsSummaryComponent } from '../alarms-summary-chart/alarms-summary-chart.component';
import { AlarmSummaryDetailCardComponent } from './alarm-summary-detail-card/alarm-summary-detail-card.component';

@Component({
  selector: 'ngx-alarm-summary-card',
  templateUrl: './alarm-summary-card.component.html',
  styleUrls: ['./alarm-summary-card.component.scss']
})
export class AlarmSummaryCardComponent extends BaseClass implements OnInit {

  @Input() componentData: AlarmSummary;

  @Input() chartId = 'alarmsSummaryChart';

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
    ) {
      super(nbAuthService);
     }

  ngOnInit(): void {
  }

  goToDetails() {
    // const obj = {
    //   chartId:         this.chartId + 'details',
    //   processCell:     this.processCellPath,
    //   start:           this.componentData?.dateStart,
    //   end:             this.componentData?.dateEnd,
    //   chartData:       this.componentData?.chartData,
    //   rowNumberToShow: 0,
    //   serverError:     this.serverError,
    //   status:          this.componentData?.status,
    //   isLoading:       this.isLoading,
    // };

    const obj = {
      chartId:         this.chartId + 'details',
      dateStart:       this.dateStart,
      dateEnd:         this.dateEnd,
      processCell:     this.processCellPath,
      chartData:       this.componentData?.chartData,
      rowNumberToShow: 0,
      serverError:     this.serverError,
      status:          this.componentData?.status,
      machinePath:     this.machinePath
    };
    const ref = this.dialogService.open(AlarmSummaryDetailCardComponent, {
      context: obj as Partial<AlarmSummaryDetailCardComponent>,
    });
  }
}
