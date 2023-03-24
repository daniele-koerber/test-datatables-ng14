import { Component, Input, OnChanges, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators, FormGroup, FormControl, FormGroupDirective, AbstractControl } from '@angular/forms';

import { ConfigurationData } from '../../../../../@core/data/configuration';

interface vObj {
  [s: string]: boolean;
}
@Component({
  selector: 'ngx-calendar-routing-parameter',
  styleUrls: ['./routing-parameter.component.scss'],
  templateUrl: './routing-parameter.component.html',
})

export class CalendarRoutingParameterComponent implements OnChanges, OnInit {

  @Input() changed = false;
  @Input() row: any;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() uniqueValues: boolean = false;
  @Input() processCellPath: string;
  @Input() unitPath: string;
  @Input() formGroup: FormGroup;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  optionsArray = [];
  selectedChoices: any;

  selectedProcessCell = null;
  machinesArray = [];
  possibleDestinations;
  possibleDestinationsArray;

  parameterDefinitionName;
  path

  constructor(
    formGroup: FormGroupDirective,
    private configurationService: ConfigurationData,
  ) {
    this.formGroup = formGroup.control;
  }

  ngOnInit(){
    this.parameterDefinitionName = this.row.parameterName;
    this.path = this.processCellPath.split('.').join("");
    const formField = new FormControl(
      this.row?.value.SelectedDestinations
    );
    this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_formField', formField);
    this.setValidation(this.readonly, this.formGroup);

  }

  customValidation(control: AbstractControl): { [key: string]: boolean } | null {
    let validationMap: vObj = {};
  //GVA 09-03-2023 - Done in TTC - Validation done by BE
    if (control.value.length === 0 || control.value === '' || control.value === undefined ) {
     // validationMap['required'] = true;
      return validationMap;
    }
    return null;
  }

  setValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && this.row?.value !== undefined) {
        formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([this.customValidation]);
      } else {
        formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators(null);
      }
      formGroup.get(this.parameterDefinitionName + '_' + this.path + '_formField').updateValueAndValidity();
    }
  }

  async updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && this.row?.value !== undefined) {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([this.customValidation]);
      } else {
        await formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators(null);
      }
      await formGroup.get(this.parameterDefinitionName + '_' + this.path + '_formField').updateValueAndValidity();

        this.emitChange.emit(true);


    }
  }

  getProcessCellParameterValue(path, el) {
    return ( el ? el.value : '');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.row && this.unitPath) {
      this.waitConfigurationServiceLoaded();
    }
  }

  selectChanged(event) {
    this.row.value.SelectedDestinations = event;
    this.formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].patchValue(event);
    this.updateValidation(this.readonly, this.formGroup)
    this.emitChange.emit(true)
  }

  checkProcessCell(path, destinations) {

    if (destinations) {
      const found = destinations.filter(el => {
        const found = el.includes(path);
        return found;
      });

      if(found && found[0]){
        return found[0];
      }
      return;
    }
  }

  updateTargetProcessCellData() {
    const path = this.unitPath.slice(0, -4);

    this.selectedProcessCell = this.configurationService.getSelectedProcessCell();
    this.machinesArray = this.configurationService.getMachines(path);
    const possibleDestinations = this.row.specificTypeInformation.PossibleDestinations;
    if(path in possibleDestinations){
      const possibleDestinationsArray = possibleDestinations[path];
      this.optionsArray = possibleDestinationsArray.map((el) => {
        const machine = this.machinesArray.find(machine => machine.path === el);
        if(machine) {
          return {
            value: el,
            name: machine.name,
          };
        }
      });
    }
    this.selectedChoices = [];
    const selectedDestinations = this.row?.value.SelectedDestinations;

    selectedDestinations.map(dest=>{
      const found = this.optionsArray.find(opt=>dest === opt.value);
      if(found) {
        // this.selectedChoices.push({value: dest, name: found.name});
        this.selectedChoices.push(dest);
      }
    })
    // this.selectedChoices = this.checkProcessCell(path, this.row?.value.SelectedDestinations);

  }

  /**
   * LISTENERS
   */

  listenForSelectedProcessCellChanges() {
    this.configurationService.hasSelectedProcessCellChanged.subscribe(selectedProcessCell => {
      if ( selectedProcessCell !== undefined) {
        this.updateTargetProcessCellData();
      }
    });
  }

  waitConfigurationServiceLoaded() {
    this.configurationService.hasComponentLoaded.subscribe(loaded => {
      if (loaded === true) {
        this.updateTargetProcessCellData();
      }
    });
  }

}
