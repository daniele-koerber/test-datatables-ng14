import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators, FormGroup, FormControl, FormGroupDirective, AbstractControl } from '@angular/forms';

interface vObj {
  [s: string]: boolean;
}
@Component({
  selector: 'ngx-calendar-mandatory-parameter-unit-conversion',
  styleUrls: ['./mandatory-parameter-unit-conversion.component.scss'],
  templateUrl: './mandatory-parameter-unit-conversion.component.html',
})

export class CalendarMandatoryParameterUnitConversionComponent implements OnInit {

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
    const formField = new FormControl(this.row?.value.Value);
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_formField', formField);
    this.updateValidation(this.disabled, this.formGroup);
  }

  async updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && this.row.value !== undefined) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([this.customValidation])
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators(null)
      }
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_formField').updateValueAndValidity();
      this.emitChange.emit(true);
    }
  }

  customValidation(control: AbstractControl): { [key: string]: boolean } | null {
    let validationMap: vObj = {};
    //GVA 09-03-2023 - Done in TTC - Validation done by BE
    if (control.value === '' || control.value === undefined) {
     // validationMap['required'] = true;
      return validationMap;
    } else {
      if (control.value <= 0 || (isNaN(control.value))) {
      //  validationMap['value'] = true;
        return validationMap;
      }
      return null;
    }
  }

  getProcessCellParameter(path, el) {
    const v = ( el ? el : {});
    return v;
  }

  onFieldChange(event, path, array) {
    const uniqueValues = this.row.uniqueValues;
    // if (uniqueValues === true ) {
    //   console.log(this.row.values);
    //   this.row.values.forEach((pc, index) => {
    //     if (index !== 0) {
    //       pc.value = {...this.row.values[0].value};
    //     }
    //   });
    // }
    this.row.value.Value  = event.target.value;
    this.updateValidation(false, this.formGroup)
    this.emitChange.emit(true);
  }



  getProcessCellParameterValue(path, el) {
    return ( el ? el.value : '');
  }


}
