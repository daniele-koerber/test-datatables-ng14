import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators, FormGroup, FormControl, FormGroupDirective, AbstractControl } from '@angular/forms';

interface vObj {
  [s: string]: boolean;
}

@Component({
  selector: 'ngx-calendar-working-parameter',
  styleUrls: ['./working-parameter.component.scss'],
  templateUrl: './working-parameter.component.html',
})

export class CalendarWorkingParameterComponent implements OnInit {

  @Input() changed = 0;
  @Input() row: any;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() uniqueValues: boolean = false;
  @Input() processCellPath: string;
  @Input() formGroup: FormGroup;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  parameterDefinitionName;
  path

  constructor(
    formGroup: FormGroupDirective,
  ) {
    this.formGroup = formGroup.control;
  }

  ngOnInit(){
    const el = this.row?.value;

    this.parameterDefinitionName = this.row.parameterName;
    this.path = this.processCellPath.split('.').join("");
    const formField = new FormControl(
      this.getProcessCellParameterValue(this.processCellPath, this.row?.value).Speed
    );
    this.formGroup.addControl(this.row.parameterName + '_' + this.path + '_formField', formField);
    this.updateValidation(this.disabled, this.formGroup, el);

  }

  async updateValidation(readonly, formGroup, el) {
    if(this.row.parameterName && this.path){

      if(readonly === false && this.row.value) {
        await formGroup.controls[this.row.parameterName + '_' + this.path + '_formField'].setValidators([this.customValidation(new RegExp(this.row.specificTypeInformation.RegexValidation))]);
        await formGroup.controls[this.row.parameterName + '_' + this.path + '_formField'].patchValue(el.Value)
      } else {
        await formGroup.controls[this.row.parameterName + '_' + this.path + '_formField'].setValidators(null);
        await formGroup.controls[this.row.parameterName + '_' + this.path + '_formField'].patchValue()
      }
      await formGroup.get(this.row.parameterName + '_' + this.path + '_formField').updateValueAndValidity();
      this.emitChange.emit(true);
    }
  }

  customValidation(regexpString): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let validationMap: vObj = {};

      if (control.value != null && !(this.disabled || this.readonly) && (!regexpString.exec(control.value))) {

        validationMap['value'] = true;
        return validationMap;
      }
      return null;
    }
  }

  getProcessCellParameterValue(path, el) {
    return ( el);
  }

  selectionChange(event) {
    this.row.value.Value = event.target.value;
    this.updateValidation(false, this.formGroup, this.row.value)
    this.emitChange.emit(true)
  }
}
