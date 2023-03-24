import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-material-select-parameters',
  templateUrl: './material-select-parameters.component.html',
  styleUrls: ['./material-select-parameters.component.scss'],
})
export class MaterialSelectParametersComponent implements OnChanges {

  @Output() selectionChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() optionsArray: any[];
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() selectedChoice: { value: any, name: string} // any = null;
  @Input() hideChoiceZero = false;
  @Input() defaultVoidMenuVoice;

  defaultValue;
  getNgModel

  constructor() {
  }

  selectionChange(value) {
    this.selectionChanged.emit(value);
  }

  getNgModelFunction() {

    let ret
    if(this.readonly) {
      ret = (this.selectedChoice ? this.selectedChoice : null);
    } else {
      if (this.disabled) {
        ret = null;
      } else {

        ret = (this.selectedChoice ? this.selectedChoice : null);
      }
    }

    return +ret;
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.optionsArray && this.selectedChoice){
      this.getNgModel = this.getNgModelFunction();

    }
  }

}
