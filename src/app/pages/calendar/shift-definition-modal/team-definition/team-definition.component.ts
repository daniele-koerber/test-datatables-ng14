import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';
import { NbToastrService, NbDialogService, NbDialogRef } from '@nebular/theme';
import { SaveModalConfirmComponent } from '../../../../@core/utils/shared/save-modal-confirm/save-modal-confirm.component';
import {TranslateService} from '@ngx-translate/core';

import { ConfigurationData } from '../../../../@core/data/configuration';
import { DeleteModalConfirmComponent } from '../../../../@core/utils/shared/delete-modal-confirm/delete-modal-confirm.component';
import { ConfigService } from '../../../../@core/utils/services/config.service';
import { Subscription } from 'rxjs';
import { SchedulingData } from '../../../../@core/data/scheduling';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';



@Component({
  selector: 'ngx-team-definition',
  styleUrls: ['./team-definition.component.scss'],
  templateUrl: './team-definition.component.html',
})

export class TeamDefinitionComponent  implements OnInit, OnChanges{

  @Output() changeData: EventEmitter<boolean> = new EventEmitter<any>();
  @Input() teams: any = [];
  selectedProcessCell: any;
  newTeamName = '';
  newTeamColor = '';
  teamsToUpdate: any = [];
  pcSub: Subscription;
  loadSub: Subscription;

  duplicateTeamName: string = '';

  colorsArray = [ this.config.getColor('primary'),
                  this.config.getColor('success'),
                  this.config.getColor('accent_3'),
                  this.config.getColor('error')];
  isLoading: boolean = true;
  errorTeam: any;
  newTeamError: boolean = false;


  constructor(
    private toastService: NbToastrService,
    private dialogService: NbDialogService,
    private scheduleService: SchedulingData,
    private configurationService: ConfigurationData,
    public translate: TranslateService,
    private config: ConfigService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isLoading = true;
    this.teamsToUpdate = this.teams;
    this.isLoading = false;
  }

  ngOnInit() {
    this.listenForSelectedProcessCellChanges();
    this.waitConfigurationServiceLoaded();

  }

  //#region TEAM MANAGEMENT


  addTeam() {
    if (this.newTeamName !== '' && this.newTeamColor !== '') {
      this.teamsToUpdate.push({teamName: this.newTeamName, teamColor: this.newTeamColor});
      this.newTeamName = '';
      this.newTeamColor = '';
    }
  }

  deleteTeam(id) {
    this.dialogService.open(DeleteModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.teamsToUpdate = this.teamsToUpdate.filter(el => el.id !== id);
          if(this.errorTeam.id === id){
            this.errorTeam = null;
          } else {
            const isFound = this.teamsToUpdate.find((el => el.teamName === this.errorTeam.teamName && el.id !== this.errorTeam.id))
            if(isFound?.teamName === undefined){
              this.duplicateTeamName = '';
              this.errorTeam = null;
            }
          }

        }
      },
      error: (err: any) => {},
    });
  }

  // TODO implemeent undo changes
  undoChanges(){
    this.teamsToUpdate = this.teams;
  }



  changeTeam(team, event){

    let isFound = this.teamsToUpdate.find((el => el.teamName === event.target.value && el.id !== team.id));
    if(isFound?.teamName !== undefined){
      this.duplicateTeamName = isFound.teamName;
      this.errorTeam = team;
    } else {
      this.duplicateTeamName = '';
      this.errorTeam = null;
    }

    team.teamName = event.target.value;


    isFound = this.teamsToUpdate.find((el => el.teamName === this.newTeamName));

    if(this.newTeamName !== '' && isFound?.teamName !== undefined){
      this.newTeamError = true;
    } else {
      this.newTeamError = false;
    }
  }

  newTeamColorChanged(value){
  }
  newTeamNameChanged(event){
    const isFound = this.teamsToUpdate.find((el => el.teamName === event.target.value));
    if(isFound?.teamName !== undefined){
      this.newTeamError = true;
    } else {
      this.newTeamError = false;
    }
  }

  saveChanges() {
    const self = this
    this.dialogService.open(SaveModalConfirmComponent)
    .onClose.subscribe({
      next: (closed: any) => {
        if (closed) {
          this.isLoading = true;
          this.addTeam();
          this.scheduleService.updateTeam(this.teamsToUpdate).then(
            (closed: any) => { // Success
              this.teams = this.teamsToUpdate;
              this.isLoading = false;
              this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Team_definition_updated"]).subscribe((translations) => {
                self.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (closed && closed.hasOwnProperty('type') && closed.error.type === 'UserDismiss' ? closed.error.detail :  translations["CALENDAR.Team_definition_updated"]), (closed && closed.error.hasOwnProperty('type') && closed.error.type === 'UserDismiss' ? true : false));
              });
            },
            (err: any) => { // Error
              this.isLoading = false;
              this.translate.get(["CALENDAR.WARNING","SHARED.Errors_submitting_data"]).subscribe((translations) => {
                self.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? err.error.detail :  translations["SHARED.Errors_submitting_data"]), (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? true : false));
              });
              this.scheduleService.getTeams().then(teams => {
                this.teams = teams;
                this.teamsToUpdate = this.teams;
                this.isLoading = false;
              });
            },
          );

        }
      },
      error: (err: any) => {

      },
    });
  }

  //#endregion


  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  updateTargetProcessCellData() {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
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
    this.isLoading = true;
    this.loadSub = this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
        this.isLoading = false;
      }
    });
  }

}
