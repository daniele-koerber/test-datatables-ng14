import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-buttons-toggle',
  templateUrl: './buttons-toggle.component.html',
  styleUrls: ['./buttons-toggle.component.scss'],
})
export class ButtonsToggleComponent {

  @Input() defaultValue: boolean;
  @Input() optionsArray: any[];
  @Output() change: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() disableButtons: boolean = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
  }

  emitChange(value) {
    this.change.emit(value);
  }

}
