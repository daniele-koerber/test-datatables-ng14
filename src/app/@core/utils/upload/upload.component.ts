import { Component, ViewChild, ElementRef, forwardRef, Input,  HostBinding, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConfigService } from '../../../@core/utils/services';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
// import { encryptStorage } from '../encripted-storage';

interface UploadResult {
  successful?: boolean;
  success?: any;
  error?: any;
}

@Component({
  selector: 'ngx-upload',
  styleUrls: ['./upload.component.scss'],
  templateUrl: './upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadComponent),
      multi: true
    }
  ]
})

export class UploadComponent implements ControlValueAccessor {
  @Input() uploadEnabled: boolean = true;
  @Input() lang: string;
  @Input() processCell: string;
  @Input() maintenanceId: number;
  @Input() fileFormat: string;
  @Output() uploadEvent = new EventEmitter<boolean>();
  @Output() uploadedSuccessfully = new EventEmitter<UploadResult>();
  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;


  file: any;
  progress = 0;
  user;
  userInfo;

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
    private authService: NbAuthService,
    private router: Router,
    private toastService: NbToastrService,
    public translate: TranslateService,
  ) {
    this.authService.onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.user = token.getPayload();

        } else {
          this.router.navigate(['/']);
        }
      });

  }

  sendMessage(message) {
    this.uploadEvent.emit(message)
  }

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    if(this.uploadEnabled){
      this.prepareFilesList($event);
    }
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    (files)
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile() {
    if (this.file.progress < 100) {
      return;
    }
    this.file = null;
  }



  /**
   * Simulate the upload process
   */
  uploadFiles(files: any) {
    const self = this;
    let trunk;
    const schedulingServerUrl = this.config.getSchedulingServerUrl();
    let url = `${schedulingServerUrl}${this.lang}/processcells/${this.processCell}/teamassignment/overrides/import`;
    if (this.file !== null) {
      // const httpHeaders = new HttpHeaders({
      //   'Content-Type': 'multipart/form-data',
      //   'Accept': 'application/json',


      //   // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
      //   // 'Authorization': 'Bearer ' + this.userInfo.access_token,
      // });
      let file: File = this.file;
      let data: FormData = new FormData();

      data.append('file', file, file.name);
      this.file.uploading = true;
      this.sendMessage(true)

      this.httpClient.post<any>(url, data)
        .subscribe(
          success => {
            this.file.uploadResult = '<b>File uploaded</b><br />';
            this.file.uploading = false;

            this.sendMessage(false);
            this.uploadedSuccessfully.emit({successful: true, success: success});
          },
          error => {
            this.file.uploading = false;
            this.file.uploadResult = 'File was <b>NOT</b> uploaded.<br />Please retry';

            this.uploadedSuccessfully.emit({successful: false, error: error});
            console.log("UPLOAD ERROR",error);
          }
      )}
  }


  uploadFilesSimulator(index: number) {
    if (this.file !== null) {
      setTimeout(() => {
        if (index === this.file) {
          return;
        } else {
          const progressInterval = setInterval(() => {
            if (this.file !== null) {
              if (this.file.progress === 100) {
                clearInterval(progressInterval);
                this.uploadFilesSimulator(index + 1);
              } else {
                this.file.progress += 5;
              }
            }
          }, 200);
        }
      }, 1000);
    }
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.file = item;
    }
    // this.fileDropEl.nativeElement.value = '';
    // this.uploadFilesSimulator(0);
    this.uploadFiles(files);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }


  value: any;
  onChange = (_) => {};
  onTouched = () => {};

  writeValue(value) {}
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }


  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

}
