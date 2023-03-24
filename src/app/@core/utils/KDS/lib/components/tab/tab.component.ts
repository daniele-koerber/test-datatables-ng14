import { Component, ContentChild, OnChanges, SimpleChanges, Output, EventEmitter, Input } from '@angular/core';
import {TabsItemsDirective} from './directives/tab-items.directive';

@Component({
  selector: 'ng-kds-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class NGKDSTabComponent implements OnChanges {

  @ContentChild(TabsItemsDirective) public tabItems: TabsItemsDirective;
  @Output() change: EventEmitter<number> = new EventEmitter<number>();
  @Input() disabled: boolean;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {

  }

  emitClick(index:number) {
    this.change.emit(index);
  }

}
