import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import { ConfigurationData } from '../../../../@core/data/configuration';
import { ConfigService } from '../../../../@core/utils/services/config.service';
import { ApiService } from '../../../../@core/utils/services/api.service';
import { SchedulingData } from '../../../../@core/data/scheduling';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'ngx-export-shifts-modal',
  styleUrls: ['./export-shifts-modal.component.scss'],
  templateUrl: './export-shifts-modal.component.html',
})



export class ExportShiftsModalComponent implements OnChanges{
  lang
  @Input() from;
  @Input() to;

  selectedProcessCell: any;
  min: any;

  formControlFrom = new FormControl(moment());
  formControlTo = new FormControl(moment());

  constructor(
    private configurationService: ConfigurationData,
    public translate: TranslateService,
    private config: ConfigService,
    private scheduleService: SchedulingData,
    private api: ApiService,
  ) {
    this.min = new Date().setDate(new Date().getDate() - 1);
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    this.lang = this.translate.currentLang;
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
  }

  ngOnChanges() {
    if(this.from && this.to) {
      const f = new Date(this.from);
      f.setDate(f.getDate() + 1);
      this.from = this.from.substring(0, 10);
      this.to = this.to.substring(0, 10);

      this.formControlFrom.patchValue(moment(new Date(this.from)));
      this.formControlTo.patchValue(moment(new Date(this.to)));
    }
  }

  updateFrom(event) {
    const pipe = new DatePipe(this.translate.currentLang);
    this.from = pipe.transform(event, 'yyyy-MM-dd');
  }

  updateTo(event) {
    const pipe = new DatePipe(this.translate.currentLang);
    this.to = pipe.transform(event, 'yyyy-MM-dd');
  }

  exportShifts() {
    const schedulingServerUrl = this.config.getSchedulingServerUrl();
    if(this.from !== '' && this.to !== '') {
      const from = new Date(this.from).toISOString();
      const t = new Date(this.to);
      t.setDate(t.getDate() + 1);
      const to = new Date(t).toISOString();
      this.api.download(`${schedulingServerUrl}${this.lang}/processcells/${this.selectedProcessCell.path}/teamassignment/from/${from}/to/${to}/overrides`).subscribe(data => {
        const downloadURL = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = 'TeamAssignementExport.xlsx';
        link.click();
      })
    }
  }

  // fromChanged(value) {
  //   if (this.from !== value) {
  //     this.from = value;
  //     this.fromChange.emit(this.from);
  //   }
  // }

  // toChanged(value) {
  //   if (this.to !== value) {
  //     this.to = value;
  //     this.toChange.emit(this.to);
  //   }
  // }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
  }


}
