import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'ngx-quality-check-modal-form',
  styleUrls: ['./quality-check-modal-form.component.scss'],
  templateUrl: './quality-check-modal-form.component.html',
})

export class QualityCheckFormModalComponent implements OnInit {

  @Input() qualityCheck: any;
  @Input() row: any;

  constructor(
  ) { }

  ngOnInit() {
    const form = this.row.form.form;
  }

}
