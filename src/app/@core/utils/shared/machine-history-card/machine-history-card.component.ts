import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { IntegrationData } from '../../../data/integration';
import { BaseClass } from '../../common/base-class/base-class';
import { AggregatedMachineHistoryResponse_FE, MachineSpeed_FE, MachineParameterSpeed_FE, ProgressiveMachineProductionCounter_FE, AlarmHeldOccurencies_FE } from '../../models/presentation/integration/machine-history';
import { ConfigService } from '../../services';
import { MachineHistoryDetailCardComponent } from './machine-history-detail-card/machine-history-detail-card.component';

@Component({
  selector: 'ngx-machine-history-card',
  templateUrl: './machine-history-card.component.html',
  styleUrls: ['./machine-history-card.component.scss'],
})
export class MachineHistoryCardComponent extends BaseClass implements OnInit {


  @Input() componentData: AggregatedMachineHistoryResponse_FE;
  @Input() machineSpeeds: Array<MachineSpeed_FE>;
  @Input() parameterSpeeds: Array<MachineParameterSpeed_FE>;
  @Input() productionCounter: Array<ProgressiveMachineProductionCounter_FE>;
  @Input() occurrencesList: Array<AlarmHeldOccurencies_FE>;
  @Input() hoursToDisplay: number;
  @Input() machineSpeedsUoM: string = "";

  @Input() hideDateAxis: boolean = false;
  @Input() showScrollBarX: boolean = false;

  componentDataMachineHistory: AggregatedMachineHistoryResponse_FE;
  machineSpeedsDetails: Array<MachineSpeed_FE>;
  parameterSpeedsDetails: Array<MachineParameterSpeed_FE>;
  productionCounterDetails: Array<ProgressiveMachineProductionCounter_FE>;
  alarmOccurrencesDetails: Array<AlarmHeldOccurencies_FE>;
  hoursToDisplayDetails: number;
  chartID: string;

  constructor(
    public translate: TranslateService,
    private integrationService: IntegrationData,
    private dialogService: NbDialogService,
    private nbAuthService: NbAuthService
    ) 
    { 
      super(nbAuthService); 

    }

  ngOnInit(): void {
    const test = this.serverError;
    this.chartID = "machineFullHistorychartId_" + this.machinePath;

  }

  goToDetails() {
    const Time = new Date(this.dateStart).getTime() - new Date(this.dateEnd).getTime();
    this.hoursToDisplayDetails = Math.abs(Time / (1000 * 3600));
    const pipe = new DatePipe(this.translate.currentLang);
    this.integrationService.getMachineFullHistory(this.machinePath, this.dateStart, this.dateEnd, null).then((res) => {
      this.componentDataMachineHistory = {
        ...res,
        noData: res.machinesHistory ? false : true,
        serverError: false,
      }

      this.machineSpeedsDetails = []
      res.machinesHistory.machineSpeeds.machineSpeeds.forEach(machineSpeed => {
        const macSpeed: MachineSpeed_FE = {}
        macSpeed.date = new Date(machineSpeed.time).getTime();
        macSpeed.setPoint = machineSpeed.setPoint
        macSpeed.speed = machineSpeed.speed
        this.machineSpeedsDetails.push(macSpeed)
      });
      this.parameterSpeedsDetails = []
      res.machinesHistory.machineSpeeds.parameterSpeeds.forEach(parameterSpeed => {
        const parSpeed: MachineParameterSpeed_FE = {}
        parSpeed.date = new Date(parameterSpeed.time).getTime();
        parSpeed.speed = parameterSpeed.speed
        parSpeed.time = parameterSpeed.time
        this.parameterSpeedsDetails.push(parSpeed)
      });
      this.productionCounterDetails = []
        res.machinesHistory.productionCounter.forEach(production=> {
        const prodCount: ProgressiveMachineProductionCounter_FE = {}
        prodCount.date = new Date(production.time).getTime();
        prodCount.production = production.production
        prodCount.time = production.time
        this.productionCounterDetails.push(prodCount)
      });

      this.alarmOccurrencesDetails = [];
      res.machinesHistory.alarmsResponse.forEach(alarm => {
        alarm.occurrencesList.forEach(occurrence => {
          let occ: AlarmHeldOccurencies_FE = occurrence;
          occ.name = alarm.name;
          occ.machineName = alarm.machineName;
          occ.machinePath = alarm.machinePath;
          occ.dateTime = pipe.transform(new Date(occ.alarmStart), 'HH:mm')
          occ.speed = 0;
          occ.date = new Date(occ.alarmStart).getTime();
          this.alarmOccurrencesDetails.push(occ);
        });
      });

      this.componentDataMachineHistory.isLoading = true;

      const obj = {
        machineSpeeds: this.machineSpeedsDetails,
        parameterSpeeds: this.parameterSpeedsDetails,
        productionCounter: this.productionCounterDetails,
        occurrencesList: this.alarmOccurrencesDetails,
        hoursToDisplay: this.hoursToDisplayDetails,
        machineSpeedsUoM: this.componentDataMachineHistory.machinesHistory.machineSpeeds.uoMValue,
        hideDateAxis: false,
        showScrollBarX: true,
        dateStart: this.dateStart,
        dateEnd: this.dateEnd,
      };
      const ref = this.dialogService.open(MachineHistoryDetailCardComponent, {
        context: obj as Partial<MachineHistoryDetailCardComponent>,
      });

    });
  }
}
