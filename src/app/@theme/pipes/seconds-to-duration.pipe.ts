import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'SecondsToDurationPipe' })
export class SecondsToDurationPipe implements PipeTransform {

  transform(value: any, dayT, hourT, minT, secT) {
    if(value ) {
      var days = Math.floor(value/(24*60*60)); // Math.floor() rounds a number downwards to the nearest whole integer, which in this case is the value representing the day
      var hours = Math.floor((value/(60*60)) % 24); // Math.floor() rounds a number downwards to the nearest whole integer
      var mins = secT ? Math.floor((value/60) % 60) : Math.round((value/60) % 60);
      var seconds = Math.round(value - (days*24*60*60) - (hours*60*60) - (mins*60));

      // const ret = ((days > 0 ? days + (days > 1 ? ` ${daysT}, ` : ` ${dayT}, ` ) : ``) + (hours) + (mins ? `:` + mins : ``) + ` ${hoursT}`);
      const dayString = days > 0 ? days + `${dayT} `: ``
      const hoursString = hours > 0 ? hours + `${hourT} `: ``
      const minString = mins > 0 || (!secT && !hoursString && !dayString) ? mins + `${minT} `: ``
      const secString = ((seconds > 0) || !minString && !hoursString && !dayString) && secT ? seconds + `${secT}`: ``

       const ret = dayString + hoursString + minString + secString
      return ret;
    }
  }

}
