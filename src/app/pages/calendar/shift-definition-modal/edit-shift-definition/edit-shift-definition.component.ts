import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { NbDialogRef, NbDialogService,NbToastrService } from '@nebular/theme';
import { SchedulingData } from '../../../../@core/data/scheduling';
import { SaveModalConfirmComponent } from '../../../../@core/utils/shared/save-modal-confirm/save-modal-confirm.component';
import {TranslateService} from '@ngx-translate/core';

import { ConfigurationData } from '../../../../@core/data/configuration';
import { ConfigService } from '../../../../@core/utils/services/config.service';

import { DatePipe } from '@angular/common';
import { DeleteModalConfirmComponent } from '../../../../@core/utils/shared/delete-modal-confirm/delete-modal-confirm.component';
import { InfoModalComponent } from '../../../../@core/utils/shared/info-modal/info-modal.component';

@Component({
  selector: 'ngx-edit-shift-definition',
  styleUrls: ['./edit-shift-definition.component.scss'],
  templateUrl: './edit-shift-definition.component.html',
})

export class EditShiftDefinitionComponent  implements OnInit, OnChanges{

  helpLinkPage = 'edit-shift-definition';
  helpPageLinkDestination = '#';

  today;

  @ViewChild('daysContainer') private daysContainer: ElementRef;

  @Input() teams: any[];
  @Input() isNew: boolean = false;
  @Input() shiftDefinitionDays: any = { referenceStartDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                                        shiftsRules: [{
                                          day: 1,
                                          slotEnd: '00:00',
                                          slotStart: '00:00',
                                          team: '',
                                          teamColor: null,
                                          teamId: null,
                                          teamName: 'No Production',
                                        }]};


  No_production: any;
  currentTeams: any[];
  date: string | number | Date;

  shiftsDividedByDay: any;
  selectedProcessCell: any;
  selectedProcessCellPath: any;
  isLoading: boolean = true;
  Delete_shift: any;
  Delete_shift_message: any;
  Delete_shift_note: any;
  minDate: Date;

  neverShowAgain: boolean = false;
  lastDateChangeResponse: boolean = false;
  translations: any;
  rawDate: Date;

  constructor(
    private scheduleService: SchedulingData,
    private configurationService: ConfigurationData,
    private dialogService: NbDialogService,
    public translate: TranslateService,
    private config: ConfigService,
    private toastService: NbToastrService,
    protected ref: NbDialogRef<EditShiftDefinitionComponent>,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
      this.translate.get(['COMMON.No_production', 'CALENDAR.Delete_shift',
                          'CALENDAR.Are_you_sure_you_want_to_delete_this_shift?',
                          'CALENDAR.Note:_if_you_delete_the_last_shift_the_day_will_be_deleted_as_well',
                          'CALENDAR.Recalculate_Definition',
                          'CALENDAR.Do_you_want_to_recalculate_the_shift_definition_starting_from_the_actual_definition?',
                          'COMMON.No',
                          'COMMON.Yes',
                          "COMMON.Don't_ask_again"]).subscribe((translations) => {
      this.translations = translations;
      this.No_production = translations['COMMON.No_production'];
      this.Delete_shift = translations['CALENDAR.Delete_shift'];
      this.Delete_shift_message = translations['CALENDAR.Are_you_sure_you_want_to_delete_this_shift?'];
      this.Delete_shift_note = translations['CALENDAR.Note:_if_you_delete_the_last_shift_the_day_will_be_deleted_as_well'];
    });
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.selectedProcessCellPath = this.selectedProcessCell.path;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.currentTeams = [...this.teams];
    this.currentTeams.unshift({id: null, teamName: this.No_production});
  }

  ngOnInit() {
    this.isLoading = true;
    const pipe = new DatePipe(this.translate.currentLang);
    const firstDay: Date = new Date(this.shiftDefinitionDays.referenceStartDate);
    this.rawDate = firstDay;

    setTimeout(() => {
      this.date = pipe.transform(firstDay, 'd MMM y');
    }, 100);

    this.generateDayArray()
    this.setHelpPage();

    let firstDate = new Date(new Date().setDate(new Date().getDate() + 1))
    this.minDate = firstDate
    this.today = pipe.transform(firstDate, 'd MMM y');
  }

  generateDayArray() {
    const firstDay: Date = new Date(this.shiftDefinitionDays.referenceStartDate);

    this.shiftsDividedByDay = [];
    const days: number[] = [...new Set(this.shiftDefinitionDays.shiftsRules.map(shift => shift.day))] as number[];

    days.forEach(day => {
      const foundShift = this.shiftDefinitionDays.shiftsRules.filter(shift => shift.day === day);
      const dayToAdd = {
        dayNumber: day,
        date: new Date(new Date(firstDay).setDate(firstDay.getDate() + (day - 1))),
        shifts: foundShift,
      };
      this.shiftsDividedByDay.push(dayToAdd);
    });
    this.isLoading = false;
      setTimeout(() => {
        $('.center-button')[0].focus()
      }, 0);
  }


  teamChanged(shift, team) {
    shift.teamId = team.id;
    shift.teamName = team.teamName;
    shift.teamColor = team.teamColor;
  }

  addShift(day, event){

      const newShift = {
            day: day.dayNumber,
            slotEnd: '00:00',
            slotStart: '00:00',
            team: '',
            teamColor: null,
            teamId: null,
            teamName: this.No_production,
          }
      day.shifts.push(newShift);

    setTimeout(() => {
      this.daysContainer.nativeElement.scrollLeft = $('#' + day.dayNumber + '-' + (day.shifts.length - 1))[0].offsetLeft - 100;
    }, 0);

  }

  addDay(){
    const lastDay = this.shiftsDividedByDay[this.shiftsDividedByDay.length - 1];
    const newDate = new Date(new Date(lastDay.date).setDate(lastDay.date.getDate() + 1));
    const newDay = {
      date:  newDate,
      dayNumber: lastDay.dayNumber + 1,
      shifts: [{
        day: lastDay.dayNumber + 1,
        slotEnd: '00:00',
        slotStart: '00:00',
        team: '',
        teamColor: null,
        teamId: null,
        teamName: this.No_production,
      }],
    }
    this.shiftsDividedByDay.push(newDay);
    setTimeout(() => {
      this.daysContainer.nativeElement.scrollTop = this.daysContainer.nativeElement.scrollHeight;
    }, 0);
  }

  duplicateDay(day) {
    const lastDay = this.shiftsDividedByDay[this.shiftsDividedByDay.length - 1];
    const newDate = new Date(new Date(lastDay.date).setDate(lastDay.date.getDate() + 1));
    const newShifts = [];
    day.shifts.forEach(shift => {
      const shiftToAdd = { ... shift};
      shiftToAdd.day = lastDay.dayNumber + 1;
      newShifts.push({ ... shiftToAdd});
    });
    const newDay = {
      date:  newDate,
      dayNumber: lastDay.dayNumber + 1,
      shifts: newShifts,
    }
    this.shiftsDividedByDay.push(newDay);
  }

  deleteShift(day, shiftToDlete) {
    shiftToDlete.id = 'todelete';
    const obj = {
      title: this.Delete_shift,
      message: this.Delete_shift_message + '\n' + this.Delete_shift_note,
    };

    if (day.shifts.filter(shift => shift.id !== 'todelete').length === 0) {
      this.dialogService.open(DeleteModalConfirmComponent, {
      context: obj as Partial<DeleteModalConfirmComponent>,
    })
      .onClose.subscribe({
        next: (closed: any) => {
          if (closed) {
            day.shifts = day.shifts.filter(shift => shift.id !== 'todelete');
            if (day.shifts.length === 0) {

              this.shiftsDividedByDay.forEach((shiftday, index) => {
                if (shiftday.dayNumber >= day.dayNumber) {
                  shiftday.shifts = this.shiftsDividedByDay[index + 1 ]?.shifts;
                  shiftday?.shifts?.forEach(shift => {
                    shift.day = shiftday.dayNumber;
                  });
                }
              });
              this.shiftsDividedByDay.pop();
            }
          } else {
            shiftToDlete.id = '';
          }
        },
        error: (err: any) => {},
      });
    } else {
      day.shifts = day.shifts.filter(shift => shift.id !== 'todelete');
    }
  }

  changeDaysDate(date: Date) {
    const pipe = new DatePipe(this.translate.currentLang);
    this.rawDate = date;
    this.date = pipe.transform(date, 'd MMM y');

    const obj = {
      title: this.translations['CALENDAR.Recalculate_Definition'],
      message: this.translations['CALENDAR.Do_you_want_to_recalculate_the_shift_definition_starting_from_the_actual_definition?'],
      leftButton: this.translations['COMMON.No'],
      rightButton: this.translations['COMMON.Yes'],
      neverButton: this.translations["COMMON.Don't_ask_again"],
    };
    if (this.neverShowAgain) {

      if (this.lastDateChangeResponse) {
        this.isLoading = true;
        this.cloneShiftDefinitions(pipe.transform(new Date(date) , 'MM-dd-yyyy'));
      } else {
        this.isLoading = true;
        this.jumpToSelectedDay(new Date(date));
      }
    } else {

      this.dialogService.open(InfoModalComponent, {
        context: obj as Partial<InfoModalComponent>,
      }).onClose.subscribe({ next: (res: any) => {
        this.lastDateChangeResponse = res?.response ? res.response : false;
        this.neverShowAgain = res?.never ? res.never : false;

        if (this.lastDateChangeResponse) {
          this.isLoading = true;
          this.cloneShiftDefinitions(pipe.transform(new Date(date) , 'MM-dd-yyyy'));
        } else {
          this.isLoading = true;
          this.jumpToSelectedDay(new Date(date));
        }
        setTimeout(() => {
          $('.cdk-overlay-connected-position-bounding-box').remove();
        }, 100);

      }});
    }
  }

  jumpToSelectedDay(newFirstDate: Date) {
    const pipe = new DatePipe(this.translate.currentLang);
    const startingDate = new Date(this.shiftDefinitionDays.referenceStartDate);

    const diffTime = newFirstDate.getTime() - startingDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.shiftsDividedByDay.forEach(day => {
      day.date = new Date(day.date.setDate(day.date.getDate() + diffDays));
    });

    this.shiftDefinitionDays.referenceStartDate = pipe.transform(newFirstDate, 'yyyy-MM-ddT00:00:00');
    //$('.cdk-overlay-connected-position-bounding-box').remove();
    this.isLoading = false;
  }

  cloneShiftDefinitions(date) {
    this.scheduleService.cloneShiftDefinitions(this.selectedProcessCellPath, date).then(shiftDefinitions => {
      this.shiftDefinitionDays = shiftDefinitions;
      this.shiftDefinitionDays.shiftsRules.forEach(shift => {
        const foundTeam = this.teams.find(team => team.teamName === shift.teamName);
        shift.team = foundTeam ? foundTeam : '';
        shift.teamId = foundTeam?.id;
        shift.teamColor = foundTeam?.teamColor;
        shift.teamName = foundTeam ? shift.teamName : this.No_production;
      });

      this.generateDayArray();

      this.isLoading = false;
    });
  }

  saveChanges() {

    const shifts = []
    this.dialogService.open(SaveModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.isLoading = true;
          this.shiftsDividedByDay.forEach(day => {
            shifts.push(...day.shifts);
          });
          this.shiftDefinitionDays.shiftsRules = shifts;
          this.scheduleService.updateShiftDefinition(this.selectedProcessCellPath, this.shiftDefinitionDays).then(
            (success) => { // Success
              this.translate.get(['CALENDAR.SUCCESS', 'CALENDAR.Shift_definition_saved']).subscribe((translations) => {
                this.showToast('top-right', 'success', translations['CALENDAR.SUCCESS'], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations['CALENDAR.Shift_definition_saved']), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
              });
              this.isLoading = false;
              this.ref.close(true);
            },
            (error) => { // Error
              this.translate.get(['CALENDAR.WARNING', 'CALENDAR.Errors_saving_the_shift_definition']).subscribe((translations) => {
                this.showToast('top-right', 'danger', translations['CALENDAR.WARNING'], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations['CALENDAR.Errors_saving_the_shift_definition']), true);
              });
              this.isLoading = false;
            },
          );
        } else {
          this.isLoading = false;
        }
      },
      error: (err: any) => {
      },
    });
  }


  openHelp () {
    if (this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, '_blank'); }
  }
  setHelpPage() {
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }
  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }
  closeModal() {
    this.ref.close(true);
  }


  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.teamId === o2.teamId && o1.teamName === o2.teamName;
  }

}
