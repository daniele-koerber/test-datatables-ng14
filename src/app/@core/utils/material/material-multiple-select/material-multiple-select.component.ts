import { Component, EventEmitter, Output, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ngx-material-multiple-select',
  templateUrl: './material-multiple-select.component.html',
  styleUrls: ['./material-multiple-select.component.scss'],
})
export class MaterialMultipleSelectComponent implements OnInit {

  @Output() selectChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() optionsArray: any[];
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() showLabel: boolean = true;
  @Input() selectedChoices: any = null;

  badgeHidden = true;
  badgeNumber = 0;

  selectedProcessCell = null;
  machinesArray = [];

  constructor() {
  }

  ngOnInit() {
    if(this.selectedChoices){
      this.badgeHidden = this.selectedChoices.length < 2 ? true : false;
      this.badgeNumber = this.selectedChoices.length;
    }
  }

  selectionChange(value) {
    this.selectChanged.emit(value);
    this.badgeHidden = this.selectedChoices.length < 2 ? true : false;
    this.badgeNumber = this.selectedChoices.length;
  }

}
