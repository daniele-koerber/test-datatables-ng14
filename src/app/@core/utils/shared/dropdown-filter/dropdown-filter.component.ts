import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../services/config.service';
import { registerLocaleData } from '@angular/common';

import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';

@Component({
  selector: 'ngx-dropdown-datetime',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss']
})

export class DropdownDateTimeComponent implements OnInit, OnChanges {

  @ViewChild('customDateRangePicker') customDateRangePicker: ElementRef | undefined;

  @Output() dateTimeChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() rangeChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() startTime;
  @Input() endTime;
  @Input() numberOfDays;
  @Input() numberOfDaysString;

  @Input() pinText: string = '';
  @Output() pinTextChange = new EventEmitter<string>();

  pipe;

  hidebutton: boolean = true;
  defaultStartTime: any ;
  defaultEndTime: any ;
  dateTimePin: string = '';
  dateRange: any = {};
  localeId
  useDefaultFilter = false

  constructor(

    private translate: TranslateService,
    private config: ConfigService,
    ) {
      const langsArr = config.getLanguages().map(el => el.key);
      translate.addLangs(langsArr);
      translate.setDefaultLang(langsArr[0]);
      const browserLang = translate.getBrowserLang();
      const lang = config.getSelectedLanguage();
      translate.use(lang);
  }

  ngOnChanges(changes: SimpleChanges){
    if(this.startTime && this.endTime ){
      this.setup(this.startTime, this.endTime);
    }else {
      this.defaultFilter();
    }
  }

  setup(startTime, endTime){
    // if(!this.numberOfDays && !this.numberOfDaysString){
    //   this.numberOfDays = -7;
    //   this.numberOfDaysString = 'REPORT.Last_7_days';
    //  }
    this.localeId = this.translate.currentLang;
    let locale;
    switch (this.localeId) {
      case 'it':
        locale = localeIt
      break;
      case 'es':
        locale = localeEs
      break;
      default:
        locale = localeEn
      break;
    }
    registerLocaleData(locale, this.localeId);  
    
          const pipe = new DatePipe(this.translate.currentLang);
          this.defaultStartTime = pipe.transform( new Date((new Date().setDate(new Date().getDate() - 30))), 'yyyy-MM-dd');
          this.defaultEndTime = pipe.transform( new Date(), 'yyyy-MM-dd');
          // if (!this.defaultStartTime) { this.defaultStartTime = pipe.transform(startTime, 'yyyy-MM-dd'); }
          // if (!this.defaultEndTime) { this.defaultEndTime = pipe.transform(endTime, 'yyyy-MM-dd'); }
          this.startTime = pipe.transform(startTime, 'yyyy-MM-dd');
          this.endTime = pipe.transform(endTime, 'yyyy-MM-dd');

          this.numberOfDaysString = 'REPORT.Last_30_days'
          if(this.pinText !== '' && this.pinText !== null && this.pinText !== undefined ) {
            this.numberOfDaysString = this.pinText;
          }

          this.translate.get(this.numberOfDaysString).subscribe((translation) => {
              this.dateTimePin = translation + ' - ' + pipe.transform(this.startTime, 'mediumDate') + ' - ' + pipe.transform(this.endTime, 'mediumDate');
              this.hidebutton =  true;
          });
        
    //    this.selectRange(this.numberOfDaysString, this.numberOfDays)

  }

  ngOnInit(): void {
    $( 'body' ).on( 'click', (event) => {
      if (!event.target.parentElement?.id.includes('filter') && !event.target?.id.includes('input-label')) {
        this.hidebutton =  true;
      }
    });
  }

  selectRange(text: string, days: number) {
    if(text){
      let start = new Date();
      let end = new Date();

      if (days === 0) {
        let x = 0;
        switch (text) {
          case 'REPORT.Current_month':
            this.endTime = end;

            start.setDate(1);
            start.setHours(0,0,0)
            this.startTime = start;
            break;

          case 'REPORT.Previous_month':
            end.setDate(end.getDate() - end.getDate());
            end.setHours(23, 59, 59);
            this.endTime = end;

            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            start.setHours(0, 0, 0);
            this.startTime = start;
            break;

          case 'REPORT.Current_year':
            this.endTime = end;
            this.startTime = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0);
            break;

          case 'REPORT.Previous_year':
            this.endTime = new Date(new Date().getFullYear(), 0, 0, 23, 59, 59, 0);
            this.startTime  = new Date(new Date().getFullYear() - 1, 0, 1, 0, 0, 0, 0);
            break;
        }
      } else {
        this.endTime = new Date();

        start.setDate(start.getDate() + days);
        start.setHours(0, 0, 0);
        this.startTime = start;
      }

      this.rangeChanged.emit({text, days})
      // if (!this.useDefaultFilter) {
        this.notifyChanged();
      // }
      this.useDefaultFilter = false;
      const pipe = new DatePipe(this.translate.currentLang);

      this.translate.get(text).subscribe((translation) => {
          this.dateTimePin = translation + ' - ' + pipe.transform(this.startTime, 'mediumDate') + ' - ' + pipe.transform(this.endTime, 'mediumDate');
          this.pinText = text;
          this.pinTextChange.emit(this.pinText);
          this.hidebutton =  true;
      });
    }
  }

  defaultDateRange() {
    const self = this;
   // this.translate.get('REPORT.Last_30_days').subscribe((translation) => {
      // const pipe = new DatePipe(this.translate.currentLang);
      // this.dateTimePin = translation + ' - ' +
      // pipe.transform(self.dateRange.start, 'mediumDate') + ' - ' +
      // pipe.transform(self.dateRange.end, 'mediumDate');
      self.selectRange('REPORT.Last_30_days', -30)
      // this.notifyChanged();
   // });

  }

  customDateRange(event) {
    if (event.end !== undefined) {
      this.dateRange = event;
      const pipe = new DatePipe(this.translate.currentLang);
      this.translate.get('REPORT.Customized').subscribe((translation) => {
          this.dateTimePin = translation + ' - ' + pipe.transform(this.dateRange.start, 'mediumDate') + ' - ' + pipe.transform(this.dateRange.end, 'mediumDate');
          this.pinText = 'REPORT.Customized';
          this.pinTextChange.emit(this.pinText);
          this.startTime = this.dateRange.start;
          this.endTime = this.dateRange.end;
          this.notifyChanged();
      });
    } else {
      // this.notifyChanged();
    }

  }

  removeFilter() {
    this.dateTimePin = '';
    this.pinText = '';
    // this.dateRange.start = this.defaultStartTime;
    // this.dateRange.end = this.defaultEndTime;

    // this.startTime = this.defaultStartTime;
    // this.endTime = this.defaultEndTime;

    if(this.customDateRangePicker !== undefined)
      (this.customDateRangePicker as any).queue = undefined;
    this.defaultDateRange();
  }

  defaultFilter() {
    this.useDefaultFilter = true;
    this.defaultDateRange();
  }

  notifyChanged(){
    var newData = {startTime: this.startTime, endTime: this.endTime};
    this.dateTimeChanged.emit(newData);
  }

  movePicker() {
    const interval = setInterval(() => {
      if ($('nb-datepicker-container').parent()[0] !== undefined) {
        $('nb-datepicker-container').parent().attr('style', 'pointer-events: auto; top: 220px; left: 270px; ransform: translateY(5px)')
          this.hidebutton =  true;
          clearInterval(interval);
      }
    }, 10);
  }
}
