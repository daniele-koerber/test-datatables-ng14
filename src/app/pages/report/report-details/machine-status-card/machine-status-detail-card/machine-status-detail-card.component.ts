import { BaseClass } from './../../../../../@core/utils/common/base-class/base-class';
import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfigService } from '../../../../../@core/utils/services';
import { MachineStatusInMinutes } from '../../../../../@core/utils/models/presentation/integration/machine-status-in-minutes';
import { MachineStatusInMinutes_BE } from '../../../../../@core/utils/models/backend/integration/machine-status-in-minutes';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-machine-status-detail-card',
  templateUrl: './machine-status-detail-card.component.html',
  styleUrls: ['./machine-status-detail-card.component.scss']
})
export class MachineStatusDetailCardComponent extends BaseClass implements OnInit {

  @Input() machinesStatus: MachineStatusInMinutes;
  @Input() showMachineInUse
  @Input() isDetails = true;

  helpLinkPage = 'downtime-alarm-detail-card';
  helpPageLinkDestination = '#';

  constructor(
    protected ref: NbDialogRef<MachineStatusDetailCardComponent>,
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
