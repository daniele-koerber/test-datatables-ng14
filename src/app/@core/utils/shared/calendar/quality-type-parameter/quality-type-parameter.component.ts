import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, ValidatorFn, Validators, FormGroup, FormControl, FormGroupDirective, AbstractControl } from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

interface vObj {
  [s: string]: boolean;
}
@Component({
  selector: 'ngx-calendar-quality-type-parameter',
  styleUrls: ['./quality-type-parameter.component.scss'],
  templateUrl: './quality-type-parameter.component.html',
})

export class CalendarQualityTypeParameterComponent implements OnChanges, OnInit {

  @Input() changed = 0;
  @Input() row: any;
  @Input() disabled: boolean;
  @Input() readonly: boolean = false;
  @Input() uniqueValues: boolean = false;
  @Input() processCellPath: string;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() formGroup: FormGroup;

  optionsArray = [];
  selectedChoice: any;
  defaultVoidMenuVoice;

  parameterDefinitionName;
  path

  constructor(
    formGroup: FormGroupDirective,
    public translate: TranslateService,
  ) {
    this.formGroup = formGroup.control;

  }

  ngOnInit(){
    this.parameterDefinitionName = this.row.parameterName;
    this.path = this.processCellPath.split('.').join("");
    const SelectedChoice = new FormControl(this.row?.value.SelectedChoice);
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_SelectedChoice', SelectedChoice);
    this.updateValidation(this.disabled, this.formGroup);
    this.translate.get(["CALENDAR.All"]).subscribe((translations) => {
      this.defaultVoidMenuVoice = translations["CALENDAR.All"];
    });

    this.selectedChoice = this.row.value.SelectedChoice;
  }

  async updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){

      if(readonly === false && this.row?.value !== undefined) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_SelectedChoice'].setValidators([this.customValidation(this.formGroup, this.parameterDefinitionName, this.path)]);
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_SelectedChoice'].setValidators(null);
      }
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_SelectedChoice').updateValueAndValidity();
      this.emitChange.emit(true);
    }
  }

  getControlName(c: AbstractControl): string | null {
    const formGroup = this.formGroup.controls;
    return Object.keys(formGroup).find(name => c === formGroup[name]) || null;
  }

  customValidation(formGroup, parameterDefinitionName, path): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {

    let validationMap: vObj = {};
        //GVA 09-03-2023 - Done in TTC - Validation done by BE
    if (control.value === '' || control.value === undefined ) {
      validationMap['required'] = true;
      return validationMap;
    }

    return null;
  }
}

  getProcessCellParameterValue(path, el) {
    return ( el ? el.value : '');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.row) {
      this.optionsArray = this.row?.specificTypeInformation?.PossibleChoices.map(el => {
        return { value: el, name: el };
      });
      this.selectedChoice = this.row.value.SelectedChoice;
    }
  }

  click(){
  }

  selectionChange(value){

    this.row.value.SelectedChoice = value;
    this.selectedChoice = this.row.value.SelectedChoice;
    this.updateValidation(this.readonly, this.formGroup);
    this.emitChange.emit(true)
  }

}
