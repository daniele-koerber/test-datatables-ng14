import {Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { NbToastrService, NbDialogRef } from '@nebular/theme';
import {TranslateService} from '@ngx-translate/core';

import { DynamicFormsData } from './../../data/dynamic-forms';
import { QualityData } from '../../../@core/data/quality';
import { ConfigService } from '../../../@core/utils/services/config.service';

@Component({
  selector: 'ngx-quality-check-form',
  styleUrls: ['./quality-check-form.component.scss'],
  templateUrl: './quality-check-form.component.html',
})

export class QualityCheckFormComponent implements OnInit {

  @Input() qualityCheck: any;
  @Input() componetsDisabled: any;
  @Input() row: any;

  form: FormGroup;
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[];
  model: any;

  helpLinkPage = 'quality-check-form';
  helpPageLinkDestination = '#';
  timeTranslations: any;

  constructor(
    private formService: DynamicFormsData,
    private qualityService: QualityData,
    private toastService: NbToastrService,
    protected ref: NbDialogRef<QualityCheckFormComponent>,
    public translate: TranslateService,
    private config: ConfigService,
  ) {
    const langsArr = config.getLanguages().map(el => el.key);
    translate.addLangs(langsArr);
    translate.setDefaultLang(langsArr[0]);
    const browserLang = translate.getBrowserLang();
    translate.use(config.getSelectedLanguage());

    this.form = new FormGroup({});
    this.setHelpPage();
    this.translate.get(['SHARED.Just_now', 'SHARED.ago',
                        'SHARED.year', 'SHARED.month', 'SHARED.week', 'SHARED.day', 'SHARED.hour', 'SHARED.minute', 'SHARED.second',
                        'SHARED.years', 'SHARED.months', 'SHARED.weeks', 'SHARED.days', 'SHARED.hours', 'SHARED.minutes', 'SHARED.seconds']).subscribe((translations) => {
                          this.timeTranslations = translations;
                        });
  }

  openHelp () {
    if(this.helpPageLinkDestination !== '#') { window.open(this.helpPageLinkDestination, "_blank"); }
  }

  setHelpPage() { console.log('helpLinkPage ==>', this.helpLinkPage);
    this.setHelpPageLinkDestination(this.config.getHelpPage(this.helpLinkPage, this.config.getSelectedLanguage()));
  }

  setHelpPageLinkDestination(destination) {
    this.helpPageLinkDestination = destination;
  }

  ngOnInit() {
    if (this.qualityCheck.form) {
      this.fields = JSON.parse(this.qualityCheck.form.form);
      if (this.componetsDisabled !== undefined && this.componetsDisabled) {
        this.fields.forEach(field => {
          field.fieldGroup.forEach(el => {
            el.templateOptions.buttonsHidden = true;
            el.fieldGroup.forEach(comp => {
              comp.templateOptions.disabled = true;
              if (comp.type === 'textarea' ) {
                comp.templateOptions.label = 'Notes';
                comp.templateOptions.value = comp.templateOptions.value === undefined ? ' ' : comp.templateOptions.value;
              }
              if(comp.templateOptions.value === "1") {
                comp.templateOptions.defaultValue = 'checked';
                comp.templateOptions.checked = true;
              }
            });
          });
        });
      }
      const model = this.formService.buildModel(this.fields);
      this.model = model;
    }
  }

  dateAgo(value: any, args?: any): any {

      if (value) {
          const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
          if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
              return this.timeTranslations['SHARED.Just_now'];
          const intervals = {
              'year': 31536000,
              'month': 2592000,
              'week': 604800,
              'day': 86400,
              'hour': 3600,
              'minute': 60,
              'second': 1,
          };
          let counter;
          // tslint:disable-next-line:forin
          for (const i in intervals) {
              counter = Math.floor(seconds / intervals[i]);
              if (counter > 0)
                if (counter === 1) {
                  return counter + ' ' + this.timeTranslations['SHARED.' + i] + ' ' + this.timeTranslations['SHARED.ago']; // singular (1 day ago)
                } else {
                  return counter + ' ' + this.timeTranslations['SHARED.' + i + 's'] + ' ' + this.timeTranslations['SHARED.ago']; // plural (2 days ago)
                }
          }
      return value;
    }
  }

  submit() {
    var checkForm = JSON.parse(this.qualityCheck.form.form);
    const data: any = {id: this.qualityCheck.id, form: {values: [], structure: checkForm } };

    for (const [key, value] of Object.entries(this.model)) {
      const el: any = this.form.controls[key];
      const optionLabel = el._fields[0].templateOptions.options !== undefined ? el._fields[0].templateOptions.options.find(x => x.value === value) : '';
      const rc = {
        key: key,
        title: el._fields[0].templateOptions.label,
        value: value,
        alert: optionLabel !== '' ?
                  (+el._fields[0].templateOptions.value !== +optionLabel.value ? ((+el._fields[0].templateOptions.valueNA !== +optionLabel.value) ? true : false) : false) :
                  ((el && el.errors === null) ? false : true),
        um: el._fields[0].templateOptions.um !== undefined ? el._fields[0].templateOptions.um : '',
        label: el._fields[0].templateOptions.label === '' ? optionLabel.label : el._fields[0].templateOptions.label,
      };

      data.form.values.push(rc);
    }
    const isCompliat = data.form.values.find(rc => rc.alert === true) === undefined ? true : false;
    this.qualityService.submitQualityCheck(data, isCompliat)
      .then(
        (success) => { // Success
          this.translate.get(["CALENDAR.SUCCESS","CALENDAR.Quality_check_successfully_submitted"]).subscribe((translations) => {
            this.showToast('top-right', 'success', translations["CALENDAR.SUCCESS"], (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? success.detail :  translations["CALENDAR.Quality_check_successfully_submitted"]), (success && success.hasOwnProperty('type') && success.type === 'UserDismiss' ? true : false));
          });
          this.ref.close(true);

        },
        (error) => { // Error
          this.translate.get(["CALENDAR.WARNING","CALENDAR.Errors_submitting_quality_check_form"]).subscribe((translations) => {
            this.showToast('top-right', 'danger', translations["CALENDAR.WARNING"], (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? error.error.detail :  translations["CALENDAR.Errors_submitting_quality_check_form"]), (error && error.error.hasOwnProperty('type') && error.error.type === 'UserDismiss' ? true : false));
          });
          this.ref.close();
        },
    );
  }

  showToast(position, status, title: string, msg: string, destroyByClick: boolean = false) {
    const duration = (destroyByClick === true ? 0 : 3000);
    this.toastService.show(msg, title, {position, status, duration, destroyByClick});
  }

  closeModal() {
    this.ref.close(true);
  }


}
