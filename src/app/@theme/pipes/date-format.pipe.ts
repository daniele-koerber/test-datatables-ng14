import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

import { SessionService } from '../../@core/utils/services/session.service';
import { ConfigService } from '../../@core/utils/services/config.service';
import { BollingerBands } from '@amcharts/amcharts5/.internal/charts/stock/indicators/BollingerBands';

@Pipe({
    name: 'DateFormatPipe',
})
export class DateFormatPipe implements PipeTransform {
  localeId;

  constructor(
    private translate: TranslateService,
    private session: SessionService,
    private config: ConfigService,
  ) {}


  transform(value: string, timeWithSeconds:boolean, showOnlyDate:boolean) {
    // const locales = this.config.getLocales();
    // let l = locales.find(el => el === navigator.language);
    // l = l ?? locales[0];
    const lang = this.config.getSelectedLanguage();
    var datePipe = new DatePipe(lang);

    if (timeWithSeconds) {
      var res = datePipe.transform(value, 'shortDate') + ' ' + datePipe.transform(value, 'mediumTime')
    } else {
      var res = datePipe.transform(value, 'short')
      if (res && showOnlyDate) {
        res = res.split(',')[0];
      }
    }
    return res ;
  }
}
