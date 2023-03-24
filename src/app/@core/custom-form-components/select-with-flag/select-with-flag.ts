import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';


@Component({
  selector: 'select-with-flag',
  styleUrls: ['./select-with-flag.scss'],
  template: `
    <hr />
    <div class="row">

      <div class="col-sm-6 title">
        <div>
          <p [class]=" isError ? 'danger' : 'success' ">{{ to.name }}</p>
          <span class="hint-text" *ngIf=" to?.hint !== undefined && to?.hint !== '' ">{{ to.hint }}</span>
        </div>
      </div>
      <div class="col-sm-6">

        <mat-form-field >
          <mat-label>{{ 'SHARED.Select' | translate }}</mat-label>
          <mat-select (selectionChange)="onClick($event)" [disabled]="to.disabled" [value]=" formControl.value ">
            <mat-option *ngFor="let option of to.options" [value]=" option.value ">{{ option.label }}</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- <div *ngFor="let option of to.options">
          <label>
            <input type="radio" (change)="onClick($event, option.value)"
              [name]="field.key"
              [formControl]="formControl"
              [formlyAttributes]="field"
              [value]="option.value">

            <span class="design"></span>
            <span class="text">{{ option.label }}</span>

          </label>
        </div> -->
      </div>
    </div>
  `,
})
export class SelectWithFlag extends FieldType implements OnInit {

  isError: boolean;
  valueOk

  // constructor() {
  //   super();
  //   this.valueOk = this.formControl.value;
  // }

  ngOnInit() {
    this.valueOk = this.formControl.value;
  }


  onClick(ev) {
    this.isError = ev.value !== this.valueOk;
    this.formControl.setValue(ev.value);
  }

}
