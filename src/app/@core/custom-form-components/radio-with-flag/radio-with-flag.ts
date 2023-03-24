import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'radio-with-flag',
  styleUrls: ['./radio-with-flag.scss'],
  template: `
    <hr />
    <div class="row">

      <div class="col-sm-6 title">
        <div>
          <p [class]=" +formControl.value === 0 ? 'danger' : 'success' ">{{ to.name }}</p>
          <span class="hint-text" *ngIf=" to?.hint !== undefined && to?.hint !== '' ">{{ to.hint }}</span>
        </div>

      </div>
      <div *ngIf=" to?.reference !== undefined && to?.reference !== '' " class="col-sm-3" style="display: flex;align-items: center;">
        <div class="row" >
          <div class="col-sm-12">{{to?.reference}} {{to?.um}}</div>
        </div>
      </div>
      <div class="col-sm-3">
        <mat-radio-group
            aria-labelledby="example-radio-group-label"
            class="flex-radio-group"
            [formControl]="formControl"
            (change)="onClick($event)">
            <mat-radio-button class="radio-button" *ngFor="let option of to.options" [formlyAttributes]="field"  [value]="option.value">
              {{option.label}}
            </mat-radio-button>
          </mat-radio-group>
      </div>

  `,
})
// tslint:disable-next-line: component-class-suffix
export class RadioWithFlag extends FieldType implements OnInit {

  ngOnInit(){
    const val = +this.to.value;
    if (!!val === false) {
      this.formControl.setErrors({value: true});
    } else {
      this.formControl.setErrors(null);
    }
  }

  onClick(ev) {
    const val = +ev.value;
    if (val === 0) {
      this.formControl.setErrors({value: true});
    } else {
      this.formControl.setErrors(null);
    }

  }

}
