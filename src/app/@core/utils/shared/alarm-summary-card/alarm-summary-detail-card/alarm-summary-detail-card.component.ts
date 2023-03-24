import { Component, Input, OnInit } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogRef } from '@nebular/theme';
import { BaseClass } from '../../../common/base-class/base-class';
import { ConfigService } from '../../../services';

@Component({
  selector: 'ngx-alarm-summary-detail-card',
  templateUrl: './alarm-summary-detail-card.component.html',
  styleUrls: ['./alarm-summary-detail-card.component.scss']
})
export class AlarmSummaryDetailCardComponent extends BaseClass implements OnInit {

  @Input() chartId = 'alarmsSummaryChartdetail';
  @Input() processCell: any;
  @Input() chartData: any = null;
  @Input() rowNumberToShow: number = 0;
  @Input() dateStart;
  @Input() dateEnd;
  @Input() status;



  helpLinkPage = 'alarm-summary-detail-card';
  helpPageLinkDestination = '#';


  constructor(
    protected ref: NbDialogRef<AlarmSummaryDetailCardComponent>,
    private config: ConfigService,
    private nbAuthService: NbAuthService
    ) {
      super(nbAuthService);
    }

  ngOnInit(): void {
    this.setHelpPage();
  }

  openHelp () {
    if (this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }
  setHelpPage() {
    // console.log('helpLinkPage ==>', this.helpLinkPage);
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }



  closeModal() {
    this.ref.close(true);
  }

}
