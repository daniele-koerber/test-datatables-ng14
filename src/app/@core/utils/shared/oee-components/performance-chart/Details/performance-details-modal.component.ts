import { Component, OnInit, Input } from '@angular/core';
import { NbAuthService } from '@nebular/auth';
import { NbDialogRef } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../../../data/configuration';
import { IntegrationData } from '../../../../../data/integration';
import { SchedulingData } from '../../../../../data/scheduling';
import { BaseClass } from '../../../../common/base-class/base-class';
import { ConfigService } from '../../../../services/config.service';


@Component({
  selector: 'ngx-performance-details-modal',
  styleUrls: ['./performance-details-modal.component.scss'],
  templateUrl: './performance-details-modal.component.html',
})

export class PerformanceDetailsModal extends BaseClass implements OnInit {

  @Input() id;

  helpLinkPage = 'performance-chart-details';
  helpPageLinkDestination = '#';

  selectedProcessCell: any;

  pcSub: Subscription;
  loadSub: Subscription;
  chart1Loading = true;
  chart2Loading = true;

  lang = 'en';

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private translate: TranslateService,
    protected ref: NbDialogRef<PerformanceDetailsModal>,
    private nbAuthService: NbAuthService
  ) {
    super(nbAuthService);
    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.lang = lang;
  }

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
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



  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }

  }

  /**
   * LISTENERS
   */

listenForSelectedProcessCellChanges() {
  this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.selectedProcessCell = selectedProcessCell;
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub =  this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.setHelpPage();
      }
    });
  }
}

