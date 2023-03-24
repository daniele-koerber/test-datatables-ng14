import { ContentChildren, Directive, QueryList } from '@angular/core';
import { TabItemDirective } from './tab-item.directive';

@Directive({
  selector: 'ng-kds-tab-container'
})
export class TabsItemsDirective {
  @ContentChildren(TabItemDirective, {descendants: true}) public items: QueryList<TabItemDirective>;

  constructor() {
  }
}
