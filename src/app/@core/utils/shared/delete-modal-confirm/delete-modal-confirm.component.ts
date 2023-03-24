import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-delete-modal-confirm',
  styleUrls: ['./delete-modal-confirm.component.scss'],
  templateUrl: './delete-modal-confirm.component.html',
})

export class DeleteModalConfirmComponent {

  @Input() title = 'Delete Item';
  @Input() message = 'Are you sure you want to delete this item?';

  constructor(
    protected ref: NbDialogRef<DeleteModalConfirmComponent>,
  ) {}

  cancel() {
    this.ref.close();
  }

  submit() {
    this.ref.close(true);
  }

}
