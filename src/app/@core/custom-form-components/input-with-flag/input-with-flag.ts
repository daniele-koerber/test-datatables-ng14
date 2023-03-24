import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({

  selector: 'input-with-flag',
  styleUrls: ['./input-with-flag.scss'],
  template: `
    <hr />
    <div class="row">

      <div class="col-sm-6 title">
        <div>
          <p [class]=" formControl.errors === null ? 'success' : 'danger' ">
            <label [for]="field.key" >{{ to.label }}</label>
          </p>
          <span class="hint-text" *ngIf=" to?.hint !== undefined && to?.hint !== '' ">{{ to.hint }}</span>
        </div>
      </div>

      <div class="col-sm-3 content">
        <input #input (change)="onChange($event)" [formControl]="formControl" [formlyAttributes]="field"
        [attr.data-min]="to.min" [attr.data-max]="to.max" [type]="to.type" [id]="field.key" [name]="field.key">
        {{ to.um }}
      </div>

      <div class="col-sm-3">
        <div class="row">
          <div class="col-sm-6">Min</div><div class="col-sm-6">{{ to.min }}{{ to.um }}</div>
        </div>
        <div class="row">
          <div class="col-sm-6">SP</div><div class="col-sm-6">{{ to.sp }}{{ to.um }}</div>
        </div>
        <div class="row">
          <div class="col-sm-6">Max</div><div class="col-sm-6">{{ to.max }}{{ to.um }}</div>
        </div>
      </div>

    </div>
  `,
})

// tslint:disable-next-line: component-class-suffix
export class InputWithFlag extends FieldType implements OnInit {
  @Input() qualityCheck: any;

  constructor(private myElement: ElementRef) {
    super();
  }

  ngOnInit() {
    var minValue = this.to.min;
    var maxValue = this.to.max;
    var value = this.to.value;
    if (+value < +minValue || +value > +maxValue) {
      this.myElement.nativeElement.querySelector('input').classList.add('input-with-errors');
      this.formControl.setErrors({value: true});
      console.log(this.to, this.formControl)
    }else{
      this.formControl.setErrors(null);
    }
  }

  onChange(ev) {
    const val = +ev.target.value;
    if (+val < +this.to.min || +val > +this.to.max) {
      ev.target.classList.add('input-with-errors');
    } else {
      ev.target.classList.remove('input-with-errors');
    }
  }
}
