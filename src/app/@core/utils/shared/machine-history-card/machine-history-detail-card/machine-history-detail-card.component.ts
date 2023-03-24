import { BaseClass } from '../../../common/base-class/base-class';
import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfigService } from '../../../services';
import { AggregatedMachineHistoryResponse_FE, AlarmHeldOccurencies_FE, MachineParameterSpeed_FE, MachineSpeed_FE, ProgressiveMachineProductionCounter_FE } from '../../../models/presentation/integration/machine-history';
import { NbAuthService } from '@nebular/auth';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'ngx-machine-history-detail-card',
  templateUrl: './machine-history-detail-card.component.html',
  styleUrls: ['./machine-history-detail-card.component.scss']
})
export class MachineHistoryDetailCardComponent extends BaseClass implements OnInit {

  @Input() componentData: AggregatedMachineHistoryResponse_FE;
  @Input() machineSpeeds: Array<MachineSpeed_FE>;
  @Input() parameterSpeeds: Array<MachineParameterSpeed_FE>;
  @Input() productionCounter: Array<ProgressiveMachineProductionCounter_FE>;
  @Input() occurrencesList: Array<AlarmHeldOccurencies_FE>;
  @Input() machineSpeedsUoM: string = "";
  @Input() hoursToDisplay: number;

  @Input() hideDateAxis: boolean = false;
  @Input() showScrollBarX: boolean = false;

  helpLinkPage = 'machine-history-detail-card';
  helpPageLinkDestination = '#';
  min: Date;
  max: Date;
  rawDate: Date;
  date: string;
  filteredMachineSpeeds: MachineSpeed_FE[];
  filteredParameterSpeeds: MachineParameterSpeed_FE[];
  filteredProductionCounter: ProgressiveMachineProductionCounter_FE[];
  filteredOccurrencesList: AlarmHeldOccurencies_FE[];


  constructor(protected ref: NbDialogRef<MachineHistoryDetailCardComponent>,
    private config: ConfigService,
    private nbAuthService: NbAuthService,
    private translate: TranslateService,
    ) {
      super(nbAuthService);
    }

    ngOnInit(): void {
      this.setHelpPage();

      const pipe = new DatePipe(this.translate.currentLang);

      const from = this.dateStart
      const to = this.dateEnd

      this.min = new Date(from);
      this.max = new Date(to);

      this.rawDate = new Date(to);
      this.date = pipe.transform(this.rawDate, 'd MMM y');

      let endDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
      let startDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

      if(new Date(from).getTime() >= new Date(startDate).getTime()){
        startDate = from;
      }
      if(new Date(to).getTime() <= new Date(endDate).getTime()){
        endDate = to;
      }

    this.getChartData(startDate, endDate);
    }

    getChartData(from, to) {
      this.filteredMachineSpeeds = this.machineSpeeds.filter(el => new Date(from).getTime() <= el.date && el.date <= new Date(to).getTime())
      this.filteredParameterSpeeds = this.parameterSpeeds.filter(el => new Date(from).getTime() <= el.date && el.date <= new Date(to).getTime())
      this.filteredProductionCounter = this.productionCounter.filter(el => new Date(from).getTime() <= el.date && el.date <= new Date(to).getTime())
      this.filteredOccurrencesList = this.occurrencesList.filter(el => new Date(from).getTime() <= el.date && el.date <= new Date(to).getTime())
    }

    dateChanged(date: Date) {
      const pipe = new DatePipe(this.translate.currentLang);
      setTimeout(() => {
        this.date = pipe.transform(this.rawDate, 'd MMM y');
        this.rawDate = new Date(date);

          let endDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT23:59:59')).toUTCString()).toISOString();
          let startDate = new Date(new Date(pipe.transform(this.rawDate, 'yyyy-MM-ddT00:00:00')).toUTCString()).toISOString();

          if(new Date(this.dateStart).getTime() >= new Date(startDate).getTime()){
            startDate = this.dateStart;
          }
          if(new Date(this.dateEnd).getTime() <= new Date(endDate).getTime()){
            endDate = this.dateEnd;
          }

          this.getChartData(startDate, endDate);
        }, 0);
    }

    openHelp () {
      if (this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
    }
    setHelpPage() {
      this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
    }

    setHelpPageLinkDestination(destination) {
      this.helpPageLinkDestination = destination;
    }

    closeModal() {
      this.ref.close(true);
    }
}
