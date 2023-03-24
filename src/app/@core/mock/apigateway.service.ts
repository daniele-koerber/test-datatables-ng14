import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { ApiGatewayData } from '../data/apigateway';
import { ConfigService, ApiService } from '../utils/services';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class ApiGatewayService extends ApiGatewayData {

  apiGatewayServerUrl: string;
  lang

  constructor(
    private config: ConfigService,
    private api: ApiService,
    private toastService: NbToastrService,
    public translate: TranslateService,
  ) {
    super();
    this.apiGatewayServerUrl = this.config.getapiGatewayServerUrl();

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang)
  }

}
