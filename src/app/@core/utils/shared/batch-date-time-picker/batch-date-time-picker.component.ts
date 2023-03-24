import { AfterViewInit, Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'ngx-batch-dt-picker',
  styleUrls: ['./batch-date-time-picker.component.scss'],
  templateUrl: './batch-date-time-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class BatchDateTimePickerComponent implements OnChanges {

  // @Input() dateInput;
  @Input() dateInput;
  dateInputValue;
  @Input() readonly;
  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();
  valueInitialized = false;

  // dateTimePicker

  constructor(
    private cd: ChangeDetectorRef
  ) {

  }
  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.dateInput?.firstChange) {
      this.valueInitialized = true;
    }

  }

  dateChanged(value) {
    if (this.dateInput !== value) {
      this.dateInput = value;
      this.dateChange.emit(this.dateInput);
    }
  }

}
