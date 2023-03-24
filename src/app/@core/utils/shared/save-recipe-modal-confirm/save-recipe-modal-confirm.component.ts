
import { Component} from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-save-recipe-modal-confirm',
  styleUrls: ['./save-recipe-modal-confirm.component.scss'],
  templateUrl: './save-recipe-modal-confirm.component.html',
})

export class SaveRecipeModalConfirmComponent {


  updatePlannedBatches = false;
  closeMode = 0; // 0 = cancel; 1 = no update; 2 = updatePlannedBatches

  constructor(
    protected ref: NbDialogRef<SaveRecipeModalConfirmComponent>,
  ) {}

  cancel() {
    this.closeMode = 0;
    this.ref.close(this.closeMode);
  }

  submit() {
    this.updatePlannedBatches ? this.closeMode = 2 : this.closeMode = 1 
    this.ref.close(this.closeMode);
  }

  updateOPB(event) {
    this.updatePlannedBatches = event.checked;
  }


}
