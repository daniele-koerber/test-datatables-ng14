import { Pipe, PipeTransform } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'HoursToDays'
})
export class HoursToDaysPipe implements PipeTransform {

  constructor(public translate: TranslateService) {}

  transform(value: any, hoursT, daysT, dayT) {
    let hours;
    let arrV = [];
    if(value && value.includes(':')) {
      arrV = value.split(':');
      hours = +(value.includes(':') ? arrV[0] : value);
      var ndays = Math.floor(hours / 24);
      var nhours = Math.floor(hours) % 24;

      const ret = ((ndays > 0 ? ndays + (ndays > 1 ? ` ${daysT}, ` : ` ${dayT}, ` ) : ``) + (nhours) + (arrV[1] ? `:` + arrV[1] : ``) + ` ${hoursT}`);
      return ret;
    }
  }
}
