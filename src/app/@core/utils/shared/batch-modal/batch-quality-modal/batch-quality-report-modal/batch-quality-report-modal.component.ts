import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { DynamicFormsData } from '../../../../../data/dynamic-forms';
import { QualityData } from '../../../../../data/quality';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../../../services/config.service';

@Component({
  selector: 'ngx-batch-quality-report-modal',
  styleUrls: ['./batch-quality-report-modal.component.scss'],
  templateUrl: './batch-quality-report-modal.component.html',
})

export class BatchQualityReportModalComponent implements OnInit {

  @Input() qualityCheck: any;
  @Input() row: any;

  constructor(
    public translate: TranslateService,
    private config: ConfigService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
  }

  ngOnInit() {
  }

}
