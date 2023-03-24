import { Component, Output, AfterContentChecked, EventEmitter } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'connected-checkbox',
  styleUrls: ['./connected-checkbox.scss'],
  template: `
    <div [hidden]="to.hidden">
      <label>
        <mat-checkbox (change)="onChange($event)" [disabled]="to.disabled" [checked]="to.defaultValue === 'checked'"
        [name]="field.key"> {{ to.label }}</mat-checkbox>
      </label>
    </div>
  `,
})
// tslint:disable-next-line: component-class-suffix
export class ConnectedCheckbox extends FieldType implements AfterContentChecked {

  // @Output() emitChange: EventEmitter<any> = new EventEmitter<any>();

  hidden: boolean = false;
  checked: boolean = false;

  ngAfterContentChecked() {
    this.checkConnectedElements();
  }

  onChange(ev) {
    // this.emitChange.emit(this.to)
    this.to.checked = (ev.checked ? true : false);

    this.to.value = (ev.checked === true ? 1 : 0)
    this.field.formControl.setValue(ev.checked === true ? 1 : 0);
  }

  checkConnectedElements() {
    let thisHidden = true;
    let thisChecked = false;

    if(this.to.connectedElements && this.to.connectedElements !== null  && this.to.connectedElements.length > 0) {
      this.to.connectedElements.forEach(e => {
        const el: any = this.form.controls[e];

        thisHidden = ((el && el.errors === null) ? thisHidden : false);
        thisChecked = (this.to.value === true || this.to.value === 'true' ? true : false);
      })
      this.to.hidden = thisHidden;
      this.to.checked = thisChecked;

    }
  }

}
