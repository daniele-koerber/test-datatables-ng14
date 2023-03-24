import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormGroupDirective, ValidatorFn, Validators, AbstractControl } from '@angular/forms';

import { ConfigService } from '../../../../../@core/utils/services/config.service';

interface vObj {
  [s: string]: boolean;
}

@Component({
  selector: 'ngx-products-working-parameter',
  styleUrls: ['./working-parameter.component.scss'],
  templateUrl: './working-parameter.component.html',
})


export class ProductsWorkingParameterComponent implements OnInit {

  @Input() changed = 0;
  @Input() row: any;
  @Input() disabled: boolean;
  @Input() readonly;
  @Input() uniqueValues: boolean = false;
  @Input() processCell: any;
  @Input() formGroup: FormGroup;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() touched: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() firstEnabledProcessCell;
  parameterDefinitionName
  path

  constructor(
    private config: ConfigService,
    private fb: FormBuilder,
    private formGroupD: FormGroupDirective,
  ) {
    // this.formGroup = formGroup.control
  }

  ngOnInit(){
    const el = this.getProcessCellParameterValue(this.processCell.path, this.row?.values);
    this.parameterDefinitionName = this.row.parameterDefinitionName;
    this.path = this.processCell.path.split('.').join("");
    this.formGroup = this.formGroupD.control;
    const formField = new FormControl();
    this.formGroup.addControl(this.row.parameterDefinitionName + '_' + this.path + '_formField', formField);
    this.updateValidation(this.disabled, this.formGroup, el);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.disabled){
      const el = this.getProcessCellParameterValue(this.processCell.path, this.row?.values);
      this.updateValidation(this.disabled, this.formGroup, el);
    }
  }

  async updateValidation(readonly, formGroup, el) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && await this.getProcessCellParameterValue(this.processCell.path, this.row?.values)) {
        await formGroup.controls[this.row.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([this.customValidation(new RegExp(this.row.definition.specificTypeInformationObject.RegexValidation))]);
        await formGroup.controls[this.row.parameterDefinitionName + '_' + this.path + '_formField'].patchValue(el.Value)
      } else {
        await formGroup.controls[this.row.parameterDefinitionName + '_' + this.path + '_formField'].setValidators(null);
        await formGroup.controls[this.row.parameterDefinitionName + '_' + this.path + '_formField'].patchValue()
      }
      await formGroup.get(this.row.parameterDefinitionName + '_' + this.path + '_formField').updateValueAndValidity();
      this.emitChange.emit(true)
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


  getProcessCellParameter(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value : {});
  }

  getProcessCellParameterValue(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value.value : '');
  }

  getValidationColor(val) {
    if (val) {
      return this.config.returnValidationColor(val);
    }
  }

  emitChangeEvent(event){
    const line = this.row.values.find(el => el.processCellPath.split('.').join("") === this.path);
    let value = event.target.value;
    if(!isNaN(value)) { value = +value; }
    line.value.Value = event.target.value;
    this.emitChange.emit(true);
    this.touched.emit(true)
  }


}
