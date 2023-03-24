import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfigurationData } from '../../../@core/data/configuration';
import { ConfigService } from '../../../@core/utils/services/config.service';
import { FileValidator } from '../../../@core/utils/upload/file-input.validator';

@Component({
  selector: 'ngx-import-export-shifts-modal',
  styleUrls: ['./import-export-shifts-modal.component.scss'],
  templateUrl: './import-export-shifts-modal.component.html',
})


export class ImportExportShiftsModalComponent {

  teams: any = [];
  selectedProcessCell: any;
  selectedProcessCellPath: any;

  @Input() from;
  @Input() to;

  helpLinkPage = 'import-export-shifts-modal';
  helpPageLinkDestination = '#';
  lang: string;

  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;
  files: any[] = [];
  enableUpload = true;
  loadSub: Subscription;

  formCSV = new FormGroup({
    shift: new FormControl('', [FileValidator.validate]),
  });

  constructor(
    protected ref: NbDialogRef<ImportExportShiftsModalComponent>,
    public translate: TranslateService,
    private config: ConfigService,
    private configurationService: ConfigurationData,
    private toastService: NbToastrService,
    ) {
      this.config.translateOrderStatus();
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
    this.setHelpPage();
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

  importShifts(event) {
    if (event.successful) {
      this.translate.get(['CALENDAR.SUCCESS', 'CALENDAR.Shift_definition_imported_successfully']).subscribe((translations) => {
        this.showToast('top-right', 'success', translations['CALENDAR.SUCCESS'], (event.success && event.success.hasOwnProperty('type') && event.success.type === 'UserDismiss' ? event.success.detail :  translations['CALENDAR.Shift_definition_imported_successfully']), (event.success && event.success.hasOwnProperty('type') && event.success.type === 'UserDismiss' ? true : false));
      });
      this.ref.close(true);
    } else {
      this.translate.get(['CALENDAR.WARNING', 'CALENDAR.Something_went_wrong_importing_the_shift_definition']).subscribe((translations) => {
        this.showToast('top-right', 'danger', translations['CALENDAR.WARNING'], (translations.type !== undefined && translations.type === 'UserDismiss' ? translations.detail :  translations['CALENDAR.Something_went_wrong_importing_the_shift_definition']), (event.error && event.error.hasOwnProperty('type') && event.error.error.type === 'UserDismiss' ? true : false));
      });
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

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
