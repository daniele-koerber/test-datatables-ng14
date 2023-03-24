import { ContentChild, Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-kds-tab-item'
})
export class TabItemDirective {
  @ContentChild('title') title: TemplateRef<any>;
  @ContentChild('icon') icon: TemplateRef<any>;
  @Input() active: boolean = false;
  @Input() disabled: boolean = false;

  constructor() {
  }
}
