import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigurationData } from '../../../@core/data/configuration';
import { SchedulingData } from '../../../@core/data/scheduling';
import { IntegrationData } from '../../../@core/data/integration';
import { ConfigService } from '../../../@core/utils/services';
import { BaseClass } from '../../../@core/utils/common/base-class/base-class';
import { OEE } from '../../../@core/utils/models/presentation/integration/oee';
import { Shift } from '../../../@core/utils/models/presentation/scheduling/shift';
import { NbAuthService } from '@nebular/auth';


@Component({
  selector: 'ngx-actual-shift-card',
  styleUrls: ['./current-shift-card.component.scss'],
  templateUrl: './current-shift-card.component.html',
})

export class ActualShiftCardComponent extends BaseClass implements OnInit, OnChanges {

  @Input() oee: OEE;
  @Input() shift: Shift;
  @Input() status: string;
  @Input() hasReport: boolean;

  No_production = '';
  timeStart: string;
  timeEnd: string;

  constructor(
    private nbAuthService: NbAuthService,
    public translate: TranslateService,
    private router: Router,
  ) {

    super(nbAuthService);
    this.translate.get("COMMON.No_production").subscribe((No_production) => {
      this.No_production = No_production;
    });

  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.shift){
      const pipe = new DatePipe(this.translate.currentLang);

      const startDate = this.shift?.shiftStartDatetime;
      const endDate = this.shift?.shiftEndDatetime;

      if(startDate === undefined || endDate === undefined) return;

      this.timeStart = pipe.transform(new Date(startDate), 'short').split(",")[1];
      this.timeEnd = pipe.transform(new Date(endDate), 'short').split(",")[1];
    }
  }

  goToShiftReport(){
    const data = {
      processCell: this.processCellPath,
      from: this.shift.shiftStartDatetime,
      to: this.shift.shiftEndDatetime,
      selectedProductCode: null,
      numberOfDaysString: null,
      numberOfDays: null,
      globalFrom: null,
      globalTo: null,
      team: null,
      selectedProcessCell: null,
      actualTeam: null,
      domain: false,
      prevPage: "overview",
    }
    localStorage.setItem('reportDetailsExtras',JSON.stringify(data));
    this.router.navigate(['pages/report-details']);
  }
}

