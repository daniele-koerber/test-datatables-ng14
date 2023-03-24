import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { SchedulingData } from '../../../@core/data/scheduling';
import { SaveModalConfirmComponent } from '../../../@core/utils/shared/save-modal-confirm/save-modal-confirm.component';
import {TranslateService} from '@ngx-translate/core';

import { ConfigurationData } from '../../../@core/data/configuration';
import { DowntimeData } from '../../../@core/data/downtime';
import { ConfigService } from '../../../@core/utils/services/config.service';

import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ngx-edit-shift-data-modal',
  styleUrls: ['./edit-shift-data-modal.component.scss'],
  templateUrl: './edit-shift-data-modal.component.html',
})

export class EditShiftDataModalComponent implements OnInit, OnDestroy {

  @Input() team: any;
  @Input() shiftStartDatetime: any;
  @Input() shiftEndDatetime: any;
  @Input() refDate: any;
  @Input() slotId: number;

  selectedProcessCell: any;
  data: any = [];
  currentTeam: any;
  selectedProcessCellPath: any;
  No_production = "";
  pcSub: Subscription;
  loadSub: Subscription;

  helpLinkPage = 'edit-shift-data-modal';
  helpPageLinkDestination = '#';

  endDate ;
  startDate ;

  endTime = '';
  startTime = '';

  endTimeInitial = '';
  startTimeInitial = '';

  touched = false;

  constructor(
    private configurationService: ConfigurationData,
    private scheduleService: SchedulingData,
    private dialogService: NbDialogService,
    protected ref: NbDialogRef<EditShiftDataModalComponent>,
    private downtimeService: DowntimeData,
    public translate: TranslateService,
    private config: ConfigService,
    private toastService: NbToastrService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());

    this.translate.get("COMMON.No_production").subscribe((No_production) => {
      this.No_production = No_production;
    });
    this.setHelpPage();
  }

  openHelp () { 
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { 
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngOnInit() {

    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
    if ( isNaN(this.team.id)) {this.team.id = null; }
    this.currentTeam = this.team;

    this.startTime = new Date(this.shiftStartDatetime).toLocaleTimeString('it-IT')
    this.endTime = new Date(this.shiftEndDatetime).toLocaleTimeString('it-IT')

    this.startTimeInitial = this.startTime;
    this.endTimeInitial = this.endTime;



  }

  updateDateTimeData() {
    const startDay = new Date(this.shiftStartDatetime).getDate()
    const endDay = new Date(this.shiftEndDatetime).getDate()
    let startDate = new Date(this.shiftStartDatetime)
    let endDate = new Date(this.shiftEndDatetime)

    this.startDate = new Date(startDate.setHours( Number(this.startTime.split(':')[0]),Number(this.startTime.split(':')[1]),0,0 ));
    this.endDate = new Date(endDate.setHours( Number(this.endTime.split(':')[0]),Number(this.endTime.split(':')[1]),0,0 ));

    if (startDay == endDay) {
      if (this.startTime > this.endTime && this.startTime > this.endTimeInitial) {
          this.startDate.setDate(this.startDate.getDate() - 1);
      } else if (this.startTime > this.endTime) {
        this.endDate.setDate(this.endDate.getDate() + 1);
      }
    } else {
      if (this.startTime < this.endTime && this.startTime < this.endTimeInitial)  {
        this.startDate.setDate(this.startDate.getDate() + 1);
      } else if (this.startTime < this.endTime) {
        this.endDate.setDate(this.endDate.getDate() - 1);
      }
    }


  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.selectedProcessCellPath = this.selectedProcessCell.path;
    this.updateTable();
  }

  updateTable() {
    this.scheduleService.getTeams().then(teams => {
      this.data = [...teams];
      this.data.unshift({id: null, teamName: this.No_production});
    });
  }

  saveChanges() {
    const pipe = new DatePipe(this.translate.currentLang);
    this.dialogService.open(SaveModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          // this.shiftStartDatetime = this.shiftStartDatetime.split('T')[0] + 'T' + this.startTime;
          // this.shiftEndDatetime = this.shiftEndDatetime.split('T')[0] + 'T' + this.endTime;
          this.updateDateTimeData()
          const startDate = this.startDate.toISOString()
          const endDate = this.endDate.toISOString()
          this.scheduleService.editShiftData(this.selectedProcessCellPath, this.currentTeam, startDate, endDate,this.refDate, this.slotId).then(
            (success) => { // Success
              this.translate.get(['CALENDAR.SUCCESS', 'CALENDAR.Team_Assign_updated']).subscribe((translations) => {
                this.showToast('top-right', 'success', translations['CALENDAR.SUCCESS'], (success && success.error.hasOwnProperty('type') && success.error.type === 'UserDismiss' ? success.detail :  translations['CALENDAR.Team_Assign_updated']), (success && success.hasOwnProperty('type') && success.error.type === 'UserDismiss' ? true : false));
              });
              this.ref.close(true);
            },
            (err: any) => { // Error
              this.translate.get(["CALENDAR.WARNING","SHARED.Errors_submitting_data"]).subscribe((translations) => {
                this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? err.error.detail :  translations["SHARED.Errors_submitting_data"]), (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? true : false));
              });
            },
          );
        }
      },
      error: (err: any) => {
        this.ref.close();
      },
    });
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  closeModal() {
    this.ref.close(true);
  }

  ngOnDestroy(): void {
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
   }

  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub = this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
