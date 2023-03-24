import { Input, Component } from '@angular/core';

@Component({
  selector: 'ng-kds-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class NGKDSButtonComponent {

  @Input() color: string = '';
  constructor() { }

}
