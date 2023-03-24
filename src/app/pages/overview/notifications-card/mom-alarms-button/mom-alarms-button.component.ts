import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { MomAlarmsModalComponent } from '../mom-alarms-modal/mom-alarms-modal.component';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { Subscription } from 'rxjs';
import { IntegrationData } from '../../../../@core/data/integration';
import { ConfigurationData } from '../../../../@core/data/configuration';
import { ConfigService } from '../../../../@core/utils/services';

@Component({
  selector: 'ngx-mom-alarms-button',
  styleUrls: ['./mom-alarms-button.component.scss'],
  templateUrl: './mom-alarms-button.component.html',
})

export class MomAlarmsButtonComponent implements OnInit {

  selectedProcessCell: undefined;
  hierarchy: any;
  alarmsCount = 0;
  serverNotificationstopic: string = 'ApiGateway';
  signalRListenersNames: string[] = ['MomAlarmsChanged'];
  badgeThreshold: number;
  showButton = false;
  pcSub: Subscription;
  loadSub: Subscription;

  constructor(
    private dialogService: NbDialogService,
    private integrationService: IntegrationData,
    private configurationService: ConfigurationData,
    private config: ConfigService,
    private authService: NbAuthService,
  ) { }

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
    this.listenForSelectedProcessCellChanges();
    this.badgeThreshold = 1;

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanStartStopProduction")) {
        this.showButton = true;
      }
    });
  }

  getComponentSignalRSubscriptionType(){
    return "groups";
  }

  updateComponent() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.configurationService.canBypassDisplayGroup().then(canBypass=>{
      if (canBypass) {
        if (this.selectedProcessCell !== undefined) {
          const el = Object.assign(this.selectedProcessCell)

          this.integrationService.getMomAlarmsNotificationsCountByProcessCellPath(el.path).then(alarms => {

            this.alarmsCount = +alarms;
          });
        }
      } else {
        const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
        this.integrationService.getMomAlarmsNotificationsCountByDisplayGroupId(fIlteredDisplayGroup).then(alarms => {
          this.alarmsCount = +alarms;
        });
      }
    });
  }

  async openAlarmsModal() {
    // const data = await this.getModalData();
    const obj = {
      // selectedProcessCell: this.selectedProcessCell,
      // hierarchy: this.hierarchy,
      // initialData: data,
    };
    const ref = this.dialogService.open(MomAlarmsModalComponent, {
      context: obj as Partial<MomAlarmsModalComponent>,
    });
    ref.onClose.subscribe(e => {
      this.getMomAlarmsNotificationsCount();
    });
    ref.onBackdropClick.subscribe(e => {
      this.getMomAlarmsNotificationsCount();
    });
  }

  async getModalData() {
    const promise = new Promise((resolve) => {
      const self = this;
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        if (canBypass) {
          if (self.selectedProcessCell !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            this.integrationService.getMomAlarmsNotificationsByProcessCellPath(self.selectedProcessCell.path).then(alarm => {
              const data = [...alarm];
              resolve(data);
            });
          }
        } else {
          const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
          this.integrationService.getMomAlarmsNotificationsByDisplayGroupId(fIlteredDisplayGroup).then(alarms => {
            const data = [...alarms];
            resolve(data);
          });
        }
      });
    });
    return promise;
  }

  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  getComponentSignalRListenersNames(){
    return this.signalRListenersNames;
  }

  DowntimesCountChanged(message) {
    this.updateComponent();
  }

  getMomAlarmsNotificationsCount() {
    if (this.selectedProcessCell !== undefined) {
      const el = Object.assign(this.selectedProcessCell)
        this.integrationService.getMomAlarmsNotificationsCountByProcessCellPath(el.path).then(count => {
        this.alarmsCount = +count;
      });
    }
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
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateComponent();
      }
    });
  }

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateComponent();
      }
    });
  }

}
