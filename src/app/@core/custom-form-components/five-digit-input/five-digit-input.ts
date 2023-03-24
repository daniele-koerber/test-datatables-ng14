import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';


@Component({
  selector: 'five-digit-input',
  styleUrls: ['./five-digit-input.scss'],
  template: `
    <hr />
    <div class="row">

    <div class="col-sm-6 title">
        <p [class]=" !hasErrors ? 'success' : 'danger' ">
          <label [for]="field.key" >{{ to.label }}</label>
        </p>
      </div>
      <mat-form-field >
        <!-- <mat-label>Licence Plate</mat-label> -->
        <input matInput #input (input)="onChange($event)" [maxlength]="to.length" [formControl]="formControl" [formlyAttributes]="field"
        [type]="to.type" [id]="field.key" [name]="field.key" [pattern]="to.pattern">
        <mat-hint *ngIf=" to?.length !== undefined && to?.length !== '' " align="end">{{input.value.length}} / {{to.length}}</mat-hint>
      </mat-form-field>


      <!-- <div class="col-sm-3 content">
        <input #input (change)="onChange($event)" [formControl]="formControl" [formlyAttributes]="field"
        maxlength="to.max" [type]="to.type" [id]="field.key" [name]="field.key">
      </div> -->


    </div>
  `,
})
export class FiveDigitInput extends FieldType implements OnInit {

  hasErrors: boolean = true;

  constructor() {
    super();
  }

  ngOnInit() {
    const val = this.formControl.value;
    if (val) {
      if (!new RegExp(this.to.pattern).test(val)) {
        this.hasErrors = true;
        this.formControl.setErrors({value: true});
      } else {
        this.hasErrors = false;
        this.formControl.setErrors(null);
      }
    } else {
      this.hasErrors = true;
      this.formControl.setErrors({value: true});
    }
  }

  onChange(ev) {
    this.formControl.setValue(this.formControl.value.replace(/[^\d]/, ''));
    const val = this.formControl.value;
    if (!new RegExp(this.to.pattern).test(val)) {
      this.hasErrors = true;
      ev.target.classList.add('input-with-errors');
    } else {
      this.hasErrors = false;
      ev.target.classList.remove('input-with-errors');
    }
  }
}
