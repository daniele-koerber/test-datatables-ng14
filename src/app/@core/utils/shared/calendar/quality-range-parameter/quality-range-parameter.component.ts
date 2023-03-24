import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators, FormGroup, FormControl, FormGroupDirective, AbstractControl } from '@angular/forms';

interface vObj {
  [s: string]: boolean;
}
@Component({
  selector: 'ngx-calendar-quality-range-parameter',
  styleUrls: ['./quality-range-parameter.component.scss'],
  templateUrl: './quality-range-parameter.component.html',
})

export class CalendarQualityRangeParameterComponent implements OnInit {

  @Input() changed = 0;
  @Input() row: any;
  @Input() uniqueValues: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
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
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_ValueMIN', new FormControl());
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_ValueSP', new FormControl());
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_ValueMAX', new FormControl());
    this.updateValidation(this.disabled, this.formGroup);

  }

  async updateValidation(readonly, formGroup) {

    if(this.parameterDefinitionName && this.path){
      if(readonly === false && this.row.value.ValueMIN !== undefined) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].setValidators([this.customValidation(formGroup, this.parameterDefinitionName)])
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].setValidators([this.customValidation(formGroup, this.parameterDefinitionName)])
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].setValidators([this.customValidation(formGroup, this.parameterDefinitionName)])
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].patchValue(this.row?.value.ValueMIN)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].patchValue(this.row?.value.ValueSP)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].patchValue(this.row?.value.ValueMAX)
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].setValidators(null)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].setValidators(null)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].setValidators(null)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].patchValue()
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].patchValue()
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].patchValue()
        if(this.row){
          await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].patchValue(this.row?.value.ValueMIN)
          await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].patchValue(this.row?.value.ValueSP)
          await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].patchValue(this.row?.value.ValueMAX)
        }
      }
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueMIN').updateValueAndValidity();
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueSP').updateValueAndValidity();
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueMAX').updateValueAndValidity();
      this.emitChange.emit(true);
    }
  }

  getControlName(c: AbstractControl): string | null {
    const formGroup = this.formGroup.controls;
    return Object.keys(formGroup).find(name => c === formGroup[name]) || null;
  }

  validateValueMin(control, valueSP, valueMAX){
    const controlValue = control.value;
    let validationMap: vObj = {};
    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap['required'] = true;
    }
    if (controlValue && (+controlValue > +valueMAX?.value || +controlValue > +valueSP?.value)) {
      validationMap['value'] = true;
    } else {
      if (control.pristine === false) {
        this.checkSPErrors(control, valueSP, valueMAX);
        this.checkMAXErrors(control, valueSP, valueMAX);
      }
    }
    return validationMap;
  }

  validateValueSP(valueMIN, control, valueMAX){
    const controlValue = control.value;
    let validationMap: vObj = {};

    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap['required'] = true;
    }
    if (controlValue && (+controlValue > +valueMAX?.value || +controlValue < +valueMIN?.value)) {
      validationMap['value'] = true;
    } else {
      if (control.pristine === false) {
        this.checkMINErrors(valueMIN, control, valueMAX);
        this.checkMAXErrors(valueMIN, control, valueMAX);
      }
    }
    return validationMap;
  }

  validateValueMax(valueMIN, valueSP, control){
    const controlValue = control.value;
    let validationMap: vObj = {};
    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap['required'] = true;
    }
    if (controlValue && (+controlValue < +valueMIN?.value || +controlValue < +valueSP?.value)
      ) {
      validationMap['value'] = true;
    } else {
      if (control.pristine === false) {
        this.checkSPErrors(valueMIN, valueSP, control);
        this.checkMINErrors(valueMIN, valueSP, control);
      }
    }
    let errors = false;
    return validationMap;
  }

  checkSPErrors(valueMIN, valueSP, valueMAX){
    let errors = false;
    const controlValue = valueSP.value;
    let validationMap: vObj = {};
    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap = {required: true}
      errors = true;
    }
    if (controlValue && (+controlValue > +valueMAX?.value || +controlValue < +valueMIN?.value)) {
      validationMap = {value: true};
      errors = true;
    }
    valueSP.setErrors(errors ? validationMap : null);
  }

  checkMINErrors(valueMIN, valueSP, valueMAX){
    let errors = false;
    const controlValue = valueSP.value;
    let validationMap: vObj = {};
    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap = {required: true};
      errors = true;
    }
    if (controlValue && (controlValue > valueMAX?.value || controlValue > valueSP?.value)) {
      validationMap = {value: true};
      errors = true;
    }
    valueMIN.setErrors(errors ? validationMap : null);
  }

  checkMAXErrors(valueMIN, valueSP, valueMAX){
    let errors = false;
    const controlValue = valueSP.value;
    let validationMap: vObj = {};
    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap = {required: true};
      errors = true;
    }
    if (controlValue && (+controlValue < +valueMIN?.value || +controlValue < +valueSP?.value)) {
      validationMap = {value: true};
      errors = true;
    }
    valueMAX.setErrors(errors ? validationMap : null);
  }

  customValidation(formGroup, parameterDefinitionName): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const controlName = this.getControlName(control);
      const valueMIN = formGroup.controls[parameterDefinitionName + '_' + this.path + '_ValueMIN'];
      const valueSP =  formGroup.controls[parameterDefinitionName + '_' + this.path + '_ValueSP'];
      const valueMAX = formGroup.controls[parameterDefinitionName + '_' + this.path + '_ValueMAX'];

      if(controlName && controlName.includes('_ValueMIN')) {
        return this.validateValueMin(control, valueSP, valueMAX)
      }

      if(controlName && controlName.includes('_ValueSP')) {
        return this.validateValueSP(valueMIN, control, valueMAX)
      }

      if(controlName && controlName.includes('_ValueMAX')) {
        return this.validateValueMax(valueMIN, valueSP, control)
      }

      return null;
    }
  }

  checkProcessCell(selectedProcessCell, processCellsArray) {
    if (processCellsArray) {
      const found = processCellsArray.find(el => el.processCellPath === selectedProcessCell.path);
      return found;
    }
  }

  onFieldChange(event, el) {
      this.row.value[el] = +event.target.value;
      this.formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueMIN').updateValueAndValidity();
      this.formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueSP').updateValueAndValidity();
      this.formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueMAX').updateValueAndValidity();

      // this.parameterDefinitionName + '_' + this.path + '_ValueMIN',
      //   this.formGroup.value[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'],
      // this.parameterDefinitionName + '_' + this.path + '_ValueSP',
      //   this.formGroup.value[this.parameterDefinitionName + '_' + this.path + '_ValueSP'],
      // this.parameterDefinitionName + '_' + this.path + '_ValueMAX',
      //   this.formGroup.value[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'])

    this.emitChange.emit(true);
  }

  getProcessCellParameterValue(path, el) {
    // const value = array.find(el => el.processCellPath === path);
    return ( el ? el.value : '');
  }

}
