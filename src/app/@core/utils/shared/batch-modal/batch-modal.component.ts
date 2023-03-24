import { Component, Input, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogRef } from '@nebular/theme';
import { BatchStatus, ConfigService } from '../../../../@core/utils/services/config.service';

import { Router } from '@angular/router';
import { ConfigurationData } from '../../../data/configuration';

@Component({
  selector: 'ngx-batch-modal',
  styleUrls: ['./batch-modal.component.scss'],
  templateUrl: './batch-modal.component.html',
})

export class BatchModalComponent implements OnInit{

  @Input() batch: any;

  goToHelpDestination;
  helpLinkPage = 'batch-modal-calendar';

  helpPageLinkDestination = '#';

  tabs: any[] = [
    { id:1, title: 'Data', disabled: true, url: 'batch-modal-details-calendar' },
    { id:2, title: 'Parameters', disabled: true, url: 'batch-modal-parameters' },
    { id:3, title: 'OEE', disabled: true, url: 'batch-modal-OEE' },
    { id:4, title: 'Quality_Checks', disabled: true, url: 'batch-modal-quality' },
    { id:5, title: 'Downtimes', disabled: true, url: 'batch-modal-downtime' },
  ];

  selectedTabTitle = null;
  processCellPath = null;
  selectedProcessCell

  constructor(
    public translate: TranslateService,
    private config: ConfigService,
    private router: Router,
    private configurationService: ConfigurationData,
    protected ref: NbDialogRef<BatchModalComponent>,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());

    let pc
    const extras = JSON.parse(localStorage.getItem('reportDetailsExtras'));
    if (extras && this.router.url !== '/pages/calendar' && this.router.url !== '/pages/overview') {
      pc = extras.processCell;
    }
    if(!this.selectedProcessCell) {
      this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    }
    this.processCellPath = (pc ? pc : this.selectedProcessCell.path);

    this.translate.get([...this.tabs.map(el => 'CALENDAR.' + el.title)]).subscribe((translations) => {
      for (const [index, [title, value]] of Object.entries(Object.entries(translations))) {
        this.tabs[index].title = value;
      }
    });
  }

  ngOnInit(): void {



  }

  isBatchActive(batchStatus: BatchStatus): boolean {
    return this.config.isBatchActive(batchStatus);
  }
  isBatchCompleted(batchStatus: BatchStatus): boolean {
    return this.config.isBatchCompleted(batchStatus);
  }
  

  openHelp () {
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage(link) {
    this.setHelpPageLinkDestination(this.config.getHelpPage(link, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  setTabDisabled(event) {
    if (event.index !== undefined) {
      setTimeout(() => {
        this.tabs[event.index].disabled = event.disabled;
      });
    }
  }

  onChangeTab(event) {
    this.selectedTabTitle = event.tabTitle;
    const el = this.tabs.find(el => el.id === event.tabId);
    this.setHelpPage(el.url);
  }

  closeModal() {
    this.ref.close(true);
  }


}
