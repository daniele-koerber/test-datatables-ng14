import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormGroupDirective, Validators, AbstractControl } from '@angular/forms';

import { ConfigService } from '../../../../../@core/utils/services/config.service';

interface vObj {
  [s: string]: boolean;
}

@Component({
  selector: 'ngx-products-mandatory-parameter-speed',
  styleUrls: ['./mandatory-parameter-speed.component.scss'],
  templateUrl: './mandatory-parameter-speed.component.html',
})

export class ProductsMandatoryParameterSpeedComponent {

  @Input() changed = 0;
  @Input() row: any;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = true;
  @Input() uniqueValues: boolean = false;
  @Input() processCell: any;
  @Input() definition;
  @Input() formGroup: FormGroup;
  @Input() firstEnabledProcessCell;
  @Output() emitChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() touched: EventEmitter<boolean> = new EventEmitter<boolean>();

  parameterDefinitionName
  path

  constructor(
    private config: ConfigService,
    private fb: FormBuilder,
    formGroup: FormGroupDirective,
  ) {
    this.formGroup = formGroup.control
  }

  ngOnInit(){
    this.parameterDefinitionName = this.row.parameterDefinitionName;
    this.path = this.processCell.path.split('.').join("");
    const value = this.getProcessCellParameterValue(this.processCell.path, this.row.values).Speed;
    const formField = new FormControl(this.readonly ? null : value);
    const key = this.parameterDefinitionName + '_' + this.path + '_formField';
    this.formGroup.patchValue({
      // [key]: (this.readonly ? null: value)
      [key]: value
    });
    if(value){
      this.formGroup.addControl(this.row.parameterDefinitionName + '_' + this.path + '_formField', formField);
      this.updateValidation(this.disabled, this.formGroup);
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.disabled && this.formGroup.value[this.parameterDefinitionName + '_' + this.path +'_formField'] ){
      this.updateValidation(this.disabled, this.formGroup);
    }
  }

  async updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && await this.getProcessCellParameterValue(this.processCell.path, this.row?.values).Speed !== undefined ) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField']?.setValidators([ this.customValidation]);
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField']?.setValidators(null)
      }
      await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField']?.updateValueAndValidity();
      this.emitChange.emit(true);
    }
  }

  customValidation(control: AbstractControl): { [key: string]: boolean } | null {
    let validationMap: vObj = {};
    if (control.value === '' || control.value === undefined) {
     // validationMap['required'] = true;

      return validationMap;
    } else {
      if (control.value <= 0  || (isNaN(control.value))) {
    //   validationMap['value'] = true;
        return validationMap;
      }
      return null;
    }
  }

  onFieldChange(event, path, array, component) {
    const r = array.find(el => el.processCellPath === path);
    let value = event.target.value.split(',').join('.');
    if(!isNaN(value)) { value = +value; }
    r.value.Speed = value;
    const key = this.parameterDefinitionName + '_' + this.path + '_formField';
    if(value){
      this.formGroup.patchValue({
        // [key]: (this.readonly ? null: value)
        [key]: value
      });
  }

    this.updateValidation(false, this.formGroup);
    // this.emitChange.emit({component: component, row: this.row});
    this.emitChange.emit(this.row);
    this.touched.emit(true)
  }

  getProcessCellParameterValue(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value && value.value ? value.value : { Speed: null});
  }

  getProcessCellParameter(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value : {});
  }

  getValidationColor(val) {
    if (val) {
      return this.config.returnValidationColor(val.split(',').join('.'));
    }
  }

}
