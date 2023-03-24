import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ConfigService } from '../../services';

@Component({
  selector: 'ngx-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements AfterViewInit, OnChanges{


  @Input() min: Date = null;
  @Input() max: Date = null;

  @Input() date: Date = new Date();


  @Output() dateChange: EventEmitter<Date> = new EventEmitter<Date>();

  disableLeftButton: boolean = false;
  disableRightButton: boolean = false;
  dateString: any;

  momentMinDate: moment.Moment = null;
  momentMaxDate: moment.Moment = null;

  formControl = new FormControl(moment());
  pipe: DatePipe;

  constructor(
    private translate: TranslateService,
    private config: ConfigService,
    ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const lang = config.getSelectedLanguage();
    translate.use(lang)
    this.pipe = new DatePipe(this.translate.currentLang);
   }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dateString = this.pipe.transform(this.date, 'd MMM y');
      this.formControl.setValue(moment(this.date));

      this.momentMinDate = moment(this.min);
      this.momentMaxDate = moment(this.max);
      this.disableLeftButton = this.min ? this.pipe.transform(this.min, 'd MMM y') === this.dateString : false;
      this.disableRightButton = this.max ? this.pipe.transform(this.max, 'd MMM y') === this.dateString : false;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.min?.currentValue){
      this.momentMinDate = moment(changes?.min?.currentValue);
      this.disableLeftButton = this.min ? this.pipe.transform(this.min, 'd MMM y') === this.dateString : false;
    }
    if(changes?.max?.currentValue){
      this.momentMaxDate = moment(changes?.max?.currentValue);
      this.disableRightButton = this.max ? this.pipe.transform(this.max, 'd MMM y') === this.dateString : false;
    }
  }

  dateChanged(value) {
    this.date = new Date(value);
    this.formControl.setValue(moment(value));

    this.dateString = '';

    setTimeout(() => {
      this.dateString = this.pipe.transform(value, 'd MMM y');

      this.disableLeftButton = this.min ? this.pipe.transform(this.min, 'd MMM y') === this.dateString : false;
      this.disableRightButton = this.max ? this.pipe.transform(this.max, 'd MMM y') === this.dateString : false;
    }, 0);

    this.dateChange.emit(this.date);
  }

  dateIncremets(value) {
    setTimeout(() => {
      const newDate: Date = this.date;
      newDate.setDate(this.date.getDate() + value);
      this.dateString = this.pipe.transform(newDate, 'd MMM y');
      this.date = newDate;

      this.formControl.setValue(moment(newDate));

      this.disableLeftButton = this.min ? this.pipe.transform(this.min, 'd MMM y') === this.dateString : false;
        this.disableRightButton = this.max ? this.pipe.transform(this.max, 'd MMM y') === this.dateString : false;
        this.dateChange.emit(this.date)
    }, 0);
  }

}
