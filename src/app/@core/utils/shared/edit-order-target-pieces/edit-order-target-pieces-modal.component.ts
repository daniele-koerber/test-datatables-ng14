import { Component, Input, AfterViewInit } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { SchedulingData } from '../../../data/scheduling';
import { ConfigService } from '../../services';
import {NbAuthJWTToken, NbAuthService} from '@nebular/auth';

@Component({
  selector: 'ngx-edit-order-target-pieces',
  templateUrl: './edit-order-target-pieces-modal.component.html',
  styleUrls: ['./edit-order-target-pieces-modal.component.scss']
})
export class EditOrderTargetPiecesModalComponent implements AfterViewInit{

  @Input() actualTargetQuantity: number = 0;
  @Input() uom: string = '';
  @Input() orderId: string = '';

  helpLinkPage = 'edit-order-target-quantity';
  helpPageLinkDestination = '#';

  adjustedTargetQuantity: number = 0;

  lang = null;
  isLoading = false;
  canEditTargetQuantity = false;

  constructor(
    private schedulingService: SchedulingData,
    private config: ConfigService,
    public translate: TranslateService,
    private toastService: NbToastrService,
    protected adjustRef: NbDialogRef<EditOrderTargetPiecesModalComponent>,
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
      if (payload.features.includes("CanEditTargetQuantity")) {
        this.canEditTargetQuantity = true;
      }
    });

  }
  ngAfterViewInit(): void {
    this.adjustedTargetQuantity = this.actualTargetQuantity;

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
    this.schedulingService.editOrderData(this.orderId, this.adjustedTargetQuantity === null ? 0 : this.adjustedTargetQuantity).then(() => {
      this.adjustRef.close(this.adjustedTargetQuantity);
      this.isLoading = false;
      }, (error) => {
        // this.adjustRef.close();
        this.isLoading = false;
        this.translate.get(['CALENDAR.WARNING', 'CALENDAR.Errors_adjusting_quantities']).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["Errors_adjusting_quantitiesErrors_adjusting_quantities"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));

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
