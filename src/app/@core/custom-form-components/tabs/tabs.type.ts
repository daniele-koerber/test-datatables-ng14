import { Component, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-tabs',
  styleUrls: ['./tabs.type.scss'],
  template: `
    <nb-tabset #tab fullWidth (changeTab)=" selectedTab($event) ">
      <nb-tab
          [tabId]=" i "
          [active]=" tabsIndex[i].active "
          *ngFor="let tab of field.fieldGroup; let i = index; let first = first; let last = last;"
          [tabTitle]="tab.templateOptions.label">
          <formly-field [field]="tab" [options]="options"></formly-field>

          <button nbButton [hidden]="isButtonHidden" outline shape="round" status="primary" *ngIf="!first" (click)=" setActiveTabPreviusOne(i) " type="button">&lt; {{ 'COMMON.Back' | translate }}</button>
          <button nbButton [hidden]="isButtonHidden" class="float-right" outline shape="round" status="primary" *ngIf="!last" (click)=" setActiveTabNextOne(i) " type="button">{{ 'COMMON.Next' | translate }} &gt;</button>
          <button nbButton [hidden]="isButtonHidden" class="float-right" outline shape="round" status="primary" *ngIf="last" type="submit">{{ 'COMMON.Confirm' | translate }}</button>
      </nb-tab>
    </nb-tabset>
`,
})
export class FormFieldTabs extends FieldType implements OnInit {

  tabsIndex = [];
  isButtonHidden = false;

  ngOnInit () {
    const self = this;
    this.isButtonHidden = this.field.fieldGroup[0].templateOptions.buttonsHidden !== undefined ? this.field.fieldGroup[0].templateOptions.buttonsHidden : false;
    this.field.fieldGroup.map((tab, index) => {
      self.tabsIndex.push({index: index, active: (index ? false : true)});
    });
  }

  isValid(field: FormlyFieldConfig) {
    if (field.key) {
      return field.formControl.valid;
    }
    return field.fieldGroup.every(f => this.isValid(f));
  }

  selectedTab(event: any){
    this.tabsIndex.forEach((el, index) => {
      el.active = (el.index === event.tabId ? true : false);
    });
  }

  setActiveTabPreviusOne(i) {
    this.tabsIndex.forEach((el, index) => {
      el.active = (el.index === i - 1 ? true : false);
    });
  }
  setActiveTabNextOne(i) {
    this.tabsIndex.forEach((el, index) => {
      el.active = (el.index === i + 1 ? true : false);
    });
  }
}
