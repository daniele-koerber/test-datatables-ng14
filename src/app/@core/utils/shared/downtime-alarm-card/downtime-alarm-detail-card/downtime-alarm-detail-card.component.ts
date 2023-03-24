import { BaseClass } from '../../../common/base-class/base-class';
import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfigService } from '../../../services';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-downtime-alarm-detail-card',
  templateUrl: './downtime-alarm-detail-card.component.html',
  styleUrls: ['./downtime-alarm-detail-card.component.scss']
})
export class DowntimeAlarmDetailCardComponent extends BaseClass implements OnInit {

  @Input() chartId;
  @Input() dateStart;
  @Input() dateEnd;
  @Input() chartData: any = null;
  @Input() rowNumberToShow: number = 0;
  @Input() status;



  helpLinkPage = 'downtime-alarm-detail-card';
  helpPageLinkDestination = '#';


  constructor(
    protected ref: NbDialogRef<DowntimeAlarmDetailCardComponent>,
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
      this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
    }

    setHelpPageLinkDestination(destination) {
      this.helpPageLinkDestination = destination;
    }

    closeModal() {
      this.ref.close(true);
    }
}
