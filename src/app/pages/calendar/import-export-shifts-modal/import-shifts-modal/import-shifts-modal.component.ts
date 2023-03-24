import { Component, ViewChild, ElementRef } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { FormGroup, FormControl } from '@angular/forms';
import {FileValidator} from '../../../../@core/utils/upload/file-input.validator'

import { ConfigurationData } from '../../../../@core/data/configuration';
import { ConfigService } from '../../../../@core/utils/services/config.service';

import { Subscription } from 'rxjs';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { ImportExportShiftsModalComponent } from '../import-export-shifts-modal.component';

@Component({
  selector: 'ngx-import-shifts-modal',
  styleUrls: ['./import-shifts-modal.component.scss'],
  templateUrl: './import-shifts-modal.component.html',
})

export class ImportShiftsModalComponent {

  selectedProcessCell: any;
  lang
  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;
  files: any[] = [];
  enableUpload = true;
  loadSub: Subscription;

  formCSV = new FormGroup({
    shift: new FormControl('', [FileValidator.validate]),
  });

  constructor(
    private configurationService: ConfigurationData,
    public translate: TranslateService,
    private config: ConfigService,
    private toastService: NbToastrService,
  ) {

    this.waitConfigurationServiceLoaded();
  }

  importShifts(event) {
    if (event.successful) {
      // this.translate.get(['CALENDAR.SUCCESS', 'CALENDAR.Shift_definition_imported_successfully']).subscribe((translations) => {
      //   this.showToast('top-right', 'success', translations['CALENDAR.SUCCESS'], (event.success && event.success.hasOwnProperty('type') && event.success.type === 'UserDismiss' ? event.success.detail :  translations['CALENDAR.Shift_definition_imported_successfully']), (event.success && event.success.hasOwnProperty('type') && event.success.type === 'UserDismiss' ? true : false));
      // });
      // this.ref.close(true);
    } else {
      // this.translate.get(['CALENDAR.WARNING', 'CALENDAR.Something_went_wrong_importing_the_shift_definition']).subscribe((translations) => {
      //   this.showToast('top-right', 'danger', translations['CALENDAR.WARNING'], (translations.type !== undefined && translations.type === 'UserDismiss' ? translations.detail :  translations['CALENDAR.Something_went_wrong_importing_the_shift_definition']), (event.error && event.error.hasOwnProperty('type') && event.error.error.type === 'UserDismiss' ? true : false));
      // });
    }
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
  }

  uploading($event) {
    this.enableUpload = !$event;
  }

  ngOnDestroy(): void {
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
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
