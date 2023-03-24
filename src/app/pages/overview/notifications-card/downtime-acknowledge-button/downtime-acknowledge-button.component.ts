import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { DowntimeAcknowledgeModalComponent } from '../downtime-acknowledge-modal/downtime-acknowledge-modal.component';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { Subscription } from 'rxjs';
import { DowntimeData } from '../../../../@core/data/downtime';
import { ConfigurationData } from '../../../../@core/data/configuration';
import { ConfigService } from '../../../../@core/utils/services';

@Component({
  selector: 'ngx-downtime-acknowledge-button',
  styleUrls: ['./downtime-acknowledge-button.component.scss'],
  templateUrl: './downtime-acknowledge-button.component.html',
})

export class DowntimeAcknowledgeButtonComponent implements OnInit {

  selectedProcessCell: undefined;
  hierarchy: any;
  notJustifiedDowntimesCount = 0;
  serverNotificationstopic: string = 'ApiGateway';
  signalRListenersNames: string[] = ['DowntimeCountChanged'];
  badgeThreshold: number;

  showButton = false;

  defaultValue = false;
  pcSub: Subscription;
  loadSub: Subscription;

  constructor(
    private dialogService: NbDialogService,
    private downtimeService: DowntimeData,
    private configurationService: ConfigurationData,
    private config: ConfigService,
    private authService: NbAuthService,
  ) { }

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
    this.listenForSelectedProcessCellChanges();
    this.badgeThreshold = this.config.getBadgeThreshold();

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();

      if (payload.features.includes("CanJustifyDowntime")) {
        this.showButton = true;
      }
    });
  }

  updateComponent() {
    this.getNotJustifiedDowntimesCount()
  }

  async getModalData() {
    const promise = new Promise((resolve) => {
      const self = this;
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        if (canBypass) {
          if (this.selectedProcessCell !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            this.downtimeService.getDowntimesByProcessCellPath(this.selectedProcessCell.path).then(downtimes => {
              const data = [...downtimes];
              data.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))

              const filteredData = data.filter(el => el.isJustified === this.defaultValue);
              resolve(filteredData);
            });
          }
        } else {
          const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
          this.downtimeService.getDowntimesByDisplayGroupId(fIlteredDisplayGroup).then(downtimes => {
            const data = [...downtimes];
            data.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))
            const filteredData = data.filter(el => el.isJustified === this.defaultValue);
            resolve(filteredData);
          });
        }
      });
    });
    return promise;
  }

  async openDowtimeAcknowledge() {
    // const data = await this.getModalData();
    const obj = {
      // selectedProcessCell: this.selectedProcessCell,
      // hierarchy: this.hierarchy,
      // initialData: data,
    };
    const ref = this.dialogService.open(DowntimeAcknowledgeModalComponent, {
      context: obj as Partial<DowntimeAcknowledgeModalComponent>,
    });
    ref.onClose.subscribe(e => {
      this.getNotJustifiedDowntimesCount();
    });
    ref.onBackdropClick.subscribe(e => {
      this.getNotJustifiedDowntimesCount();
    });
  }

  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  getComponentSignalRListenersNames(){
    return this.signalRListenersNames;
  }

  getComponentSignalRSubscriptionType(){
    return "groups";
  }

  DowntimesCountChanged(message) {
    this.updateComponent();
  }

  getNotJustifiedDowntimesCount() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.configurationService.canBypassDisplayGroup().then(canBypass=>{
      if (canBypass) {
        if (this.selectedProcessCell !== undefined) {
          const el = Object.assign(this.selectedProcessCell)

          this.downtimeService.getNotJustifiedDowntimesCountByProcessCellPath(el.path).then(notJustifiedDowntimesCount => {

            this.notJustifiedDowntimesCount = +notJustifiedDowntimesCount;
          });
        }
      } else {
        const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
        this.downtimeService.getNotJustifiedDowntimesCountByDisplayGroupId(fIlteredDisplayGroup).then(notJustifiedDowntimesCount => {
          this.notJustifiedDowntimesCount = +notJustifiedDowntimesCount;
        });
      }
    });
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

  waitConfigurationServiceLoaded() {
    this.pcSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateComponent();
      }
    });
  }

  listenForSelectedProcessCellChanges() {
    this.loadSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateComponent();
      }
    });
  }

}
