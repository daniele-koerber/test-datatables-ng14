import { BaseClass } from '../../common/base-class/base-class';
import { Component, Input, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { AlarmSummary } from '../../models/presentation/integration/alarm-summary';
import { DowntimeAlarmsComponent } from '../downtime-alarms-chart/downtime-alarms-chart.component';
import { DowntimeAlarmDetailCardComponent } from './downtime-alarm-detail-card/downtime-alarm-detail-card.component';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-downtime-alarm-card',
  templateUrl: './downtime-alarm-card.component.html',
  styleUrls: ['./downtime-alarm-card.component.scss']
})
export class DowntimeAlarmCardComponent extends BaseClass implements OnInit {

  @Input() componentData: AlarmSummary;

  @Input() chartId = 'downtimeAlarmsChart';

  constructor(
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
    ) {
      super(nbAuthService);
    }

  ngOnInit(): void {
  }

  goToDetails() {
    const obj = {
      chartId:         this.chartId + 'details',
      dateStart:       this.dateStart,
      dateEnd:         this.dateEnd,
      chartData:       this.componentData?.chartData,
      rowNumberToShow: 0,
      serverError:     this.serverError,
      status:          this.componentData?.status,
      machinePath:     this.machinePath
    };
    const ref = this.dialogService.open(DowntimeAlarmDetailCardComponent, {
      context: obj as Partial<DowntimeAlarmDetailCardComponent>,
    });
  }

}
