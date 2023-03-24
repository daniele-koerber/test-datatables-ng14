import { Component, Input, OnInit, NgZone, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators, FormGroup, FormControl, FormGroupDirective, AbstractControl } from '@angular/forms';

import { ConfigService } from '../../../../../@core/utils/services/config.service';
// import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
// import { Observable, Subject } from 'rxjs';

interface vObj {
  [s: string]: boolean;
}

@Component({
  selector: 'ngx-products-quality-range-parameter',
  styleUrls: ['./quality-range-parameter.component.scss'],
  templateUrl: './quality-range-parameter.component.html',
})

export class ProductsQualityRangeParameterComponent implements OnInit {

  @Input() changed = 0;
  @Input() row: any;
  @Input() uniqueValues: boolean = false;
  @Input() disabled;
  @Input() readonly;
  @Input() processCell: any;
  @Input() definition;
  @Input() formGroup: FormGroup;
  @Input() firstEnabledProcessCell;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() touched: EventEmitter<boolean> = new EventEmitter<boolean>();

  parameterDefinitionName
  path
  // subject = new Subject();
  isReadyOnly = false;

  constructor(
    private config: ConfigService,
    private fb: FormBuilder,
    formGroup: FormGroupDirective,
    private zone: NgZone
  ) {
    this.formGroup = formGroup.control;

    // this.subject.pipe(
    //   debounceTime(1000),
    //   distinctUntilChanged(),
    //   map(() => {
    //   })
    // ).subscribe((res) => {
    //   this.updateValidation(this.isReadyOnly, this.formGroup)
    // });

  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.disabled){
      this.isReadyOnly = this.disabled;
      this.runValidation()
    }
  }
  ngOnDestroy(): void {
    // if (this.subject) {
    //   this.subject.unsubscribe();
    // }
  }

  runValidation() {
    this.updateValidation(this.isReadyOnly, this.formGroup);
  }

  async updateValidation(readonly, formGroup) {

    if(this.parameterDefinitionName && this.path){
      if(readonly === false && this.getProcessCellParameterValue(this.processCell.path, this.row?.values).ValueMIN !== undefined) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].patchValue(this.getProcessCellParameterValue(this.processCell.path, this.row?.values).ValueMIN)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].patchValue(this.getProcessCellParameterValue(this.processCell.path, this.row?.values).ValueSP)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].patchValue(this.getProcessCellParameterValue(this.processCell.path, this.row?.values).ValueMAX)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].setValidators([this.customValidation(formGroup, this.parameterDefinitionName)])
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].setValidators([this.customValidation(formGroup, this.parameterDefinitionName)])
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].setValidators([this.customValidation(formGroup, this.parameterDefinitionName)])
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].patchValue()
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].patchValue()
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].patchValue()
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMIN'].setValidators(null)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueSP'].setValidators(null)
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_ValueMAX'].setValidators(null)
      }
      await  formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueMIN').updateValueAndValidity();
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueSP').updateValueAndValidity();
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_ValueMAX').updateValueAndValidity();

      this.emitChange.emit(true);
    }
  }

  ngOnInit(){
    this.parameterDefinitionName = this.row.parameterDefinitionName;
    this.path = this.processCell.path.split('.').join("");

    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_ValueMIN', new FormControl());
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_ValueSP', new FormControl());
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_ValueMAX', new FormControl());
    this.updateValidation(this.disabled, this.formGroup);
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
    } else
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
    const controlValue = control.value;;
    let validationMap: vObj = {};
    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap['required'] = true;
    } else
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
    const controlValue = control.value;;
    let validationMap: vObj = {};
    if (controlValue === '' || controlValue === undefined || (isNaN(controlValue))) {
      validationMap['required'] = true;
    } else
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
    const controlValue = valueSP?.value
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
    const controlValue = valueSP?.value;
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
    const controlValue = valueSP?.value;
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

  ngModelChange(path, el, event) {
    const element = el.find(e => e.processCellPath === path);
    this.touched.emit(true)

    element.value[event.target.name] = +event.target.value;
    this.isReadyOnly = false;
    this.runValidation()

    this.emitChange.emit(true);

  }

  onFieldChange(path, el, event) {

    const element = el.find(e => e.processCellPath === path);
    let value = event.target.value.split(',').join('.');
    if(!isNaN(value)) { value = +value; }
    element.value[event.target.name] = value;
    const key = this.parameterDefinitionName + '_' + this.path + '_formField';
    this.formGroup.patchValue({
      [key]: value
    });

    this.isReadyOnly = false;
    this.runValidation()
    this.touched.emit(true)
    this.emitChange.emit(true);

  }

  getProcessCellParameterValue(path, array) {
    const el = array.find(el => el.processCellPath === path);
    return ( el ? el.value : '');
  }

  getValidationColor(val) {
    if (val) {
      return this.config.returnValidationColor(val.split(',').join('.'));
    }
  }

  getProcessCellParameter(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value : {});
  }

}
