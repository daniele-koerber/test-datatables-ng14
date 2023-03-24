import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogRef } from '@nebular/theme';

import { ConfigService } from '../../../services/config.service';

import { Subscription } from 'rxjs';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { MachineStatusInMinutes } from '../../../models/presentation/integration/machine-status-in-minutes';
import { BaseClass } from '../../../common/base-class/base-class';

@Component({
  selector: 'ngx-line-status-modal',
  styleUrls: ['./line-status-modal.component.scss'],
  templateUrl: './line-status-modal.component.html',
})

export class LineStatusModalComponent extends BaseClass implements OnInit, OnChanges {
  // [x: string]: any;

  @Input() processCellPath: any;
  @Input() dateStart;
  @Input() dateEnd;
  @Input() id;
  @Input() isReport = false;
  @Input() machinesStatus: MachineStatusInMinutes;
  @Input() showMachineInUse
  @Input() isDetails = true;

  helpPageLinkDestination = '#';

  tabs: any[] = [
    { id: 1, url: 'line-status_Machine_Status', title: 'Machines_Status', disabled: true },
    { id: 2, url: 'line-status_Machine_Status_History', title: 'Machines_Status_History', disabled: true },
    { id: 3, url: 'line-status_batch-modal-details', title: 'Machines_Speed', disabled: true },
    { id: 4, url: 'line-Machines_Status_in_Minutes', title: 'Status_Analysis', disabled: true },
    { id: 5, url: 'alarms-summary', title: 'Alarms_summary', disabled: true },
    { id: 6, url: 'live-data-chart', title: 'Live_Data', disabled: true},
  ];
  selectedTabTitle = null;
  batch: any;
  parentComponentName: string = 'overview';
  shift;
  pcSub: Subscription;
  loadSub: Subscription;
  statusInMinuteschartId = "statusInMinutesDetailschartId"
  serverError: boolean;

  alarmsSummaryChartData: any;
  alarmsSummaryMaxTot: number = 0;
  alarmsSummaryStart: any;
  alarmsSummaryEnd: any;

  constructor(
    public translate: TranslateService,
    private config: ConfigService,
    private nbAuthService: NbAuthService,
    protected ref: NbDialogRef<LineStatusModalComponent>,
  ) {
    super(nbAuthService);
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());

    this.translate.get([...this.tabs.map(el => 'SHARED.' + el.title)]).subscribe((translations) => {
      for (const [index, [title, value]] of Object.entries(Object.entries(translations))) {
        this.tabs[index].title = value;
      }
    });
    this.setHelpPage(this.tabs[0].url);

  }
  ngOnChanges(changes: SimpleChanges): void {
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

  ngOnInit(): void {
    this.isLoading = true;
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
