import { catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Component, Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../../services';
import { ExportWorkerData } from '../../../../@core/data/exportworker';
import { Subscription } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-progress-bar',
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({
        height: '60px',
        width: '300px',
        opacity: 1,
      })),
      state('closed', style({
        height: '60px',
        width: '40px',
        opacity: 0.8,
      })),
      transition('open => closed', [
        animate('0.2s')
      ]),
      transition('closed => open', [
        animate('0.2s')
      ]),
    ]),
  ],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {

  // @Input() progressValue: number = 0;

  signalRSubscription: Subscription;
  signalRListenersNames: string[] = ['GetExportPercentage'];
  serverNotificationstopic: string = 'ApiGateway';

  showProgress = false;
  progressValue = 0;
  isOpen = true;

  exportReportId = { path: null };
  cancelButtonClicked: boolean = false;

  constructor(
    public translate: TranslateService,
    private config: ConfigService,
    private toastService: NbToastrService,
    private exportWorkerService: ExportWorkerData,
    ) {
      const langsArr = config.getLanguages().map(el => el.key);
      translate.addLangs(langsArr);
      translate.setDefaultLang(langsArr[0]);
      const browserLang = translate.getBrowserLang();
      translate.use(config.getSelectedLanguage());

      this.exportWorkerService.showProgressBar_Listener.subscribe((showProgressBar) => {
        // if(this.showProgress !== showProgressBar && showProgressBar === true){
          this.exportReportId = { path: sessionStorage.getItem('exportReportId')};
        // }
        this.showProgress = (showProgressBar || (this.exportReportId ? true : false));
        this.progressChanged();
      })
    }

    cancelExportReport(withError = false){
      this.cancelButtonClicked = true;
      this.progressValue = 0;
      const taskId = sessionStorage.getItem('exportReportId');
      this.exportWorkerService.cancelExportReport(taskId).then((res) =>{
        this.exportReportId = { path: null };
        sessionStorage.removeItem('exportReportId');
        this.exportWorkerService.ExportInProgress(false);
        this.showProgress = false;

        if(withError){
          this.translate.get(["CALENDAR.WARNING","REPORT.Something_went_wrong_during_the_download"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], translations["REPORT.Something_went_wrong_during_the_download"], false);
          });
        }

        this.translate.get(["CALENDAR.SUCCESS","REPORT.Download_canceled"]).subscribe((translations) => {
          this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (res && res.hasOwnProperty('type') && res.type === 'UserDismiss' ? res.detail :  translations["REPORT.Download_canceled"]), (res && res.hasOwnProperty('type') && res.type === 'UserDismiss' ? true : false));
        });

      }).catch((error) => {
        this.exportReportId = { path: null };
        sessionStorage.removeItem('exportReportId');
        this.exportWorkerService.ExportInProgress(false);
        this.showProgress = false;

        this.translate.get(["CALENDAR.WARNING","REPORT.Something_went_wrong_during_the_download"]).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["REPORT.Something_went_wrong_during_the_download"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
        });
      })
  }


  getComponentSignalRListenersNames(){
    return this.signalRListenersNames;
  }
  getComponentTopic() {
    return this.serverNotificationstopic;
  }

  progressChanged() {
    if(this.exportReportId.path) {
      this.exportWorkerService.getProgressPercentuage(this.exportReportId.path)
      .then((progress) => {

        this.progressValue = +progress;

        if(+this.progressValue > 0) { this.showProgress = true; }
        if(+progress === 100 ) {
            window.setTimeout(() =>{ // 1 sec delay tue to server problems
              this.showProgress = false;
            this.downloadReportFIle(this.exportReportId.path);
            }, 1000)

        }
        if(+this.progressValue === -1 && this.cancelButtonClicked === false)
        {
          this.showProgress = false;
          sessionStorage.removeItem('exportReportId');
          this.exportWorkerService.ExportInProgress(false);

          this.translate.get(["CALENDAR.WARNING","REPORT.Something_went_wrong_during_the_download"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], translations["REPORT.Something_went_wrong_during_the_download"], false);
          });
        }

        this.cancelButtonClicked = false

      })
      .catch(error => {
        console.log("Progress bar report export error",error)
        this.cancelExportReport(true)
      })
    } else {
      this.showProgress = false;
    }
  }
  getComponentSignalRSubscriptionType(){
    return "group";
  }

  downloadReportFIle(id){
    this.exportWorkerService.getFile(id).subscribe((data) => {

      var downloadURL = window.URL.createObjectURL(data);
      this.exportReportId = { path: null };
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "report.xlsx";
      link.click();

      sessionStorage.removeItem('exportReportId');
      this.exportWorkerService.ExportInProgress(false);

      this.translate.get(["CALENDAR.SUCCESS","REPORT.Download_succeeded"]).subscribe((translations) => {
        this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], translations["REPORT.Download_succeeded"], false);
      });
    });
  }

    inProgress = true;
    intervalId: number;

    showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
      const duration = (destroyByClick === true ? 0 : 3000);
      this.toastService.show(msg, title, {position, status, duration, destroyByClick});
    }


  toggle() {
    this.isOpen = !this.isOpen;
  }

}
