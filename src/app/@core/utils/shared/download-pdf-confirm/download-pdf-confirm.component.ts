import { Component,Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../services/config.service';


@Component({
  selector: 'ngx-download-pdf-confirm',
  styleUrls: ['./download-pdf-confirm.component.scss'],
  templateUrl: './download-pdf-confirm.component.html',
})

export class DownloadPdfConfirmComponent {

  constructor(
    protected ref: NbDialogRef<DownloadPdfConfirmComponent>,
    public translate: TranslateService,
    private config: ConfigService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
  }

  cancel() {
    this.ref.close();
  }

  submit() {
    this.ref.close(true);
  }

}
