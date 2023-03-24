import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { SchedulingData } from '../../../@core/data/scheduling';
import { SaveModalConfirmComponent } from '../../../@core/utils/shared/save-modal-confirm/save-modal-confirm.component';
import {TranslateService} from '@ngx-translate/core';
import { Router } from '@angular/router';

import { ConfigurationData } from '../../../@core/data/configuration';
import { DowntimeData } from '../../../@core/data/downtime';
import { ConfigService } from '../../../@core/utils/services/config.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-shift-details-modal',
  styleUrls: ['./shift-details-modal.component.scss'],
  templateUrl: './shift-details-modal.component.html',
})

export class ShiftDetailsModalComponent implements OnInit, OnDestroy {

  @Input() team: any;
  @Input() shiftStartDatetime: any;
  @Input() shiftEndDatetime: any;

  selectedProcessCell: any;
  loadSub: Subscription;

  helpLinkPage = 'view-shift-report';
  helpPageLinkDestination = '#';
  No_production = '';

  constructor(
    private configurationService: ConfigurationData,
    private dialogService: NbDialogService,
    protected ref: NbDialogRef<ShiftDetailsModalComponent>,
    public translate: TranslateService,
    private config: ConfigService,
    private router: Router,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    this.translate.get("COMMON.No_production").subscribe((No_production) => {
      this.No_production = No_production;
    });

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

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
    if ( isNaN(this.team.id)) {this.team.id = null; }

  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell().path;
  }


  closeModal() {
    this.ref.close(true);
  }

  cancel() {
    this.ref.close();
  }

  goToReport() {
    const extras = {
      processCell: this.selectedProcessCell,
      domain: false, // Order or Team
      from: this.shiftStartDatetime,
      to: this.shiftEndDatetime,
      team: this.team?.teamName,
      prevPage: "calendar",
    };
    localStorage.setItem('reportDetailsExtras',JSON.stringify(extras));
    this.router.navigate(['pages/report-details']);
    this.ref.close();

  }


  ngOnDestroy(): void {

    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
   }

  /**
   * LISTENERS
   */


  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
