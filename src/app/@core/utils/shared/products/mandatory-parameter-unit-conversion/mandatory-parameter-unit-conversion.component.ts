import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter} from '@angular/core';

import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators, AbstractControl } from '@angular/forms';
import { ConfigService } from '../../../../../@core/utils/services/config.service';

interface vObj {
  [s: string]: boolean;
}

@Component({
  selector: 'ngx-products-mandatory-parameter-unit-conversion',
  styleUrls: ['./mandatory-parameter-unit-conversion.component.scss'],
  templateUrl: './mandatory-parameter-unit-conversion.component.html',
})

export class ProductsMandatoryParameterUnitConversionComponent {

  @Input() changed = 0;
  @Input() row: any;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() uniqueValues: boolean = false;
  @Input() processCell: any;
  @Input() definition: any;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() touched: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() firstEnabledProcessCell;
  @Input() formGroup: FormGroup;

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
    const val = this.getProcessCellParameterValue(this.processCell.path, this.row?.values);


    if(val) {
      const formField = new FormControl(val.Value);
      this.formGroup.addControl(this.row.parameterDefinitionName + '_' + this.path + '_formField', formField);
      this.updateValidation(this.disabled, this.formGroup);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.disabled){
      this.updateValidation(this.disabled, this.formGroup);
    }
  }

  async updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && await this.getProcessCellParameterValue(this.processCell.path, this.row?.values)?.Value) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([ this.customValidation])
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
    if (control.value === '' || control.value === undefined || (isNaN(control.value))) {
      //validationMap['required'] = true;
      return validationMap;
    } else {
      if (control.value <= 0) {
      //  validationMap['value'] = true;
        return validationMap;
      }
      return null;
    }
  }

  getProcessCellParameter(path, array) {
    const value = array.find(el => el.processCellPath === path);
    const v = ( value ? value : {});
    return v;
  }

  onFieldChange(event, path, array) {
    const r = array.find(el => el.processCellPath === path);
    let value = event.target.value.split(',').join('.');
    if(!isNaN(value)) { value = +value; }
    r.value.Value = value;
    this.emitChange.emit(true);
    this.touched.emit(true)
  }

  getProcessCellParameterValue(path, array) {
    const value = array.find(el => el.processCellPath === path);
    const val = ( value ? value.value : {Value:null});
    return val

  }



  getValidationColor(val) {
    if (val) {
      return this.config.returnValidationColor(val.split(',').join('.'));
    }
  }

}
