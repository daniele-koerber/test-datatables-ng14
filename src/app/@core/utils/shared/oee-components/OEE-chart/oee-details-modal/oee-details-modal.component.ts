import { Component, OnInit, Input } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogRef } from '@nebular/theme';
import { BaseClass } from '../../../../common/base-class/base-class';
import { ConfigService } from '../../../../services';

@Component({
  selector: 'ngx-oee-details-modal',
  styleUrls: ['./oee-details-modal.component.scss'],
  templateUrl: './oee-details-modal.component.html',
})

export class OeeDetailsModalComponent extends BaseClass implements OnInit{

  @Input() dateStart;
  @Input() dateEnd;
  @Input() processCell;
  @Input() id: number;

  helpLinkPage = 'report-oee-details-modal';
  helpPageLinkDestination = '#';

  constructor(
    protected ref: NbDialogRef<OeeDetailsModalComponent>,
    private config: ConfigService,
    private nbAuthService: NbAuthService
  ) { 
    super(nbAuthService);
  }

  ngOnInit() {
    this.isLoading = true;
    this.setHelpPage();
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
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
