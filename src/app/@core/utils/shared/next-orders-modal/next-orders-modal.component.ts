import { Component, OnInit} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { NbDialogRef } from '@nebular/theme';

import { ConfigurationData } from '../../../data/configuration';
import { SchedulingData } from '../../../data/scheduling';
import { BatchModalComponent } from '../batch-modal/batch-modal.component';
import { NbDialogService } from '@nebular/theme';
import { ConfigService } from '../../services';
import {TranslateService} from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';

@Component({
  selector: 'ngx-next-orders-modal',
  styleUrls: ['./next-orders-modal.component.scss'],
  templateUrl: './next-orders-modal.component.html',
})

export class NextOrdersModalComponent implements OnInit {

  selectedProcessCell: any;
  nextOrders = [];
  batchData: any = null;
  localeId
  isLoading = false;


  serverSchedulingNotificationstopic: string = 'ApiGateway';
  signalRSchedulingListenersNames: string[] = ['BatchDataChanged'];
  pcSub: Subscription;
  loadSub: Subscription;

  goToHelpDestination;
  helpLinkPage = 'next-orders-modal';

  helpPageLinkDestination = '#';

  constructor(
    private configurationService: ConfigurationData,
    private scheduleService: SchedulingData,
    private dialogService: NbDialogService,
    private config: ConfigService,
    private translate: TranslateService,
    protected ref: NbDialogRef<NextOrdersModalComponent>,

  ) {
    this.localeId = this.translate.currentLang;
    let locale;
    switch (this.localeId) {
      case 'it':
        locale = localeIt
      break;
      case 'es':
        locale = localeEs
      break;
      default:
        locale = localeEn
      break;
    }
    registerLocaleData(locale, this.localeId);
      this.isLoading = true;
   }

  ngOnInit() {
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
    this.setHelpPage();
  }

  updateComponent() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    const index = 1;
    const count = 3;
    this.scheduleService.getNextBatches(this.selectedProcessCell.path, index, count).then(batches => {
        this.isLoading = false;
        this.nextOrders = batches;

    });
  }


  getStatusColor(val) {
    return this.config.getBatchStatusColor(this.config.getNotTranslatedBatchStatus(val));
  }

  getComponentSignalRSubscriptionType(){
    return "group";
  }
  getComponentSignalRSchedulingListenersNames(){
    return this.signalRSchedulingListenersNames;
  }

  BatchDataChanged(message) {
    this.updateComponent();
  }

  getSchedulingComponentTopic() {
    return this.serverSchedulingNotificationstopic;
  }

  gotoDetails(productionOrder:string) {

    for(var item = 0; item < this.nextOrders.length; item++){
      if (this.nextOrders[item].productionOrder === productionOrder) {
        this.batchData = this.nextOrders[item];
      }
    }


    const obj = {
      batch: this.batchData,
    };
    this.dialogService.open(BatchModalComponent, {
      context: obj as Partial<BatchModalComponent>,
    }).onClose.subscribe({
      next: (closed: any) => {
      },
      error: (err: any) => {},
    });

  }

  closeModal() {
    this.ref.close(true);
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

}
