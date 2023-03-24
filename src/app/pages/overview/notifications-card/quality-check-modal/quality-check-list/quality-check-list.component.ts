import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { ConfigService } from '../../../../../@core/utils/services';
import { ConfigurationData } from '../../../../../@core/data/configuration';
import { QualityData } from '../../../../../@core/data/quality';

@Component({
  selector: 'ngx-quality-check-list',
  styleUrls: ['./quality-check-list.component.scss'],
  templateUrl: './quality-check-list.component.html',
})

export class QualityCheckListComponent implements OnInit {

  isLoading: boolean;
  helpLinkPage = 'quality-check-list';
  helpPageLinkDestination = '#';

  qualityForms = [];
  qualityForm = null;
  pcSub: Subscription;
  loadSub: Subscription;
  selectedProcessCell;

  constructor(
    private config: ConfigService,
    private configurationService: ConfigurationData,
    protected ref: NbDialogRef<QualityCheckListComponent>,
    private qualityService: QualityData,
    private toastService: NbToastrService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {

    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
  }

  add(){
    const self = this;
    this.qualityService.generateQualityForm(this.selectedProcessCell.path, this.qualityForm).then(
      res => {
        this.translate.get(["CALENDAR.SUCCESS","CALENDAR.QualityFormAdded"]).subscribe((translations) => {
          self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (res && res.hasOwnProperty('type') && res.type === 'UserDismiss' ? res.detail :  translations["CALENDAR.QualityFormAdded"]), (res && res.hasOwnProperty('type') && res.type === 'UserDismiss' ? true : false));
        });
        self.ref.close(true);
      },
      err => {
        this.translate.get(["CALENDAR.WARNING","CALENDAR.ErrorGeneratingQualityForm"]).subscribe((translations) => {
          self.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? err.error.detail :  translations["CALENDAR.ErrorGeneratingQualityForm"]), (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? true : false));
        });
      }
    )
  }

  closeModal() {
    this.ref.close(true);
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  handleChange(evt) {
    // var target = evt.target;
    if (evt.value) {
      this.qualityForm = evt.value;
    }
  }

  async updateTargetList(){
    this.isLoading = true;
    this.selectedProcessCell = await this.configurationService.getSelectedProcessCell();
    if (this.selectedProcessCell !== undefined) {
      this.qualityService.getGenerableQualityForms(this.selectedProcessCell.path).then(res => {
        this.qualityForms = res;
        this.isLoading = false;
        return;
      })
    }

  }


  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if (selectedProcessCell !== undefined) {
        this.updateTargetList();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.setHelpPage();
        this.updateTargetList();
      }
    });
  }

}

