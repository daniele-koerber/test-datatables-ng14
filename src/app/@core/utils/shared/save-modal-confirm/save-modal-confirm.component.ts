import { Component,Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-save-modal-confirm',
  styleUrls: ['./save-modal-confirm.component.scss'],
  templateUrl: './save-modal-confirm.component.html',
})

export class SaveModalConfirmComponent {
  @Input() isPlanConfirmation = false;

  constructor(
    protected ref: NbDialogRef<SaveModalConfirmComponent>,
  ) {}

  cancel() {
    this.ref.close();
  }

  submit() {
    this.ref.close(true);
  }

}
