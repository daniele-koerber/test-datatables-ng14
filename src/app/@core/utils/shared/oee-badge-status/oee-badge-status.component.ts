import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-oee-badge-status',
  templateUrl: './oee-badge-status.component.html',
  styleUrls: ['./oee-badge-status.component.scss']
})
export class OeeBadgeStatusComponent implements OnChanges {

  @Input() status: string = null;

  badgeStatus: string = null;

  constructor() {
  }

 

  ngOnChanges(changes: SimpleChanges): void {

     if (changes?.status?.currentValue) {
      window.setTimeout(() => {
        this.badgeStatus = changes?.status?.currentValue; // the value status is assigned to another value because otherwise the html doesn't recognise the changes
      });
     }
  }


}
