import { Component, Input, AfterViewInit } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { IntegrationData } from '../../../data/integration';
import { ConfigService } from '../../services';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

@Component({
  selector: 'ngx-adjust-order-pieces',
  templateUrl: './adjust-order-pieces-modal.component.html',
  styleUrls: ['./adjust-order-pieces-modal.component.scss']
})
export class AdjustOrderPiecesModalComponent implements AfterViewInit{

  @Input() goodCount: number = 0;
  @Input() rejectedCount: number = 0;
  @Input() uom: string = '';
  @Input() processCellPath: string = '';

  @Input() isStopProduction: boolean = false;

  helpLinkPage = 'adjust-order';
  helpPageLinkDestination = '#';

  adjustedgoodCount: number = 0;
  adjustedrejectedCount: number = 0;
  lang = null;
  isLoading = false;
  canAdjustPieces = false;

  saveButton = ''
  constructor(
    private integrationService: IntegrationData,
    private config: ConfigService,
    public translate: TranslateService,
    private toastService: NbToastrService,
    protected adjustRef: NbDialogRef<AdjustOrderPiecesModalComponent>,
    private authService: NbAuthService,
  ) {
    this.config.translateBatchStatus();
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    this.lang = browserLang;

    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanAdjustPieces")) {
        this.canAdjustPieces = true;
      }
    });

  }
  ngAfterViewInit(): void {
    this.translate.get(['COMMON.Save', 'SHARED.Stop_Production']).subscribe((translations) => {
      this.saveButton = !this.isStopProduction ? translations['COMMON.Save'] : translations['SHARED.Stop_Production'];
    });
  }

  cancel() {
    this.adjustRef.close();
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { console.log('helpLinkPage ==>', this.helpLinkPage);
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  submit() {
    this.isLoading = true;
    this.integrationService.addGoodPieces(this.processCellPath, this.adjustedgoodCount === null ? 0 : this.adjustedgoodCount).then(() => {
      this.integrationService.addRejectedPieces(this.processCellPath, this.adjustedrejectedCount === null ? 0 : this.adjustedrejectedCount).then(() => {
        this.adjustRef.close(true);
        this.isLoading = false;
      }, (error) => {
        this.adjustRef.close(error);
        this.isLoading = false;
        this.translate.get(['CALENDAR.WARNING', 'CALENDAR.Errors_adjusting_quantities']).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_adjusting_quantities"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
        });
      });
    }, (error) => {
      this.adjustRef.close(error);
      this.isLoading = false;
      this.translate.get(['CALENDAR.WARNING', 'CALENDAR.Errors_adjusting_quantities']).subscribe((translations) => {
        this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_adjusting_quantities"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
      });
    });
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  closeModal() {
    this.adjustRef.close(false);
  }

}
