import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { NbDialogRef,NbToastrService } from '@nebular/theme';
import { ConfigurationData } from '../../../@core/data/configuration';
import { SchedulingData } from '../../../@core/data/scheduling';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../../@core/utils/services/config.service';

@Component({
  selector: 'ngx-shift-definition-modal',
  styleUrls: ['./shift-definition-modal.component.scss'],
  templateUrl: './shift-definition-modal.component.html',
})

export class ShiftDefinitionModalComponent implements AfterViewInit, OnInit {

  @Input() from;
  @Input() to;

  teams: any = [];
  selectedProcessCell: any;
  selectedProcessCellPath: any;

  helpLinkPage = 'shift-definition-modal';
  helpPageLinkDestination = '#';

  constructor(
    private toastService: NbToastrService,
    private scheduleService: SchedulingData,
    private configurationService: ConfigurationData,
    protected ref: NbDialogRef<ShiftDefinitionModalComponent>,
    public translate: TranslateService,
    private config: ConfigService,
    ) {
      const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    }

  ngOnInit(): void {
    this.scheduleService.getTeams().then(teams => {
      this.teams = teams;
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


    ngAfterViewInit(): void {
    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.selectedProcessCellPath = this.selectedProcessCell.path;
  }

  onShiftChange(updatedShiftDefinitions) {
    this.scheduleService.updateShiftDefinition(this.selectedProcessCellPath, updatedShiftDefinitions).then(
      (closed: any) => { // Success
        this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Shift_definition_updated"]).subscribe((translations) => {
          this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (closed && closed.hasOwnProperty('type') && closed.type === 'UserDismiss' ? closed.detail :  translations["CALENDAR.Shift_definition_updated"]), (closed && closed.hasOwnProperty('type') && closed.type === 'UserDismiss' ? true : false));
        });
        this.ref.close(true);

      },
      (err: any) => { // Error
        this.translate.get(["CALENDAR.WARNING","SHARED.Errors_submitting_data"]).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? err.error.detail :  translations["SHARED.Errors_submitting_data"]), (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? true : false));
        });
        this.ref.close();
      },
    );
  }

  closeModal() {
    this.ref.close(true);
  }


  onTeamChange(updatedTeams) {
    this.teams = updatedTeams;
    this.scheduleService.updateTeam(this.teams).then(
      (closed: any) => { // Success
        this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Team_definition_updated"]).subscribe((translations) => {
          this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (closed && closed.hasOwnProperty('type') && closed.type === 'UserDismiss' ? closed.detail :  translations["CALENDAR.Team_definition_updated"]), (closed && closed.hasOwnProperty('type') && closed.type === 'UserDismiss' ? true : false));
        });
        this.ref.close(true);
      },
      (err: any) => { // Error
        this.translate.get(["CALENDAR.WARNING","SHARED.Errors_submitting_data"]).subscribe((translations) => {
          this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? err.error.detail :  translations["SHARED.Errors_submitting_data"]), (err && err.error.hasOwnProperty('type') && err.error.type === 'UserDismiss' ? true : false));
        });
        this.ref.close(true);
      },
    );
  }


  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }


}
