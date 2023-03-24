import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbDateService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ConfigService } from '../../services';

@Component({
  selector: 'ngx-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

  @Input() time: string = '';
  @Output() timeChanged: EventEmitter<string> = new EventEmitter<string>();
  date: Date = new Date();

  is12H: boolean;
  realDate: moment.Moment;

  constructor(
    public translate: TranslateService,
    protected dateService: NbDateService<Date>,
    private config: ConfigService,
    ) {
      const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    this.is12H = this.isBrowserLocale12h(this.config.getSelectedLanguage());
  }

  ngOnInit(): void {
    if (this.time.split(':').length > 1) {
      this.date.setHours(+this.time.split(':')[0], +this.time.split(':')[1], 0);
      // this.realDate = this.dateService.setHours(this.date,+this.time.split(':')[0])
      // this.realDate.setMinutes(+this.time.split(':')[1], 0);
      this.realDate = moment(this.date);
    }
  }

  timeChange(event: any){
    const eventDate: Date = event.time.toDate();
    if(event.save){
      const pipe = new DatePipe(this.translate.currentLang);

      this.date = eventDate;
      this.realDate = moment(eventDate);

      this.time = pipe.transform(new Date(this.date), 'HH:mm:00');
      this.timeChanged.emit(this.time);
    }
  }

  isBrowserLocale12h(langCode) {
    return !(new Intl.DateTimeFormat(langCode, {
      hour: 'numeric'
    }).formatToParts(new Date(2020, 0, 1, 13)).find(part => part.type === 'hour').value.length === 2);
  }

}
