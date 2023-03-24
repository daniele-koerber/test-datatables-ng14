import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators, FormGroup, FormControl, FormGroupDirective, AbstractControl } from '@angular/forms';

interface vObj {
  [s: string]: boolean;
}
@Component({
  selector: 'ngx-calendar-mandatory-parameter-speed',
  styleUrls: ['./mandatory-parameter-speed.component.scss'],
  templateUrl: './mandatory-parameter-speed.component.html',
})

export class CalendarMandatoryParameterSpeedComponent implements OnInit {

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
    this.parameterDefinitionName = this.row.parameterName;
    this.path = this.processCellPath.split('.').join("");
    const formField = new FormControl(
      this.row.value.Speed
    );
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_formField', formField);
    this.updateValidation(this.disabled, this.formGroup);

  }

  customValidation(control: AbstractControl): { [key: string]: boolean } | null {
    let validationMap: vObj = {};
    //GVA 09-03-2023 - Done in TTC - Validation done by BE
    if (control.value === '' || control.value === undefined) {
      //validationMap['required'] = true;
    } else {
      if (control.value <= 0  || (isNaN(control.value))) {
     //     validationMap['value'] = true;
      }
    }
    return (validationMap.required || validationMap.value ? validationMap : null);
  }

  async updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && this.row.value !== undefined) {
        // formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([Validators.required, this.customValidation]);
        //GVA 09-03-2023 - Done in TTC - Controlled by BE
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([ this.customValidation]);
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators(null)
      }
      await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].updateValueAndValidity();
      this.emitChange.emit(true);
    }
  }

  onFieldChange(event, path, array) {
    this.row.value.Speed = event.target.value;
    this.updateValidation(false, this.formGroup);
    this.emitChange.emit(true);
  }

  getProcessCellParameterValue(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value.value : '');
  }

}
