import { Pipe, PipeTransform } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'TicksToDurationPipe'
})
export class TicksToDurationPipe implements PipeTransform {

  constructor(public translate: TranslateService) {}

  transform(value: any, dayT, hourT, minT, secT) {
    if(value || value === 0) {
      var days = Math.floor(value/(24*60*60*10_000_000)); // Math.floor() rounds a number downwards to the nearest whole integer, which in this case is the value representing the day
      var hours = Math.floor((value/(60*60*10_000_000)) % 24); // Math.floor() rounds a number downwards to the nearest whole integer
      var mins =  secT ? 
                  Math.floor((value/(60*10_000_000)) % 60) : 
                  (
                    Math.round((value/(60*10_000_000)) % 60) < 60 ?
                    Math.round((value/(60*10_000_000)) % 60) : 
                    Math.floor((value/(60*10_000_000)) % 60)
                  
                  );
      var seconds = secT ? Math.round(value - (days*24*60*60*10_000_000) - (hours*60*60*10_000_000) - (mins*60*10_000_000)) : 0;

      const dayString = days > 0 ? days + `${dayT} `: ``
      const hoursString = hours > 0 ? hours + `${hourT} `: ``
      const minString = mins > 0 || (!secT && !hoursString && !dayString) ? mins + `${minT} `: ``
      const secString = ((seconds > 0) || !minString && !hoursString && !dayString) && secT ? seconds + `${secT}`: ``

      const ret = dayString + hoursString + minString + secString
      return ret;
    }
  }
}
