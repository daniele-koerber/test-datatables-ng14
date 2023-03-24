import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../../../data/configuration';
import { IntegrationData } from '../../../../../data/integration';
import { SchedulingData } from '../../../../../data/scheduling';
import { BaseClass } from '../../../../common/base-class/base-class';
import { ConfigService } from '../../../../services/config.service';

export interface Occurrence {
  alarmEnd: string;
  alarmStart: string;
  duration: number;
  durationString: string;
}
export interface DowntimeAlarm {
  alarmDescription: string;
  alarmId: number;
  duration: number;
  durationString: string;
  machineName: string;
  machinePath: string;
  nam: string;
  occurrences: number;
  occurrencesList: Array<Occurrence>;
}

@Component({
  selector: 'ngx-availability-details-modal',
  styleUrls: ['./availability-details-modal.component.scss'],
  templateUrl: './availability-details-modal.component.html',
})

export class AvailabilityDetailsModalComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy{

  @Input() id: any;

  helpLinkPage = 'availability-details-modal';
  helpPageLinkDestination = '#';

  downtimeReasonchartId = 'downtime-reason-chart-id';
  machineDowntimechartId = 'machine-downtime-chart-id';
  downtimeAlarmschartId = 'downtime-alarms-chart-id';

  processCellSubscription: Subscription;
  loadSubscription: Subscription;

  downtimeAlarmsChartData: any;
  batch: any;
  downtimeAlarmsMaxTot: number = 0;
  serverError: boolean = false;
  chart1Loading = true;
  chart2Loading = true;


  constructor(
    protected ref: NbDialogRef<AvailabilityDetailsModalComponent>,
    private config: ConfigService,
    private translate: TranslateService,
    private configurationService: ConfigurationData,
    private integrationService: IntegrationData,
    private scheduleService: SchedulingData,
    private nbAuthService: NbAuthService,
  ) {
    super(nbAuthService);
  }

  ngOnInit() {
    this.isLoading = true;
    this.setHelpPage();
  }

  ngOnDestroy(): void {
    if (this.processCellSubscription) {
      this.processCellSubscription.unsubscribe();
    }
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.waitConfigurationServiceLoaded();
  }

  openHelp () {
    if (this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, '_blank'); }
  }

  setHelpPage() {
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }






  //#region  DOWNTIME ALARMS
  getDowntimeAlarmsChartData() {

    if (this.processCellPath) {
      if( this.dateStart){
        this.integrationService.getDowntimeAlarmsByProcessCellPath(this.processCellPath, this.dateStart, this.dateEnd).then((res) => {
          this.serverError = false;
          this.downtimeAlarmsChartData = res.response;
          this.addAlarmDescriptionToChart();
        }).catch(error => {
          this.serverError = true;
        });
      } else if (this.id) {
        this.scheduleService.getOrder(this.processCellPath, this.id).then(batch => {
          this.serverError = true;
          this.batch = batch;
          this.integrationService.getDowntimeAlarmsByProcessCellPath(this.processCellPath, batch.timeSeriesStart, batch.timeSeriesEnd).then((res) => {
            this.serverError = true;
            this.downtimeAlarmsChartData = res.response;
            this.addAlarmDescriptionToChart();
          }).catch(error => {
            this.serverError = true;
          });
        }).catch(error => {
          this.serverError = true;
        });
      }
    }
  }

  addAlarmDescriptionToChart() {

    this.downtimeAlarmsChartData.forEach(data => {
      if (this.downtimeAlarmsMaxTot < data.duration) {
        this.downtimeAlarmsMaxTot = data.duration;
      }
      const machine = data.machineName;
      const alarmName = data.name;
      const duration = data.duration;
      const id = data.alarmId;

      data[alarmName] = duration;
      this.translate.get(['SHARED.id']).subscribe((translations) => {
        data['alarmDescription'] = machine + ' - ' + alarmName + ' (' + translations['SHARED.id'] + ': ' + id + ')'
      });
    });
  }

  //#endregion

  closeModal() {
    this.ref.close(true);
  }



    //#region LISTENERS

    listenForSelectedProcessCellChanges() {
      this.processCellSubscription = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
        if ( selectedProcessCell !== undefined) {
          this.getDowntimeAlarmsChartData();
        }
      });
    }

    waitConfigurationServiceLoaded() {
      this.loadSubscription = this.configurationService.hasComponentLoaded.subscribe(loaded => {
        if (loaded === true) {
          this.getDowntimeAlarmsChartData();
        }
      });
    }
    //#endregion

}
