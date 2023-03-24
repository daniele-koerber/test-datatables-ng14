import { EventEmitter, Injector, Input, Output, Component } from '@angular/core';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';

export interface IBaseClass{
  isLoading?: boolean
  isOrder?: boolean,
  isShift?: boolean,
  isLine?: boolean,
  processCellPath?: string,
  noData?: boolean,
  serverError?: boolean,
  machinePath?: string,
  canExportData?: boolean,
  dateStart?: string,
  dateEnd?: string
}

@Component({
  template: '',
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class BaseClass implements IBaseClass{

  @Input() isLoading: boolean;
  @Input() isOrder: boolean;
  @Input() isShift: boolean;
  @Input() isLine: boolean;
  @Input() processCellPath: string;
  @Input() noData: boolean;
  @Input() serverError: boolean;
  @Input() machinePath: string;
  @Input() canExportData: boolean;
  @Input() dateStart: string;
  @Input() dateEnd: string;

 /**
  * This is a generic emiter that can be use to trigger a method
  */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() click: EventEmitter<any> = new EventEmitter<any>();

  /**
  * This is a generic emiter that can be use to trigger a method
  */
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

  /**
  * This emiter should indicate when a chart/operation/call has completed its loading
  */
  @Output() loadingFinished: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private authService: NbAuthService){
    this.checkFeatures();
  }

  checkFeatures(){
    this.authService.getToken().subscribe((token: NbAuthJWTToken) => {
      const payload = token.getPayload();
      if (payload.features.includes("CanExportData")) {
        this.canExportData = true;
      }
    });
  }

  /**
  *   Converts seconds to a "hh mm" format
  * @param {number} seconds - seconds are to be pased as a number
  * @returns {string} the return is a string formated as such ->  "hh mm"
  */
  public secondsToHm(seconds: number): string {
    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    const hDisplay = h > 0 ? h + 'h ' : '';
    const mDisplay = m > 0 ? m + 'min' : '';
    return hDisplay + mDisplay ;
  }

  /**
  *  Converts seconds to a "hh mm ss" format
  * @param {number} seconds - seconds are to be pased as a number
  * @returns {string} the return is a string formated as such ->  "hh mm ss"
  */
  secondsToHms(seconds: number): string {
    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    const hDisplay = h > 0 ? h + 'h ' : '';
    const mDisplay = m > 0 ? m + 'min ' : '';
    const sDisplay = s > 0 ? s + 's' : '';
    return hDisplay + mDisplay + sDisplay ;
  }

  /**
  * Converts ticks to a "hh:mm" format
  * @param {number} ticks
  * @returns {string} the return is a string formated as such ->  "hh:mm"
  */
  ticksTohours(ticks: number) {
    const hh = (Math.round((ticks / 10_000_000) * 10) / 10) / 60 / 60;
    let mm: number;
    if (+hh.toString().split('.')[1]) {
      mm = (Math.round((+hh.toString().split('.')[1].substring(0, 2) * 60) / 100));
    } else {
      mm = 0;
    }
    const MM =  mm > 9 ? '' + mm : '0' + mm;
    return   hh.toString().split('.')[0] + ':' + MM;
  }


  public ticksToDuration(ticks: number, dayT: string, hourT: string, minT: string, ) {
    if(ticks ) {
      var days = Math.floor(ticks/(24*60*60*10000000)); // Math.floor() rounds a number downwards to the nearest whole integer, which in this case is the value representing the day
      var hours = Math.floor((ticks/(60*60*10000000)) % 24); // Math.floor() rounds a number downwards to the nearest whole integer
      var mins = Math.round((ticks/(60*10000000)) % 60);

      const dayString = days > 0 ? days + `${dayT} `: ``
      const hoursString = hours > 0 ? hours + `${hourT} `: ``
      const minString = mins > 0 ? mins + `${minT}`: ``

       const ret = dayString + hoursString + minString
      return ret;
    }
  }

  public secondsToDuration(seconds: number, dayT: string, hourT: string, minT: string, ) {
    if(seconds ) {
      
      var days = Math.floor(seconds/(3600*24)); // Math.floor() rounds a number downwards to the nearest whole integer, which in this case is the value representing the day
      var hours = Math.floor((seconds % (3600*24)) / 3600); // Math.floor() rounds a number downwards to the nearest whole integer
      var mins = Math.round(seconds % 3600 / 60);

      const dayString = days > 0 ? days + `${dayT} `: ``
      const hoursString = hours > 0 ? hours + `${hourT} `: ``
      const minString = mins + `${minT}`;

      const ret = dayString + hoursString + minString;
      return ret;
     
    } else {
      return `0${minT}`;
    }
  }

  /**
  * Converts ticks to a "hh:mm" format
  * @param {number} ticks
  * @returns {string} the return is a string formated as such ->  "hh:mm:ss"
  */
  displayTime(ticks: number): string {
    ticks = Math.floor(ticks / 10000);
    const hh = Math.floor(ticks / 3600);
    const mm = Math.floor((ticks % 3600) / 60);
    const ss = ticks % 60;
    return( this.pad(hh, 2) + ':' + this.pad(mm, 2) + ':' + this.pad(ss, 2) );
  }

  /**
  *   Converts seconds to a "hh mm" format
  * @param {number} secs - seconds are to be pased as a number
  * @returns {string} the return is a string formated as such ->  "2h 1min 30s"
  */
  timeConvert(secs) {
    const num = secs/60;
    const hours = (num / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.floor(minutes);
    const seconds = (minutes - rminutes) * 60;
    const rseconds = Math.floor(seconds);
    return (rhours !== 0 ? `${rhours}h` : '') + ` ${rminutes}min` + ` ${rseconds}s`;
  }

  /**
  * Return number with "x" times decimal
  * @param {number} value
  * @param {number} decimal
  * @returns {number} the return a trimmed number (ex. 10.2 -> 10)
  */
  trim(value: number, decimal: number){
    const exp = Math.pow(10, decimal);
    return Math.round(value * exp) / exp;
  }

  private pad(n, width) {
    const m = n + '';
    return m.length >= width ? m : new Array(width - m.length + 1).join('0') + m;
  }

  /**
  * Check the input field of number type: if the field has a char/text, delete it
  * @param {any} value
  * @returns {number} the return a number or empty
  */
  public validateInputAsNumber(value: any){
    return value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^0[^.]/, '0');
  }
}
