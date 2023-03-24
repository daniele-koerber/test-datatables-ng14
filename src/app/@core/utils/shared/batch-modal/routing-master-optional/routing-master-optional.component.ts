import { Component, Input, OnChanges, Output, EventEmitter, OnInit, SimpleChanges, forwardRef } from '@angular/core';
// import { FormBuilder, FormGroup, FormControl, FormGroupDirective, Validators, AbstractControl, NG_VALUE_ACCESSOR} from '@angular/forms';


import { ConfigService } from '../../../../../@core/utils/services/config.service';
import { ConfigurationData } from '../../../../../@core/data/configuration';

interface vObj {
  [s: string]: boolean;
}

@Component({
  selector: 'ngx-routing-master-optional',
  styleUrls: ['./routing-master-optional.component.scss'],
  templateUrl: './routing-master-optional.component.html',

  // providers: [
  //   {
  //     provide: NG_VALUE_ACCESSOR,
  //     useExisting: forwardRef(() => RoutingMasterOptionalComponent),
  //     multi: true
  //   }
  // ]
})

export class RoutingMasterOptionalComponent implements OnChanges {

  // @Input() changed = 0;
  // @Input() row: any;
  // @Input() disabled: boolean;
  // @Input() readonly: boolean = false;
  // @Input() uniqueValues: boolean = false;

  @Input() processCell: any;
  @Input() batchParameter: any;

  // @Input() definition: any;
  @Output() emitChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Input() formGroup: FormGroup;
  // @Input() firstEnabledProcessCell;
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
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.waitConfigurationServiceLoaded();
    }
  }


  getProcessCellParameterValue(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value.value : '');
  }

  selectChanged(value) {
    this.batchParameter.value.SelectedDestinations = value;
    this.emitChange.emit(true)
  }

  getProcessCellParameter(path, array) {
    const value = array.find(el => el.processCellPath === path);
    return ( value ? value : {});
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

  updateTargetProcessCellData() {

    this.machinesArray = this.configurationService.getMachines(this.processCell.processCellPath);
    this.parameterDefinitionName = this.batchParameter.parameterDefinitionName;
    this.path = this.processCell.path.split('.').join("");
    const SelectedDestinations = this.batchParameter.value.SelectedDestinations.map(el =>
      { return el}
    );
    const MasterDestination = {
      name:this.machinesArray.find(m=>m.path === this.batchParameter.specificTypeInformation.MasterDestination).name,
      value: this.batchParameter.specificTypeInformation.MasterDestination,
      disabled: true
    }
    const OptionalDestinations = this.batchParameter.specificTypeInformation.OptionalDestinations.map(el =>
      { return {name:this.machinesArray.find(m=>m.path === el).name, value: el}}
    );
    this.selectedChoices = [...SelectedDestinations];

    this.optionsArray = [MasterDestination, ...OptionalDestinations];
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
