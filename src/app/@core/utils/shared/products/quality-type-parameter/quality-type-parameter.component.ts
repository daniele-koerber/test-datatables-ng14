import { Component, Input, Output, OnInit, OnChanges, SimpleChanges, EventEmitter, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective, ValidatorFn, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { ConfigService } from '../../../../../@core/utils/services/config.service';
import {TranslateService} from '@ngx-translate/core';

interface vObj {
  [s: string]: boolean;
}
@Component({
  selector: 'ngx-products-quality-type-parameter',
  styleUrls: ['./quality-type-parameter.component.scss'],
  templateUrl: './quality-type-parameter.component.html',
})

export class ProductsQualityTypeParameterComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() changed = 0;
  @Input() row: any;
  @Input() disabled: boolean;
  @Input() readonly: boolean = false;
  @Input() uniqueValues: boolean = false;
  @Input() processCell: any;
  @Input() definition: any;
  @Input() formGroup: FormGroup;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() touched: EventEmitter<boolean> = new EventEmitter<boolean>();
  parameterDefinitionName
  path
  @Input() firstEnabledProcessCell;

  optionsArray = [];
  selectedChoice: any;
  defaultVoidMenuVoice;
  getNgModel

  constructor(
    private config: ConfigService,
    formGroup: FormGroupDirective,
    public translate: TranslateService,
    private cd: ChangeDetectorRef,
  ) {
    this.formGroup = formGroup.control
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }


  ngOnInit(){
    this.parameterDefinitionName = this.row.parameterDefinitionName;
    this.path = this.processCell.path.split('.').join("");

    const SelectedChoice = new FormControl(
      this.getProcessCellParameterValue(this.processCell.path, this.row?.values).SelectedChoice
      );
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_SelectedChoice', SelectedChoice);
    this.updateValidation(this.disabled, this.formGroup);

    this.translate.get(["CALENDAR.All"]).subscribe((translations) => {
      this.defaultVoidMenuVoice = translations["CALENDAR.All"];
    });
  }

  async updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && await this.getProcessCellParameterValue(this.processCell.path, this.row?.values)) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_SelectedChoice'].setValidators([this.customValidation(this.formGroup, this.parameterDefinitionName, this.path)]);
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_SelectedChoice'].patchValue(
          await this.getProcessCellParameterValue(this.processCell.path, this.row?.values)?.SelectedChoice
        )
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_SelectedChoice'].setValidators(null);
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_SelectedChoice'].patchValue()
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
    if (control.value === '' || control.value === undefined ) {
      validationMap['required'] = true;
      return validationMap;
    }

    return null;
  }
}

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.row && changes.processCell) {

      if (this.processCell.path) { this.path = this.processCell.path; }
      this.optionsArray = this.row?.definition?.specificTypeInformationObject?.PossibleChoices.map(el => {
        return { value: el, name: el };
      });
      const cPC = this.checkProcessCell(this.processCell, this.row?.values);
      this.selectedChoice = (cPC ? cPC.value.SelectedChoice : null);
    } else if (this.uniqueValues && changes) {
      window.setTimeout(() => {
        const cPC = this.checkProcessCell(this.processCell, this.row?.values);
        this.selectedChoice = (cPC ? cPC.value.SelectedChoice : null);
      })

    }

    if (changes.uniqueValues && changes.uniqueValues.currentValue === true) {
      this.duplicateFieldValue();
    }

    if(changes.disabled){
      this.updateValidation(this.disabled, this.formGroup);
    }

    if(this.optionsArray && this.selectedChoice){
      this.getNgModel = this.getNgModelFunction();
    }
  }

  getNgModelFunction() {
    let ret
    if(this.readonly) {
      ret = (this.selectedChoice ? this.selectedChoice.value : null);
    } else {
      if (this.disabled) {
        ret = null;
      } else {
        ret = (this.selectedChoice ? this.selectedChoice.value : null);
      }
    }
    return ret;
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

  duplicateFieldValue() {
    if (this.disabled === false) { this.selectedChoice = this.checkProcessCell(this.processCell, this.row?.values).value.SelectedChoice;

    }
  }

  selectChanged(value) {
    if(this.uniqueValues===true) {

      this.row.values.map(el => {
        el.value.SelectedChoice = value;
        const processCellPath = el.processCellPath.replaceAll('.','');
        this.formGroup.controls[this.parameterDefinitionName + '_' + processCellPath + '_SelectedChoice'].patchValue(value);
        this.selectedChoice = value;
        this.updateValidation(this.disabled, this.formGroup);
      })
    } else {
      this.row.values.find(el => el.processCellPath === this.processCell.path).value.SelectedChoice = value;
      this.formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_SelectedChoice'].patchValue(value);
      this.updateValidation(this.disabled, this.formGroup);
    }
    // this.row.values.find(el => el.processCellPath === this.processCell.path).value.SelectedChoice = value;
    this.emitChange.emit(true);
    this.touched.emit(true)
  }

  checkProcessCell(selectedProcessCell, processCellsArray) {
    if (processCellsArray) {
      const found = processCellsArray.find(el => el.processCellPath === selectedProcessCell.path);
      return found;
    }
  }

}
