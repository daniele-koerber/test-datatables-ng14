import { Component, Input, OnChanges, Output, EventEmitter, OnInit, SimpleChanges, forwardRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormGroupDirective, Validators, AbstractControl, NG_VALUE_ACCESSOR} from '@angular/forms';


import { ConfigService } from '../../../../../@core/utils/services/config.service';
import { ConfigurationData } from '../../../../../@core/data/configuration';

interface vObj {
  [s: string]: boolean;
}

@Component({
  selector: 'ngx-products-routing-parameter',
  styleUrls: ['./routing-parameter.component.scss'],
  templateUrl: './routing-parameter.component.html',

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProductsRoutingParameterComponent),
      multi: true
    }
  ]
})

export class ProductsRoutingParameterComponent implements OnChanges {

  @Input() changed = 0;
  @Input() row: any;
  @Input() disabled: boolean;
  @Input() readonly: boolean = false;
  @Input() uniqueValues: boolean = false;
  @Input() processCell: any;
  @Input() definition: any;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() touched: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() formGroup: FormGroup;
  @Input() firstEnabledProcessCell;
  parameterDefinitionName
  path
  showControl = false;

  optionsArray = [];
  selectedChoices: any;

  selectedProcessCell = null;
  machinesArray = [];
  possibleDestinations;
  possibleDestinationsArray;

  constructor(
    private configurationService: ConfigurationData,
    private config: ConfigService,
    private fb: FormBuilder,
    formGroup: FormGroupDirective,
  ) {
    this.formGroup = formGroup.control
  }

  customValidation(control: AbstractControl): { [key: string]: boolean } | null {

    let validationMap: vObj = {};
    if (control.value === '' || control.value === undefined ) {
      //validationMap['required'] = true; //GVA 09-03-2023 - Done in TTC - Controlled by BE
      return validationMap;
    }
    return null;
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.row && changes.processCell) {
      this.waitConfigurationServiceLoaded();
    }

    if(changes.disabled){
      this.updateValidation(this.disabled, this.formGroup);
    }
  }

  updateValidation(readonly, formGroup) {
    if(this.parameterDefinitionName && this.path){
      if(readonly === false && this.getProcessCellParameterValue(this.processCell.path, this.row?.values).SelectedDestinations) {
       // formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([Validators.required, this.customValidation]);  //GVA 09-03-2023 - Done in TTC - Controlled by BE
       formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators([ this.customValidation]);
      } else {
        formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].setValidators(null);
      }
      formGroup.get(this.parameterDefinitionName + '_' + this.path + '_formField').updateValueAndValidity();
      this.emitChange.emit(true)
    }

  }

  getProcessCellParameterValue(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value.value : '');
  }

  selectChanged(value) {
    this.row.values.find(el => el.processCellPath === this.processCell.path).value.SelectedDestinations = value;
    this.formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].patchValue(value);
    this.emitChange.emit(true)
    this.touched.emit(true)
  }

  getProcessCellParameter(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value : {});
  }

  getValidationColor(val) {
    if (val) {
      return this.config.returnValidationColor(val);
    }
  }

  checkProcessCell(selectedProcessCell, processCellsArray) {
    if (processCellsArray) {
      const found = processCellsArray.filter(el => {
        const isFound = el.processCellPath === selectedProcessCell.path;
        return isFound;
      });

      if (found && found[0]) {
        return found[0].value.SelectedDestinations;
      }
      return;
    }
  }

  async updateTargetProcessCellData() {
    this.parameterDefinitionName = this.row.parameterDefinitionName;
    this.path = this.processCell.path.split('.').join("");

    const formField = new FormControl(
      await this.getProcessCellParameterValue(this.processCell.path, this.row?.values).SelectedDestinations
      // , {  validators: [Validators.required, this.customValidation], }
      );
    await this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_formField', formField);
    await this.updateValidation(this.disabled, this.formGroup);
    // for(let name in this.formGroup.controls) {
    //   if(name.includes(this.parameterDefinitionName + '_' + this.path)) {
    //     console.log(name)
    //   }

    // }


    this.selectedProcessCell = await this.configurationService.getSelectedProcessCell();
    this.machinesArray = await this.configurationService.getMachines(this.processCell.processCellPath);

    const possibleDestinations = this.row.definition.specificTypeInformationObject.PossibleDestinations;

    if( this.processCell.path in possibleDestinations) {
      const possibleDestinationsArray = possibleDestinations[this.processCell.path];
      this.optionsArray = possibleDestinationsArray.map((el) => {
        const machine = this.machinesArray.find(machine => machine.path === el);
        if (machine) {
          return {
            value: el,
            name: machine.name,
          };
        }
      });
    }

    const choice = await this.checkProcessCell(this.processCell, this.row?.values)
    this.selectedChoices = choice
    this.formGroup.controls[this.parameterDefinitionName + '_' + this.path + '_formField'].patchValue(choice);

    // const formField = new FormControl(
    //   this.getProcessCellParameterValue(this.processCell.path, this.row?.values).SelectedDestinations, {
    //   validators: [Validators.required, this.customValidation],
    // });
    // this.formGroup.addControl(this.parameterDefinitionName + '_' + this.path + '_formField', formField);

    this.showControl = true;
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
