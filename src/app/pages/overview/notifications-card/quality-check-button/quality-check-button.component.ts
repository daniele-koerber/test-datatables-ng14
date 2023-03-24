import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { QualityCheckModalComponent } from '../quality-check-modal/quality-check-modal.component';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';
import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../../@core/data/configuration';
import { QualityData } from '../../../../@core/data/quality';
import { ConfigService } from '../../../../@core/utils/services';

@Component({
  selector: 'ngx-quality-check-button',
  styleUrls: ['./quality-check-button.component.scss'],
  templateUrl: './quality-check-button.component.html',
})

export class QualityCheckButtonComponent implements OnInit {

  selectedProcessCell: any;
  hierarchy: any;
  notDoneQualityChecksCount = 0;
  serverNotificationstopic: string = 'ApiGateway' // 'Quality';
  signalRListenersNames: string[] = ['QualityCountChanged'];
  badgeThreshold: number;

  showButton = false;

  defaultValue = false;
  pcSub: Subscription;
  loadSub: Subscription;

  constructor(
    private dialogService: NbDialogService,
    private configurationService: ConfigurationData,
    private qualityService: QualityData,
    private config: ConfigService,
    private authService: NbAuthService,
  ) { }

  ngOnInit() {
    this.waitConfigurationServiceLoaded();
    this.listenForSelectedProcessCellChanges();
    this.badgeThreshold = this.config.getBadgeThreshold();

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanFillQualityForm")) {
        this.showButton = true;
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


  updateComponent() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.getNotDoneQualityCheckNumber();
  }


  getNotDoneQualityCheckNumber() {
    this.configurationService.canBypassDisplayGroup().then(canBypass=>{
      if (canBypass) {
        if (this.selectedProcessCell !== undefined) {
          this.qualityService.getNotDoneQualityChecksCountByProcessCellPath(this.selectedProcessCell.path).then(notDoneQualityChecksCount => {
            this.notDoneQualityChecksCount = +notDoneQualityChecksCount;
          });
        }
      } else {
        const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
        this.qualityService.getNotDoneQualityChecksCountByDisplayGroupId(fIlteredDisplayGroup).then(notDoneQualityChecksCount => {
          this.notDoneQualityChecksCount = +notDoneQualityChecksCount;
        });
      }
    });


  }

  async openQualityCheck() {
    // const data = await this.getModalData();
    const obj = {
      // selectedProcessCell: this.selectedProcessCell,
      // hierarchy: this.hierarchy,
      // initialData: data,
    };
    const ref = this.dialogService.open(QualityCheckModalComponent, {
      context: obj as Partial<QualityCheckModalComponent>,
    });
    ref.onClose.subscribe(e => {
      this.getNotDoneQualityCheckNumber();
    });
    ref.onBackdropClick.subscribe(e => {
      this.getNotDoneQualityCheckNumber();
    });
  }

  async getModalData() {
    const promise = new Promise((resolve) => {
      const self = this;
      this.configurationService.canBypassDisplayGroup().then(canBypass=>{
        if (canBypass) {
          if (this.selectedProcessCell !== undefined) {
            const showAll = false;
            this.qualityService.getQualityChecksByProcessCellPath(this.selectedProcessCell.path, showAll).then(qualityCheks => {
              const data = [...qualityCheks];
              const filteredData = data.filter(el => el.isDone === this.defaultValue);
              resolve(filteredData);
            });
          }
        } else {
          const fIlteredDisplayGroup = this.configurationService.getFIlteredDisplayGroup();
          this.qualityService.getQualityChecksByDisplayGroupId(fIlteredDisplayGroup).then(qualityCheks => {
            const data = [...qualityCheks];
            const filteredData = data.filter(el => el.isDone === this.defaultValue);
            resolve(filteredData);
          });
        }
      });
    });
    return promise;
  }



  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateComponent();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateComponent();
      }
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

  QualityCountChangedFn(message) {
    this.updateComponent();
  }

}
