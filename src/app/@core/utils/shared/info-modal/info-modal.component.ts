import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-info-modal',
  styleUrls: ['./info-modal.component.scss'],
  templateUrl: './info-modal.component.html',
})

export class InfoModalComponent {

  @Input() title = 'Delete Item';
  @Input() message = 'Are you sure you want to delete this item?';

  @Input() leftButton = 'No';
  @Input() rightButton = 'Yes';

  @Input() neverButton = '';
  neverCheck: boolean = false;

  constructor(
    protected ref: NbDialogRef<InfoModalComponent>,
  ) {}

  submit(response) {
    this.ref.close({
      response: response,
      never: this.neverCheck,
    });
  }

}
