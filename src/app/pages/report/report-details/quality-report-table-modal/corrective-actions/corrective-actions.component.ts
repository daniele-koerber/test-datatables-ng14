import {Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import {TranslateService} from '@ngx-translate/core';
import { ConfigService } from '../../../../../@core/utils/services/config.service';

@Component({
  selector: 'ngx-corrective-actions',
  styleUrls: ['./corrective-actions.component.scss'],
  templateUrl: './corrective-actions.component.html',
})


export class CorrectiveActionsComponent implements OnInit, OnChanges  {

  @Input() occurredDateTimeUtc: any;
  @Input() acknowledgeDateTimeUtc: any;
  @Input() correctiveActions: any;
  form: FormGroup;
  options: FormlyFormOptions = {};
  model: any;
  fields: FormlyFieldConfig[];
  checkBoxes: any;
  notes: any;

  helpLinkPage = 'corrective-actions';
  helpPageLinkDestination = '#';

  constructor(
      protected ref: NbDialogRef<CorrectiveActionsComponent>,
      public translate: TranslateService,
      private config: ConfigService,
    ) {
    this.form = new FormGroup({});

    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());
    this.setHelpPage();
  }


  ngOnChanges(changes: SimpleChanges): void {
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
    const self = this;
    // this.form = this.correctiveActions;
    this.checkBoxes = this.correctiveActions.filter((action) => !action.key.includes('text'));
    this.notes = this.correctiveActions.filter((action) => action.key.includes('text'));
  }

  closeModal() {
    this.ref.close(true);
  }



  submit() {
    if (this.form.valid) {
      // alert(JSON.stringify(this.model));
    }
  }
}
