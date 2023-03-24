import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,OnDestroy } from '@angular/core';
import { NbDialogRef, NbDialogService,NbToastrService } from '@nebular/theme';
import { SchedulingData } from '../../../../@core/data/scheduling';
import { SaveModalConfirmComponent } from '../../../../@core/utils/shared/save-modal-confirm/save-modal-confirm.component';
import {TranslateService} from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { ConfigurationData } from '../../../../@core/data/configuration';
import { ConfigService } from '../../../../@core/utils/services/config.service';

import { Subscription } from 'rxjs';
import { EditShiftDefinitionComponent } from '../edit-shift-definition/edit-shift-definition.component';
import { ImportExportShiftsModalComponent } from '../../import-export-shifts-modal/import-export-shifts-modal.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ngx-shift-definition',
  styleUrls: ['./shift-definition.component.scss'],
  templateUrl: './shift-definition.component.html',
})

export class ShiftDefinitionComponent  implements OnInit, OnChanges, OnDestroy{

  @Output() changeData: EventEmitter<boolean> = new EventEmitter<any>();
  @Input() teams: any[];
  @Input() from;
  @Input() to;

  data: any = [];
  selectedProcessCell: any;

  helpLinkPage = 'shift-definition';
  helpPageLinkDestination = '#';

  shiftStartTime = [];
  currentTeams: any[];
  curentShiftDefinitions: any = [{days : []}];
  selectedProcessCellPath: any;
  No_production = '';
  dtTrigger: Subject<any> = new Subject<any>();
  pcSub: Subscription;
  loadSub: Subscription;

  shifts: any[] = [];
  // [{
  //   day: 1,
  //   slotId: 0,
  //   slotStart: '6:30',
  //   slotEnd: '18:30',
  //   teamName: 'Team A',
  //   teamColor: this.config.getColor('primary'),
  // },
  // {
  //   day: 2,
  //   slotId: 0,
  //   slotStart: '6:30',
  //   slotEnd: '18:30',
  //   teamName: 'Team B',
  //   teamColor: this.config.getColor('accent_3'),
  // },
  // {
  //   day: 3,
  //   slotId: 0,
  //   slotStart: '6:30',
  //   slotEnd: '18:30',
  //   teamName: 'Team C',
  //   teamColor: this.config.getColor('success'),
  // }];
  shiftDefinitions: any;
  isLoading = false;
  clonedShiftDefinitions: any;
  lang

  constructor(
    private scheduleService: SchedulingData,
    private configurationService: ConfigurationData,
    private dialogService: NbDialogService,
    public translate: TranslateService,
    private config: ConfigService,
    private toastService: NbToastrService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    this.lang = config.getSelectedLanguage();
    translate.use(this.lang);
    this.translate.get("COMMON.No_production").subscribe((No_production) => {
      this.No_production = No_production;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.currentTeams = [...this.teams];
    this.currentTeams.unshift({id: null, teamName: this.No_production});

  }
  helloWorld() {
    alert('Hello world!');
}

  ngOnInit() {
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();
    this.getShiftDefinitions();

  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    if (this.pcSub) {
      this.pcSub.unsubscribe();
    }
    if (this.loadSub) {
      this.loadSub.unsubscribe();
    }
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.selectedProcessCellPath = this.selectedProcessCell.path;
  }

  getShiftDefinitions() {
    this.isLoading = true;
    this.scheduleService.getShiftDefinitions(this.selectedProcessCellPath).then( shiftDefinitions => {
      this.shiftDefinitions = shiftDefinitions[shiftDefinitions.length - 1];

      this.shiftDefinitions.shiftsRules.forEach(shift => {
        const foundTeam = this.teams.find(team => team.teamName === shift.teamName);
        shift.team = foundTeam ? foundTeam : '';
        shift.teamId = foundTeam?.id;
        shift.teamColor = foundTeam?.teamColor;
        shift.teamName = foundTeam ? shift.teamName : 'No Production';

        shift.startTime = new Date('1970-01-01T' + shift.slotStart + 'Z')
        .toLocaleTimeString(this.lang,
          {timeZone:'UTC',hour:'numeric',minute:'numeric'}
        );

        shift.endTime = new Date('1970-01-01T' + shift.slotEnd + 'Z')
        .toLocaleTimeString(this.lang,
          {timeZone:'UTC',hour:'numeric',minute:'numeric'}
        );

      });
      this.shifts = this.shiftDefinitions?.shiftsRules;
      this.isLoading = false;
    });
  }

  openImportExportShiftDialog() {
    const pipe = new DatePipe(this.translate.currentLang);

    let lastDay: Date = new Date();
    lastDay.setDate(new Date(this.shiftDefinitions.referenceStartDate).getDate() + this.shiftDefinitions?.shiftsRules[this.shiftDefinitions?.shiftsRules.length - 1]?.day - 1)

    const obj = {
      from: this.shiftDefinitions.referenceStartDate,
      to: pipe.transform(lastDay, 'yyyy-MM-ddT00:00:00'),
    };
    this.dialogService.open(ImportExportShiftsModalComponent, {
      context: obj as Partial<ImportExportShiftsModalComponent>,
    }).onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.getShiftDefinitions();
          // this.updateCalendar(this.from, this.to);
        }
      },
      error: (err: any) => {},
    });
  }

  editShiftDefinitions() {
    this.isLoading = true;
    const pipe = new DatePipe(this.translate.currentLang);
    let firstDay = new Date().setDate(new Date().getDate() + 1);
    this.scheduleService.cloneShiftDefinitions(this.selectedProcessCellPath, pipe.transform(firstDay , 'MM-dd-yyyy')).then( shiftDefinitions => {
      this.clonedShiftDefinitions = shiftDefinitions;
      this.clonedShiftDefinitions.shiftsRules.forEach(shift => {
        const foundTeam = this.teams.find(team => team.teamName === shift.teamName);
        shift.team = foundTeam ? foundTeam : '';
        shift.teamId = foundTeam?.id;
        shift.teamColor = foundTeam?.teamColor;
        shift.teamName = foundTeam ? shift.teamName : 'No Production';
      });
      this.isLoading = false;

      const obj = {
        teams: this.teams,
        shiftDefinitionDays: this.clonedShiftDefinitions,
      };
      this.dialogService.open(EditShiftDefinitionComponent, {
        context: obj as Partial<EditShiftDefinitionComponent>,
      })
      .onClose.subscribe({
        next: (closed: any) => {
          if (closed) {
            this.getShiftDefinitions();
          }
        },
        error: (err: any) => {
        },
      });
    }, () => {this.isLoading = false; });
  }

  createNewShiftDefinition() {
    const obj = {
      teams: this.teams,
      isNew: true,
    };
    this.dialogService.open(EditShiftDefinitionComponent, {
      context: obj as Partial<EditShiftDefinitionComponent>,
    })
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.getShiftDefinitions();
        }
      },
      error: (err: any) => {
      },
    });
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.pcSub =this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
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
