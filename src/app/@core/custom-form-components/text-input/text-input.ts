import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';


@Component({
  selector: 'text-input',
  styleUrls: ['./text-input.scss'],
  template: `
    <hr />
    <div class="row">

      <div class="col-sm-6 title">
        <div>
          <p [class]=" !hasErrors ? 'success' : 'danger' ">
            <label [for]="field.key" style="margin-bottom: 0;">{{ to.label }}</label>
          </p>
          <span class="hint-text" *ngIf=" to?.hint !== undefined && to?.hint !== '' ">{{ to.hint }}</span>
        </div>
      </div>
      <mat-form-field >
        <!-- <mat-label *ngIf=" to?.hint !== undefined && to?.hint !== '' ">{{to.hint}}</mat-label> -->
        <input matInput #input (input)="onChange($event)" [maxlength]="to?.length" [formControl]="formControl" [formlyAttributes]="field"
        [type]="to.type" [id]="field.key" [name]="field.key" [pattern]="to?.validationpattern">
        <!-- <mat-hint *ngIf=" to?.hint !== undefined && to?.hint !== '' " align="end">{{to.hint}}</mat-hint> -->
      </mat-form-field>


      <!-- <div class="col-sm-3 content">
        <input #input (change)="onChange($event)" [formControl]="formControl" [formlyAttributes]="field"
        maxlength="to.max" [type]="to.type" [id]="field.key" [name]="field.key">
      </div> -->


    </div>
  `,
})
export class TextInput extends FieldType implements OnInit {

  hasErrors: boolean = true;

  constructor() {
    super();

  }

  ngOnInit() {
    const val = this.formControl.value;
    if (val) {
      if (!new RegExp(this.to?.validationpattern).test(val)) {
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
    if (!new RegExp(this.to?.inputpattern).test(this.formControl.value)) {
      this.formControl.setValue(this.formControl.value.substring(0, this.formControl.value.length - 1));
    }

    const val = this.formControl.value;
    if (!new RegExp(this.to?.validationpattern).test(val) || val === '') {
      this.hasErrors = true;
      ev.target.classList.add('input-with-errors');
    } else {
      this.hasErrors = false;
      ev.target.classList.remove('input-with-errors');
    }
  }

}
