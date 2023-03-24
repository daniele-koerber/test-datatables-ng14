import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-material-select',
  templateUrl: './material-select.component.html',
  styleUrls: ['./material-select.component.scss'],
})
export class MaterialSelectComponent implements OnChanges {

  @Output() selectionChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() optionsArray: any[] = [];
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

    let ret;
    if (this.readonly) {
      ret = (this.selectedChoice ? this.selectedChoice : '');
    } else {
      if (this.disabled) {
        ret = '';
      } else {

        ret = (this.selectedChoice ? this.selectedChoice : '');
      }
    }
    // return +ret;
    // removed number casting due "quality-type-parameter" is string.
    // duplicate component and split if another component starts giving problems
    return ret;
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.optionsArray && this.optionsArray.length){
      this.getNgModel = this.getNgModelFunction();
    }
  }

}
