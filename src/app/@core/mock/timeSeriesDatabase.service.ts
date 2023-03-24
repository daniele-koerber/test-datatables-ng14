import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { TimeSeriesDatabaseData } from '../data/timeSeriesDatabase';
import { ConfigService, ApiService } from '../utils/services';
import { DatePipe } from '@angular/common';

@Injectable()
export class TimeSeriesDatabaseService extends TimeSeriesDatabaseData {

  timeSeriesDatabaseUrl: string;
  timeSeriesDatabaseName: string;

  constructor(
    private config: ConfigService,
    private api: ApiService,
    private toastService: NbToastrService,
  ) {
    super();
    this.timeSeriesDatabaseUrl = this.config.getTimeSeriesDatabaseUrl();
    this.timeSeriesDatabaseName = this.config.getTimeSeriesDatabaseName();
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

}
